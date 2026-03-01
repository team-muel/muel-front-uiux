import { BENCHMARK_MAX_EVENTS, BENCHMARK_STORAGE_KEY, type BenchmarkEventName } from '../config/benchmarkEvents';

export type BenchmarkEventPayload = Record<string, string | number | boolean | null | undefined>;

export type BenchmarkEventRecord = {
  id: string;
  name: BenchmarkEventName | string;
  payload?: BenchmarkEventPayload;
  ts: string;
  path: string;
};

const BENCHMARK_SENT_IDS_KEY = 'muel_benchmark_sent_ids';
const BENCHMARK_MAX_SENT_IDS = 1000;

const getCurrentPath = () => {
  if (typeof window === 'undefined') {
    return '/';
  }
  return window.location.pathname;
};

const readStoredEvents = () => {
  if (typeof window === 'undefined') {
    return [] as BenchmarkEventRecord[];
  }

  try {
    const raw = window.localStorage.getItem(BENCHMARK_STORAGE_KEY);
    if (!raw) {
      return [] as BenchmarkEventRecord[];
    }

    const parsed = JSON.parse(raw) as BenchmarkEventRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as BenchmarkEventRecord[];
  }
};

const writeStoredEvents = (events: BenchmarkEventRecord[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(BENCHMARK_STORAGE_KEY, JSON.stringify(events));
  } catch {
    // ignore storage errors
  }
};

const readSentEventIds = () => {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(BENCHMARK_SENT_IDS_KEY);
    if (!raw) {
      return [] as string[];
    }
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as string[];
  }
};

const writeSentEventIds = (ids: string[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(BENCHMARK_SENT_IDS_KEY, JSON.stringify(ids.slice(-BENCHMARK_MAX_SENT_IDS)));
  } catch {
    // ignore storage errors
  }
};

const createEventId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const trackBenchmarkEvent = (name: BenchmarkEventName | string, payload?: BenchmarkEventPayload) => {
  const record: BenchmarkEventRecord = {
    id: createEventId(),
    name,
    payload,
    ts: new Date().toISOString(),
    path: getCurrentPath(),
  };

  if (typeof window !== 'undefined') {
    const previous = readStoredEvents();
    const next = [...previous.slice(-(BENCHMARK_MAX_EVENTS - 1)), record];
    writeStoredEvents(next);

    window.dispatchEvent(new CustomEvent('muel:benchmark', { detail: record }));
  }

  return record;
};

export const getBenchmarkEvents = () => readStoredEvents();

export const getPendingBenchmarkEvents = (limit?: number) => {
  const allEvents = readStoredEvents();
  const sentEventIds = new Set(readSentEventIds());
  const pending = allEvents.filter((event) => !sentEventIds.has(event.id));
  if (!limit || limit <= 0) {
    return pending;
  }
  return pending.slice(0, limit);
};

export const markBenchmarkEventsAsSent = (eventIds: string[]) => {
  if (!eventIds.length) {
    return;
  }

  const previous = readSentEventIds();
  const merged = [...previous, ...eventIds];
  writeSentEventIds(Array.from(new Set(merged)));
};

export const syncBenchmarkEvents = async (
  sender: (events: BenchmarkEventRecord[]) => Promise<boolean>,
  batchSize = 80,
) => {
  const pendingEvents = getPendingBenchmarkEvents(batchSize);
  if (!pendingEvents.length) {
    return { sent: 0, skipped: true };
  }

  const success = await sender(pendingEvents);
  if (!success) {
    return { sent: 0, skipped: false };
  }

  markBenchmarkEventsAsSent(pendingEvents.map((event) => event.id));
  return { sent: pendingEvents.length, skipped: false };
};

export const clearBenchmarkEvents = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(BENCHMARK_STORAGE_KEY);
  window.localStorage.removeItem(BENCHMARK_SENT_IDS_KEY);
};

if (typeof window !== 'undefined') {
  window.__MUEL_BENCHMARK__ = {
    getEvents: getBenchmarkEvents,
    getPendingEvents: getPendingBenchmarkEvents,
    clearEvents: clearBenchmarkEvents,
  };
}
