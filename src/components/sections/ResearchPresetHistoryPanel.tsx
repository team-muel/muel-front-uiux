import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SurfaceCard } from '../ui/SurfaceCard';
import { UiButton } from '../ui/UiButton';
import { type ResearchPresetKey } from '../../content/researchContent';
import { useReconnectBenchmarkSummary } from '../../hooks/useReconnectBenchmarkSummary';
import { useBotStatusPolling } from '../../hooks/useBotStatusPolling';
import { usePresetHistoryPolling, type HistoryRow } from '../../hooks/usePresetHistoryPolling';

const RESTORE_CONFIRM_TTL_MS = 5000;
const FOCUS_HIGHLIGHT_TTL_MS = 2600;
const SYNC_ELAPSED_TICK_MS = 1000;
const SYNC_STALE_AFTER_MS = 90000;
const RECENT_WINDOW_OPTIONS = [10, 30, 60] as const;
type RecentWindowMinutes = (typeof RECENT_WINDOW_OPTIONS)[number];
const RECENT_WINDOW_STORAGE_KEY = 'muel_research_history_recent_window_minutes';

const getStoredRecentWindowMinutes = (): RecentWindowMinutes => {
  if (typeof window === 'undefined') {
    return 10;
  }

  const raw = window.localStorage.getItem(RECENT_WINDOW_STORAGE_KEY);
  const numeric = Number(raw);
  return RECENT_WINDOW_OPTIONS.includes(numeric as RecentWindowMinutes)
    ? (numeric as RecentWindowMinutes)
    : 10;
};

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

const getActionLabel = (source: string) => {
  if (source === 'restore') return 'RESTORE';
  if (source === 'upsert') return 'UPSERT';
  return String(source || 'UNKNOWN').toUpperCase();
};

const getActionDescription = (source: string) => {
  if (source === 'restore') return '이전 스냅샷 기준으로 현재 프리셋을 복원한 작업';
  if (source === 'upsert') return '관리자 입력으로 프리셋을 직접 갱신한 작업';
  return '기록된 운영 변경 작업';
};

const getRestoredFromHistoryId = (metadata: unknown) => {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }

  const candidate = (metadata as Record<string, unknown>).restoredFromHistoryId;
  return typeof candidate === 'string' && candidate.trim() ? candidate : null;
};

const SUMMARY_KEYS = ['page', 'stepNav', 'core', 'hero', 'charts', 'data'] as const;

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const hasChanged = (current: unknown, previous: unknown) => {
  return JSON.stringify(current) !== JSON.stringify(previous);
};

type DiffEntry = {
  path: string;
  before: string;
  after: string;
};

