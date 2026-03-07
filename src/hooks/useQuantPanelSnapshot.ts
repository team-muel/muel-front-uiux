import { useEffect, useMemo, useState } from 'react';
import { apiFetchJson } from '../config';
import { DATA_POLICY } from '../config/dataPolicy';
import { type QuantPanelMetric, type QuantPanelSnapshot } from '../types/quantPanel';

type UseQuantPanelSnapshotState = {
  snapshot: QuantPanelSnapshot;
  loading: boolean;
  source: 'backend' | 'fallback';
  error: string | null;
};

const buildFallbackSnapshot = (): QuantPanelSnapshot => {
  const updatedAt = new Date().toISOString();

  return {
    source: 'fallback',
    metrics: [
      {
        id: 'position',
        label: 'Current Exposure',
        value: 34,
        unit: '%',
        change: 2.1,
        trend: 'up',
        updatedAt,
      },
      {
        id: 'winRate',
        label: 'Execution Quality',
        value: 57.2,
        unit: '%',
        change: -0.4,
        trend: 'down',
        updatedAt,
      },
      {
        id: 'cvd',
        label: 'Order Flow Delta',
        value: 12.4,
        unit: 'pts',
        change: 1.6,
        trend: 'up',
        updatedAt,
      },
    ],
  };
};

const isValidTrend = (value: string): value is QuantPanelMetric['trend'] => {
  return value === 'up' || value === 'down' || value === 'flat';
};

const isValidMetricId = (value: string): value is QuantPanelMetric['id'] => {
  return value === 'position' || value === 'winRate' || value === 'cvd';
};

const normalizeSnapshot = (payload: unknown): QuantPanelSnapshot | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const source = (payload as { source?: string }).source;
  const metrics = (payload as { metrics?: unknown[] }).metrics;

  if (source !== 'backend' || !Array.isArray(metrics)) {
    return null;
  }

  const normalized = metrics
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const metric = entry as Partial<QuantPanelMetric>;
      if (!metric.id || !isValidMetricId(metric.id) || !metric.label || typeof metric.value !== 'number' || typeof metric.unit !== 'string') {
        return null;
      }

      const trend = typeof metric.trend === 'string' && isValidTrend(metric.trend) ? metric.trend : 'flat';

      return {
        id: metric.id,
        label: metric.label,
        value: metric.value,
        unit: metric.unit,
        change: typeof metric.change === 'number' ? metric.change : 0,
        trend,
        updatedAt: typeof metric.updatedAt === 'string' ? metric.updatedAt : new Date().toISOString(),
      } as QuantPanelMetric;
    })
    .filter((item): item is QuantPanelMetric => Boolean(item));

  if (!normalized.length) {
    return null;
  }

  return {
    source: 'backend',
    metrics: normalized,
  };
};

export const useQuantPanelSnapshot = (): UseQuantPanelSnapshotState => {
  const [state, setState] = useState<UseQuantPanelSnapshotState>({
    snapshot: buildFallbackSnapshot(),
    loading: true,
    source: 'fallback',
    error: null,
  });

  useEffect(() => {
    if (!DATA_POLICY.enableQuantPanelBackend) {
      if (!DATA_POLICY.allowQuantPanelFallback) {
        setState({
          snapshot: {
            source: 'fallback',
            metrics: [],
          },
          loading: false,
          source: 'fallback',
          error: 'Quant backend endpoint is disabled by policy',
        });
      } else {
        setState({
          snapshot: buildFallbackSnapshot(),
          loading: false,
          source: 'fallback',
          error: 'Quant backend endpoint is disabled by policy',
        });
      }
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const payload = await apiFetchJson<unknown>('/api/quant/panel');
        const normalized = normalizeSnapshot(payload);

        if (!normalized) {
          throw new Error('Invalid quant panel payload');
        }

        if (cancelled) {
          return;
        }

        setState({
          snapshot: normalized,
          loading: false,
          source: 'backend',
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (!DATA_POLICY.allowQuantPanelFallback) {
          setState({
            snapshot: {
              source: 'fallback',
              metrics: [],
            },
            loading: false,
            source: 'fallback',
            error: error instanceof Error ? error.message : 'Quant panel unavailable',
          });
          return;
        }

        setState({
          snapshot: buildFallbackSnapshot(),
          loading: false,
          source: 'fallback',
          error: error instanceof Error ? error.message : 'Quant panel fallback in use',
        });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => state, [state]);
};
