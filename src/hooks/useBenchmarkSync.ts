import { useEffect } from 'react';
import { apiFetch } from '../config';
import { type BenchmarkEventRecord, getPendingBenchmarkEvents, markBenchmarkEventsAsSent, syncBenchmarkEvents } from '../lib/benchmarkTracker';

const BENCHMARK_SYNC_INTERVAL_MS = 15000;
const BENCHMARK_SYNC_BATCH_SIZE = 80;

// 일반 경로: API fetch 래퍼를 통해 주기적으로 이벤트를 업로드합니다.
const postBenchmarkEvents = async (events: BenchmarkEventRecord[]) => {
  try {
    const response = await apiFetch('/api/benchmark/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });
    return response.ok;
  } catch {
    return false;
  }
};

const flushByKeepalive = () => {
  // 페이지 이탈 직전에는 keepalive 전송으로 유실 가능성을 줄입니다.
  const pending = getPendingBenchmarkEvents(BENCHMARK_SYNC_BATCH_SIZE);
  if (!pending.length) {
    return;
  }

  fetch('/api/benchmark/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: pending }),
    credentials: 'include',
    keepalive: true,
  })
    .then((response) => {
      if (response.ok) {
        markBenchmarkEventsAsSent(pending.map((event) => event.id));
      }
    })
    .catch(() => {
      // ignore network errors on unload path
    });
};

export const useBenchmarkSync = () => {
  useEffect(() => {
    // 마운트 즉시 1회 동기화 후, 주기적으로 배치 동기화를 반복합니다.
    void syncBenchmarkEvents(postBenchmarkEvents, BENCHMARK_SYNC_BATCH_SIZE);

    const interval = window.setInterval(() => {
      void syncBenchmarkEvents(postBenchmarkEvents, BENCHMARK_SYNC_BATCH_SIZE);
    }, BENCHMARK_SYNC_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushByKeepalive();
      }
    };

    const handleBeforeUnload = () => {
      flushByKeepalive();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};