const toDisplayString = (value: unknown) => {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const collectDiffEntries = (current: unknown, previous: unknown, basePath = ''): DiffEntry[] => {
  if (!hasChanged(current, previous)) {
    return [];
  }

  const currentIsRecord = isObjectRecord(current);
  const previousIsRecord = isObjectRecord(previous);

  if (currentIsRecord || previousIsRecord) {
    const currentRecord = currentIsRecord ? current : {};
    const previousRecord = previousIsRecord ? previous : {};
    const keys = Array.from(new Set([...Object.keys(currentRecord), ...Object.keys(previousRecord)])).sort();

    const nested = keys.flatMap((key) => {
      const nextPath = basePath ? `${basePath}.${key}` : key;
      return collectDiffEntries(currentRecord[key], previousRecord[key], nextPath);
    });

    if (nested.length) {
      return nested;
    }
  }

  const path = basePath || 'root';
  return [
    {
      path,
      before: toDisplayString(previous),
      after: toDisplayString(current),
    },
  ];
};

const getChangedKeys = (current: unknown, previous: unknown) => {
  const currentRecord = isObjectRecord(current) ? current : {};
  const previousRecord = isObjectRecord(previous) ? previous : {};

  return SUMMARY_KEYS.filter((key) => hasChanged(currentRecord[key], previousRecord[key]));
};

interface ResearchPresetHistoryPanelProps {
  presetKey: ResearchPresetKey;
  initialHistoryId?: string | null;
  onRestored?: () => void;
}

export const ResearchPresetHistoryPanel = ({ presetKey, initialHistoryId = null, onRestored }: ResearchPresetHistoryPanelProps) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [confirmRestoreRowId, setConfirmRestoreRowId] = useState<string | null>(null);
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const [recentWindowMinutes, setRecentWindowMinutes] = useState<RecentWindowMinutes>(() => getStoredRecentWindowMinutes());
  const [syncElapsedNow, setSyncElapsedNow] = useState(() => Date.now());
  const rowRefs = useRef<Record<string, HTMLElement | null>>({});
  const autoJumpHandledRef = useRef(false);

  const {
    rows,
    loading,
    visible,
    restoringRowId,
    restoreError,
    lastSyncedAt,
    syncStatus,
    syncErrorReason,
    autoRefreshDelayMs,
    isBackoff: isHistoryBackoff,
    setRestoreError,
    fetchHistory,
    restoreSnapshot,
  } = usePresetHistoryPolling({ presetKey, initialHistoryId, onRestored });

  const {
    summary: benchmarkSummary,
    errorReason: benchmarkSummaryError,
    successRate: reconnectSuccessRate,
    topReasons: topReconnectReasons,
    topSources: topReconnectSources,
    recent30m: reconnectRecent30m,
    lastResultText: reconnectLastResultText,
    refreshSummary: refreshBenchmarkSummary,
    isBackoff: isBenchmarkSummaryBackoff,
  } = useReconnectBenchmarkSummary({ visible, nowMs: syncElapsedNow });

  const {
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
    isBackoff: isBotStatusBackoff,
  } = useBotStatusPolling({ presetKey, visible, nowMs: syncElapsedNow });

  const syncElapsedText = useMemo(() => {
    if (!lastSyncedAt) {
      return '-';
    }

    const syncedAtMs = Date.parse(lastSyncedAt);
    if (!Number.isFinite(syncedAtMs)) {
      return '-';
    }

    return toElapsedText(syncElapsedNow - syncedAtMs);
  }, [lastSyncedAt, syncElapsedNow]);

  const syncDisplayKind = useMemo(() => {
    if (syncStatus === 'error') {
      return 'error';
    }

    if (!lastSyncedAt) {
      return syncStatus;
    }

    const syncedAtMs = Date.parse(lastSyncedAt);
    if (!Number.isFinite(syncedAtMs)) {
      return syncStatus;
    }

    return syncElapsedNow - syncedAtMs > SYNC_STALE_AFTER_MS ? 'stale' : syncStatus;
  }, [lastSyncedAt, syncElapsedNow, syncStatus]);

  const historySummary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        if (row.source === 'restore') {
          acc.restore += 1;
        } else if (row.source === 'upsert') {
          acc.upsert += 1;
        } else {
          acc.other += 1;
        }

        acc.total += 1;
        return acc;
      },
      { restore: 0, upsert: 0, other: 0, total: 0 },
    );
  }, [rows]);

  const recentSummary = useMemo(() => {
    const now = Date.now();
    const windowMs = recentWindowMinutes * 60 * 1000;

    return rows.reduce(
      (acc, row) => {
        const timestamp = Date.parse(row.createdAt);
        if (!Number.isFinite(timestamp) || now - timestamp > windowMs) {
          return acc;
        }

        if (row.source === 'restore') {
          acc.restore += 1;
        } else if (row.source === 'upsert') {
          acc.upsert += 1;
        }

        acc.total += 1;
        return acc;
      },
      { restore: 0, upsert: 0, total: 0 },
    );
  }, [recentWindowMinutes, rows]);

  useEffect(() => {
    if (!confirmRestoreRowId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setConfirmRestoreRowId((prev) => (prev === confirmRestoreRowId ? null : prev));
    }, RESTORE_CONFIRM_TTL_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [confirmRestoreRowId]);

  useEffect(() => {
    if (!focusedRowId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFocusedRowId((prev) => (prev === focusedRowId ? null : prev));
    }, FOCUS_HIGHLIGHT_TTL_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [focusedRowId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(RECENT_WINDOW_STORAGE_KEY, String(recentWindowMinutes));
  }, [recentWindowMinutes]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setSyncElapsedNow(Date.now());
    }, SYNC_ELAPSED_TICK_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const jumpToHistoryRow = useCallback((historyId: string) => {
    const target = rowRefs.current[historyId];
    if (!target) {
      setRestoreError('원본 이력 항목을 현재 목록에서 찾지 못했습니다. 이력 새로고침 후 다시 시도하세요.');
      return;
    }

    setExpandedRowId(historyId);
    setFocusedRowId(historyId);
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    autoJumpHandledRef.current = false;
  }, [initialHistoryId, presetKey]);

  useEffect(() => {
    if (!initialHistoryId || loading || !rows.length || autoJumpHandledRef.current) {
      return;
    }

    const found = rows.some((row) => row.id === initialHistoryId);
    if (found) {
      autoJumpHandledRef.current = true;
      setRestoreError(null);
      jumpToHistoryRow(initialHistoryId);
      return;
    }

    autoJumpHandledRef.current = true;
    setRestoreError('딥링크 이력 항목을 최근 100건 내에서 찾지 못했습니다. 이력 필터를 확인하거나 항목 ID를 다시 확인하세요.');
  }, [initialHistoryId, jumpToHistoryRow, loading, rows]);

  if (!visible) {
    return null;
  }

  return (
    <section id="preset-history" className="io-reveal section-emphasis-shell research-admin-shell">
      <SurfaceCard className="research-admin-card">
        <div className="research-admin-head">
          <div>
            <p className="chapter-overline">ADMIN PRESET HISTORY</p>
            <h2 className="chapter-title">프리셋 변경 이력</h2>
            <p className="chapter-desc">최근 변경 내역을 확인해 운영 이력을 추적합니다.</p>
            <div className="research-admin-window" role="tablist" aria-label="Recent history window">
              {RECENT_WINDOW_OPTIONS.map((minutes) => (
                <UiButton
                  key={minutes}
                  size="sm"
                  variant="tab"
                  active={recentWindowMinutes === minutes}
                  className="muel-interact"
                  onClick={() => setRecentWindowMinutes(minutes)}
                >
                  {minutes}m
                </UiButton>
              ))}
            </div>
            <div className="research-admin-summary" aria-label="History action summary">
              <span className="mono-data research-admin-summary-chip" data-kind="restore">
                RESTORE {historySummary.restore}
              </span>
              <span className="mono-data research-admin-summary-chip" data-kind="upsert">
                UPSERT {historySummary.upsert}
              </span>
              {historySummary.other > 0 ? (
                <span className="mono-data research-admin-summary-chip" data-kind="other">
                  OTHER {historySummary.other}
                </span>
              ) : null}
              <span className="mono-data research-admin-summary-chip" data-kind="total">
                TOTAL {historySummary.total}
              </span>
              <span className="mono-data research-admin-summary-chip" data-kind="recent">
                LAST {recentWindowMinutes}M {recentSummary.total}
              </span>
              <span className="mono-data research-admin-summary-chip" data-kind="recent-restore">
                R {recentSummary.restore}
              </span>
              <span className="mono-data research-admin-summary-chip" data-kind="recent-upsert">
                U {recentSummary.upsert}
              </span>
            </div>
            <div className="research-admin-summary" aria-label="Reconnect operation summary">
              <span className="mono-data research-admin-summary-chip" data-kind="total">
                RECONNECT {benchmarkSummary?.total ?? 0}
              </span>
              <span className="mono-data research-admin-summary-chip" data-kind="recent">
                ATTEMPT {benchmarkSummary?.attempts ?? 0}
              </span>
              <span className="mono-data research-admin-summary-chip" data-kind="recent-upsert">
                SUCCESS {benchmarkSummary?.success ?? 0}
              </span>
              <span className="mono-data research-admin-summary-chip" data-kind="restore">
                FAILED {benchmarkSummary?.failed ?? 0}
              </span>
              <span className="mono-data research-admin-summary-chip" data-kind="other">
                REJECTED {benchmarkSummary?.rejected ?? 0}
              </span>
              <span className="mono-data research-admin-summary-chip" data-kind="recent">
                RATE {reconnectSuccessRate}%
              </span>
              <span className="mono-data research-admin-summary-chip" data-kind="recent" title="Reconnect results in the last 30 minutes">
                W30 {reconnectRecent30m.total}
              </span>
              <span className="mono-data research-admin-summary-chip" data-kind="recent" title="Reconnect success rate in the last 30 minutes">
                W30_RATE {reconnectRecent30m.successRate}%
              </span>
              <span className="mono-data research-admin-summary-chip" data-kind="recent" title="Last reconnect result timestamp">
                LAST {reconnectLastResultText}
              </span>
              {topReconnectSources.map((sourceItem) => (
                <span
                  key={`source-${sourceItem.source}`}
                  className="mono-data research-admin-summary-chip"
                  data-kind="recent-upsert"
                  title="Top reconnect source"
                >
                  SRC {sourceItem.source.toUpperCase()} {sourceItem.count}
                </span>
              ))}
              {topReconnectReasons.map((reasonItem) => (
                <span
                  key={`reason-${reasonItem.reason}`}
                  className="mono-data research-admin-summary-chip"
                  data-kind="other"
                  title="Top reconnect failure/reject reason"
                >
                  REASON {reasonItem.reason} {reasonItem.count}
                </span>
              ))}
              {benchmarkSummaryError ? (
                <span className="mono-data research-admin-summary-chip" data-kind="other" title="Reconnect benchmark summary fetch error">
                  RS_ERR {benchmarkSummaryError}
                </span>
              ) : null}
              {isBenchmarkSummaryBackoff ? (
                <span className="mono-data research-admin-summary-chip" data-kind="other" title="Reconnect summary polling backoff">
                  RS_BACKOFF
                </span>
              ) : null}
            </div>
          </div>
          <UiButton
            size="sm"
            variant="outline"
            className="muel-interact"
            onClick={() => {
              void fetchHistory();
              void fetchBotStatus();
              void refreshBenchmarkSummary();
            }}
          >
            Refresh
          </UiButton>
          <UiButton
            size="sm"
            variant="outline"
            className="muel-interact"
            disabled={isBotReconnectPending}
            onClick={() => {
              void triggerBotReconnect();
            }}
          >
            {isBotReconnectPending ? 'Reconnecting...' : 'Reconnect Bot'}
          </UiButton>
        </div>

        <p className="mono-data research-admin-sync" data-kind={botStatusKind}>
          Bot sync: {lastBotSyncedAt ? new Date(lastBotSyncedAt).toLocaleTimeString('ko-KR') : '-'} ({botSyncElapsedText}) · poll {Math.floor(botRefreshDelayMs / 1000)}s
          {botStatus ? (
            <>
              <span className="research-admin-sync-badge" data-kind={botStatus.healthy ? 'bot-ok' : 'bot-outage'}>
                {botStatus.statusGrade ? `BOT_${botStatus.statusGrade.toUpperCase()}` : botStatus.healthy ? 'BOT_READY' : 'BOT_DEGRADED'}
              </span>
              {typeof botStatus.nextCheckInSec === 'number' ? (
                <span className="research-admin-sync-badge" data-kind="reason">
                  NEXT {botStatus.nextCheckInSec}s
                </span>
              ) : null}
              <span className="research-admin-sync-badge" data-kind="reason">
                WS {botStatus.bot?.wsStatus ?? '-'}
              </span>
              {!botStatus.healthy ? (
                <span className="research-admin-sync-badge" data-kind="reason">
                  OUTAGE {botOutageElapsedText}
                </span>
              ) : null}
              {(botStatus.bot?.reconnectQueued || (botStatus.bot?.reconnectAttempts || 0) > 0) ? (
                <span className="research-admin-sync-badge" data-kind="backoff">
                  RECONNECT {botStatus.bot?.reconnectAttempts ?? 0}
                </span>
              ) : null}
              {isBotStatusBackoff ? (
                <span className="research-admin-sync-badge" data-kind="backoff">
                  BACKOFF
                </span>
              ) : null}
              {botStatus.bot?.lastAlertAt ? (
                <span
                  className="research-admin-sync-badge"
                  data-kind="reason"
                  title={`lastAlertAt=${botStatus.bot.lastAlertAt} reason=${botStatus.bot.lastAlertReason || '-'}`}
                >
                  ALERT
                </span>
              ) : null}
              {botStatus.bot?.lastRecoveryAt ? (
                <span
                  className="research-admin-sync-badge"
                  data-kind="bot-ok"
                  title={`lastRecoveryAt=${botStatus.bot.lastRecoveryAt}`}
                >
                  RECOVERY
                </span>
              ) : null}
              {botStatus.bot?.lastLoginError ? (
                <span className="research-admin-sync-badge" data-kind="reason" title={botStatus.bot.lastLoginError}>
                  LAST_ERROR
                </span>
              ) : null}
              {botStatus.recommendations?.[0] ? (
                <span className="research-admin-sync-badge" data-kind="reason" title={botStatus.recommendations[0]}>
                  ACTION
                </span>
              ) : null}
            </>
          ) : null}
          {!botStatus && botStatusError ? (
            <span className="research-admin-sync-badge" data-kind="reason">
              {botStatusError}
            </span>
          ) : null}
        </p>

        <p className="mono-data research-admin-sync" data-kind={syncDisplayKind}>
          Last synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString('ko-KR') : '-'} ({syncElapsedText}) · poll {Math.floor(autoRefreshDelayMs / 1000)}s
          {isHistoryBackoff ? (
            <span className="research-admin-sync-badge" data-kind="backoff" aria-label="Polling backoff mode active">
              BACKOFF
            </span>
          ) : null}
          {isHistoryBackoff && syncErrorReason ? (
            <span className="research-admin-sync-badge" data-kind="reason" aria-label="Last polling failure reason">
              {syncErrorReason}
            </span>
          ) : null}
        </p>

        {botActionMessage ? <p className="mono-data research-admin-empty">{botActionMessage}</p> : null}

        {loading ? (
          <p className="mono-data research-admin-empty">Loading history...</p>
        ) : rows.length === 0 ? (
          <p className="mono-data research-admin-empty">No preset updates yet.</p>
        ) : (
          <div className="research-admin-list" role="list" aria-label="Preset update history">
            {rows.map((row, index) => {
              const previous = rows[index + 1];
              const changedKeys = previous ? getChangedKeys(row.payload, previous.payload) : ['data'];
              const isExpanded = expandedRowId === row.id;
              const isConfirmingRestore = confirmRestoreRowId === row.id;
              const restoredFromHistoryId = getRestoredFromHistoryId(row.metadata);
              const diffEntries = previous ? collectDiffEntries(row.payload, previous.payload).slice(0, 40) : [];

              return (
                <article
                  key={row.id}
                  role="listitem"
                  className={`research-admin-item${focusedRowId === row.id ? ' is-focus-target' : ''}`}
                  data-kind={row.source}
                  tabIndex={-1}
                  ref={(node) => {
                    rowRefs.current[row.id] = node;
                  }}
                >
                  <div className="research-admin-item-top">
                    <span className="mono-data research-admin-badge" data-kind={row.source}>
                      {getActionLabel(row.source)}
                    </span>
                    <span className="mono-data research-admin-time">{new Date(row.createdAt).toLocaleString('ko-KR')}</span>
                  </div>
                  <p className="research-admin-title">{row.actorUsername}</p>
                  <p className="research-admin-action-desc">{getActionDescription(row.source)}</p>
                  <p className="mono-data research-admin-meta">UID: {row.actorUserId}</p>
                  {row.source === 'restore' && restoredFromHistoryId ? (
                    <p className="mono-data research-admin-meta">
                      RESTORED FROM:{' '}
                      <button
                        type="button"
                        className="research-admin-history-link"
                        onClick={() => jumpToHistoryRow(restoredFromHistoryId)}
                      >
                        {restoredFromHistoryId}
                      </button>
                    </p>
                  ) : null}

                  <div className="research-admin-diff" aria-label="Changed preset sections">
                    {(changedKeys.length ? changedKeys : ['none']).map((key) => (
                      <span key={`${row.id}-${key}`} className="mono-data research-admin-diff-chip">
                        {key}
                      </span>
                    ))}
                  </div>

                  <div className="research-admin-actions">
                    <UiButton
                      size="sm"
                      variant="outline"
                      className="muel-interact"
                      disabled={restoringRowId !== null}
                      onClick={() => {
                        if (!isConfirmingRestore) {
                          setConfirmRestoreRowId(row.id);
                          setRestoreError(null);
                          return;
                        }

                        setConfirmRestoreRowId(null);
                        void restoreSnapshot(row.id);
                      }}
                    >
                      {restoringRowId === row.id
                        ? 'Restoring...'
                        : isConfirmingRestore
                          ? 'Confirm Restore'
                          : 'Restore'}
                    </UiButton>
                    <UiButton
                      size="sm"
                      variant="ghost"
                      className="muel-interact"
                      disabled={restoringRowId !== null}
                      onClick={() => setExpandedRowId((prev) => (prev === row.id ? null : row.id))}
                    >
                      {isExpanded ? 'Hide Diff' : 'View Diff'}
                    </UiButton>
                    {isConfirmingRestore ? (
                      <UiButton
                        size="sm"
                        variant="ghost"
                        className="muel-interact"
                        disabled={restoringRowId !== null}
                        onClick={() => setConfirmRestoreRowId(null)}
                      >
                        Cancel
                      </UiButton>
                    ) : null}
                  </div>

                  {isConfirmingRestore && restoringRowId !== row.id ? (
                    <p className="mono-data research-admin-confirm">한 번 더 클릭하면 이 스냅샷으로 즉시 복원됩니다. (5초 후 자동 해제)</p>
                  ) : null}

                  {isExpanded ? (
                    previous ? (
                      <div className="research-admin-diff-detail" aria-label="Detailed payload diff">
                        {diffEntries.length === 0 ? (
                          <p className="mono-data research-admin-empty">No detailed field differences found.</p>
                        ) : (
                          diffEntries.map((entry) => (
                            <div key={`${row.id}-${entry.path}`} className="research-admin-diff-row">
                              <p className="mono-data research-admin-diff-path">{entry.path}</p>
                              <p className="research-admin-diff-before">- {entry.before}</p>
                              <p className="research-admin-diff-after">+ {entry.after}</p>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <p className="mono-data research-admin-empty">This is the oldest snapshot in history.</p>
                    )
                  ) : null}
                </article>
              );
            })}
          </div>
        )}

        {restoreError ? <p className="mono-data research-admin-empty">{restoreError}</p> : null}
      </SurfaceCard>
    </section>
  );
};
