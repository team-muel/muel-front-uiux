import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../config';
import { type ResearchPresetKey } from '../content/researchContent';

const HISTORY_AUTO_REFRESH_MS = 30000;
const HISTORY_AUTO_REFRESH_BACKOFF_MS = 60000;

export type HistoryRow = {
  id: string;
  presetKey: string;
  actorUserId: string;
  actorUsername: string;
  source: string;
  payload: unknown;
  metadata?: unknown;
  createdAt: string;
};

const getSyncErrorReason = (status: number) => {
  if (status === 401) return 'AUTH';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 422) return 'INVALID_PAYLOAD';
  if (status === 503) return 'CONFIG';
  if (status >= 500) return 'SERVER';
  return 'REQUEST';
};

const formatRestoreError = (status: number, message?: string) => {
  if (status === 401) return '인증이 만료되었습니다. 다시 로그인 후 시도하세요.';
  if (status === 403) return '복원 권한이 없습니다. 관리자 allowlist를 확인하세요.';
  if (status === 404) return '선택한 이력 항목을 찾을 수 없습니다.';
  if (status === 422) return '선택한 스냅샷 payload 형식이 유효하지 않습니다.';
  if (status === 503) return '운영 설정이 준비되지 않았습니다. Supabase 또는 관리자 allowlist를 확인하세요.';
  return message || '복원 처리 중 오류가 발생했습니다.';
};

interface UsePresetHistoryPollingParams {
  presetKey: ResearchPresetKey;
  initialHistoryId?: string | null;
  onRestored?: () => void;
}

export const usePresetHistoryPolling = ({ presetKey, initialHistoryId, onRestored }: UsePresetHistoryPollingParams) => {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [restoringRowId, setRestoringRowId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [syncErrorReason, setSyncErrorReason] = useState<string | null>(null);
  const [autoRefreshDelayMs, setAutoRefreshDelayMs] = useState(HISTORY_AUTO_REFRESH_MS);

  const isFetchingHistoryRef = useRef(false);
  const autoRefreshDelayRef = useRef(HISTORY_AUTO_REFRESH_MS);

  const fetchHistory = useCallback(async (options?: { silent?: boolean }) => {
    if (isFetchingHistoryRef.current) {
      return true;
    }

    isFetchingHistoryRef.current = true;
    const isSilent = Boolean(options?.silent);
    if (!isSilent) {
      setLoading(true);
    }

    try {
      const historyLimit = initialHistoryId ? 100 : 20;
      const response = await apiFetch(`/api/research/preset/${presetKey}/history?limit=${historyLimit}`);
      if (response.status === 401 || response.status === 403 || response.status === 503) {
        setVisible(false);
        setSyncStatus('error');
        setSyncErrorReason(getSyncErrorReason(response.status));
        return false;
      }

      if (!response.ok) {
        setRows([]);
        setSyncStatus('error');
        setSyncErrorReason(getSyncErrorReason(response.status));
        return false;
      }

      const payload = (await response.json()) as { rows?: HistoryRow[] };
      setRows(Array.isArray(payload.rows) ? payload.rows : []);
      setVisible(true);
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('ok');
      setSyncErrorReason(null);
      autoRefreshDelayRef.current = HISTORY_AUTO_REFRESH_MS;
      setAutoRefreshDelayMs(HISTORY_AUTO_REFRESH_MS);
      return true;
    } catch {
      setRows([]);
      setSyncStatus('error');
      setSyncErrorReason('NETWORK');
      return false;
    } finally {
      isFetchingHistoryRef.current = false;
      if (!isSilent) {
        setLoading(false);
      }
    }
  }, [initialHistoryId, presetKey]);

  const restoreSnapshot = useCallback(
    async (historyId: string) => {
      setRestoringRowId(historyId);
      setRestoreError(null);

      try {
        const response = await apiFetch(`/api/research/preset/${presetKey}/restore/${historyId}`, {
          method: 'POST',
        });

        if (response.status === 401 || response.status === 403 || response.status === 503) {
          setVisible(false);
          return;
        }

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          setRestoreError(formatRestoreError(response.status, payload.error));
          return;
        }

        await fetchHistory();
        onRestored?.();
      } catch {
        setRestoreError('네트워크 연결 상태를 확인한 뒤 다시 시도하세요.');
      } finally {
        setRestoringRowId(null);
      }
    },
    [fetchHistory, onRestored, presetKey],
  );

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    autoRefreshDelayRef.current = HISTORY_AUTO_REFRESH_MS;
    setAutoRefreshDelayMs(HISTORY_AUTO_REFRESH_MS);
    let timeoutId: number | null = null;
    let cancelled = false;

    const scheduleNext = (delayMs: number) => {
      if (cancelled) {
        return;
      }

      timeoutId = window.setTimeout(async () => {
        if (cancelled) {
          return;
        }

        if (document.visibilityState !== 'visible' || restoringRowId !== null || !visible) {
          scheduleNext(HISTORY_AUTO_REFRESH_MS);
          return;
        }

        const ok = await fetchHistory({ silent: true });
        autoRefreshDelayRef.current = ok ? HISTORY_AUTO_REFRESH_MS : HISTORY_AUTO_REFRESH_BACKOFF_MS;
        setAutoRefreshDelayMs(autoRefreshDelayRef.current);
        scheduleNext(autoRefreshDelayRef.current);
      }, delayMs);
    };

    scheduleNext(autoRefreshDelayRef.current);

    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [fetchHistory, restoringRowId, visible]);

  return {
    rows,
    loading,
    visible,
    restoringRowId,
    restoreError,
    lastSyncedAt,
    syncStatus,
    syncErrorReason,
    autoRefreshDelayMs,
    isBackoff: autoRefreshDelayMs > HISTORY_AUTO_REFRESH_MS,
    setRestoreError,
    setVisible,
    fetchHistory,
    restoreSnapshot,
  };
};
