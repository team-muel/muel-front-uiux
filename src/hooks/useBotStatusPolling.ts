import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../config';
import { trackBenchmarkEvent } from '../lib/benchmarkTracker';
import { toReconnectResultFromStatus } from '../lib/reconnectTelemetry';
import { type BotStatusApiResponse } from '../types/botStatus';

const BOT_STATUS_REFRESH_MS = 15000;
const BOT_STATUS_REFRESH_BACKOFF_MS = 45000;
const BOT_STATUS_STALE_AFTER_MS = 90000;

const toElapsedText = (diffMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  if (totalSeconds < 60) {
    return `${totalSeconds}s ago`;
  }

  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes}m ago`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  return `${totalHours}h ago`;
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

const toBotPollDelayMs = (nextCheckInSec?: number) => {
  if (!Number.isFinite(nextCheckInSec)) {
    return BOT_STATUS_REFRESH_MS;
  }

  const sec = Math.max(10, Math.min(120, Number(nextCheckInSec)));
  return sec * 1000;
};

interface UseBotStatusPollingParams {
  presetKey: string;
  visible: boolean;
  nowMs: number;
}

export const useBotStatusPolling = ({ presetKey, visible, nowMs }: UseBotStatusPollingParams) => {
  const [botStatus, setBotStatus] = useState<BotStatusApiResponse | null>(null);
  const [botStatusError, setBotStatusError] = useState<string | null>(null);
  const [lastBotSyncedAt, setLastBotSyncedAt] = useState<string | null>(null);
  const [botRefreshDelayMs, setBotRefreshDelayMs] = useState(BOT_STATUS_REFRESH_MS);
  const [botActionMessage, setBotActionMessage] = useState<string | null>(null);
  const [isBotReconnectPending, setIsBotReconnectPending] = useState(false);

  const botRefreshDelayRef = useRef(BOT_STATUS_REFRESH_MS);
  const previousBotHealthyRef = useRef<boolean | null>(null);
  const previousBotStatusErrorRef = useRef<string | null>(null);

  const botSyncElapsedText = useMemo(() => {
    if (!lastBotSyncedAt) {
      return '-';
    }

    const syncedAtMs = Date.parse(lastBotSyncedAt);
    if (!Number.isFinite(syncedAtMs)) {
      return '-';
    }

    return toElapsedText(nowMs - syncedAtMs);
  }, [lastBotSyncedAt, nowMs]);

  const botStatusKind = useMemo(() => {
    if (!botStatus) {
      return botStatusError ? 'error' : 'idle';
    }

    if (botStatusError) {
      return 'stale';
    }

    if (!lastBotSyncedAt) {
      return botStatus.healthy ? 'ok' : 'error';
    }

    const syncedAtMs = Date.parse(lastBotSyncedAt);
    if (!Number.isFinite(syncedAtMs)) {
      return botStatus.healthy ? 'ok' : 'error';
    }

    if (nowMs - syncedAtMs > BOT_STATUS_STALE_AFTER_MS) {
      return 'stale';
    }

    return botStatus.healthy ? 'ok' : 'error';
  }, [botStatus, botStatusError, lastBotSyncedAt, nowMs]);

  const botOutageElapsedText = useMemo(() => {
    if (!botStatus || botStatus.healthy || !botStatus.outageDurationMs) {
      return '0s';
    }

    return toElapsedText(botStatus.outageDurationMs).replace(' ago', '');
  }, [botStatus]);

  const fetchBotStatus = useCallback(async () => {
    try {
      const response = await apiFetch('/api/bot/status');
      if (response.status === 401 || response.status === 403) {
        setBotStatusError('FORBIDDEN');
        botRefreshDelayRef.current = BOT_STATUS_REFRESH_BACKOFF_MS;
        setBotRefreshDelayMs(BOT_STATUS_REFRESH_BACKOFF_MS);
        return false;
      }

      if (!response.ok) {
        setBotStatusError(getSyncErrorReason(response.status));
        botRefreshDelayRef.current = BOT_STATUS_REFRESH_BACKOFF_MS;
        setBotRefreshDelayMs(BOT_STATUS_REFRESH_BACKOFF_MS);
        return false;
      }

      const payload = (await response.json()) as BotStatusApiResponse;
      setBotStatus(payload);
      setBotStatusError(null);
      setLastBotSyncedAt(new Date().toISOString());
      const nextDelayMs = toBotPollDelayMs(payload.nextCheckInSec);
      botRefreshDelayRef.current = nextDelayMs;
      setBotRefreshDelayMs(nextDelayMs);
      return true;
    } catch {
      setBotStatusError('NETWORK');
      botRefreshDelayRef.current = BOT_STATUS_REFRESH_BACKOFF_MS;
      setBotRefreshDelayMs(BOT_STATUS_REFRESH_BACKOFF_MS);
      return false;
    }
  }, []);

  const triggerBotReconnect = useCallback(async () => {
    setIsBotReconnectPending(true);
    setBotActionMessage(null);
    trackBenchmarkEvent('bot_reconnect_ui_attempt', {
      presetKey,
      source: 'studio_panel',
    });
    try {
      const response = await apiFetch('/api/bot/reconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'studio_panel',
          idempotencyKey: `studio_panel:${presetKey}:${Date.now()}`,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok) {
        trackBenchmarkEvent('bot_reconnect_ui_failed', {
          presetKey,
          source: 'studio_panel',
          status: response.status,
          result: toReconnectResultFromStatus(response.status),
        });
        setBotActionMessage(payload.message || '봇 재연결 요청에 실패했습니다.');
        return;
      }

      trackBenchmarkEvent('bot_reconnect_ui_success', {
        presetKey,
        source: 'studio_panel',
      });
      setBotActionMessage(payload.message || '봇 재연결 요청을 전송했습니다.');
      await fetchBotStatus();
    } catch {
      trackBenchmarkEvent('bot_reconnect_ui_failed', {
        presetKey,
        source: 'studio_panel',
        status: 'NETWORK',
        result: 'failed',
      });
      setBotActionMessage('네트워크 문제로 봇 재연결 요청에 실패했습니다.');
    } finally {
      setIsBotReconnectPending(false);
    }
  }, [fetchBotStatus, presetKey]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    void fetchBotStatus();
  }, [fetchBotStatus, visible]);

  useEffect(() => {
    botRefreshDelayRef.current = BOT_STATUS_REFRESH_MS;
    setBotRefreshDelayMs(BOT_STATUS_REFRESH_MS);
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

        if (document.visibilityState !== 'visible' || !visible) {
          scheduleNext(botRefreshDelayRef.current);
          return;
        }

        await fetchBotStatus();
        scheduleNext(botRefreshDelayRef.current);
      }, delayMs);
    };

    scheduleNext(botRefreshDelayRef.current);

    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [fetchBotStatus, visible]);

  useEffect(() => {
    if (!botStatus) {
      return;
    }

    const currentHealthy = botStatus.healthy;
    const previousHealthy = previousBotHealthyRef.current;
    if (previousHealthy === null) {
      previousBotHealthyRef.current = currentHealthy;
      return;
    }

    if (previousHealthy !== currentHealthy) {
      trackBenchmarkEvent(currentHealthy ? 'bot_status_recovered' : 'bot_status_degraded', {
        presetKey,
        wsStatus: botStatus.bot?.wsStatus,
        reconnectAttempts: botStatus.bot?.reconnectAttempts,
        outageDurationMs: botStatus.outageDurationMs,
      });
    }

    previousBotHealthyRef.current = currentHealthy;
  }, [botStatus, presetKey]);

  useEffect(() => {
    const previousError = previousBotStatusErrorRef.current;
    if (previousError !== botStatusError) {
      if (botStatusError) {
        trackBenchmarkEvent('bot_status_poll_error', {
          presetKey,
          reason: botStatusError,
          pollMs: botRefreshDelayMs,
        });
      } else if (previousError) {
        trackBenchmarkEvent('bot_status_poll_recovered', {
          presetKey,
          previousReason: previousError,
          pollMs: botRefreshDelayMs,
        });
      }
      previousBotStatusErrorRef.current = botStatusError;
    }
  }, [botRefreshDelayMs, botStatusError, presetKey]);

  return {
    botStatus,
    botStatusError,
    lastBotSyncedAt,
    botRefreshDelayMs,
    botActionMessage,
    isBotReconnectPending,
    botSyncElapsedText,
    botStatusKind,
    botOutageElapsedText,
    fetchBotStatus,
    triggerBotReconnect,
    isBackoff: botRefreshDelayMs > BOT_STATUS_REFRESH_MS,
  };
};
