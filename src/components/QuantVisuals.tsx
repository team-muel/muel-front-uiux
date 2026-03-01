import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { UI_PRESETS } from '../config/uiPresets';
import { SurfaceCard } from './ui/SurfaceCard';
import { UiButton } from './ui/UiButton';

export interface RadarMetric {
  label: string;
  value: number;
}

interface RadarQuantCardProps {
  title: string;
  subtitle: string;
  metrics: readonly RadarMetric[];
}

interface GlitchLineQuantCardProps {
  title: string;
  subtitle: string;
  labels: readonly string[];
  values: readonly number[];
}

interface PremiumInsightPaywallCardProps {
  title: string;
  subtitle: string;
  lockedRows: ReadonlyArray<{ label: string; value: string }>;
}

interface RollingValueProps {
  value: number;
  trigger: number;
  className?: string;
  decimals?: number;
  suffix?: string;
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const formatValue = (value: number, decimals: number) => value.toFixed(decimals);

export const RollingValue = ({ value, trigger, className = '', decimals = 0, suffix = '' }: RollingValueProps) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (trigger <= 0) {
      setDisplay(value);
      return;
    }

    const spread = Math.max(2, Math.abs(value) * 0.22);
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= 240) {
        window.clearInterval(timer);
        setDisplay(value);
        return;
      }
      const jitter = (Math.random() - 0.5) * spread;
      const next = Math.max(0, value + jitter);
      setDisplay(next);
    }, 20);

    return () => window.clearInterval(timer);
  }, [trigger, value]);

  return <span className={`mono-data ${className}`}>{formatValue(display, decimals)}{suffix}</span>;
};

function radarPoint(index: number, total: number, radius: number, center: number, ratio = 1) {
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
  const r = radius * ratio;
  return {
    x: center + Math.cos(angle) * r,
    y: center + Math.sin(angle) * r,
  };
}

export const RadarQuantCard = ({ title, subtitle, metrics }: RadarQuantCardProps) => {
  const [hoverTick, setHoverTick] = useState(0);
  const center = 110;
  const radius = 74;
  const levels = [0.25, 0.5, 0.75, 1];

  const gridPolygons = levels.map((level) =>
    metrics
      .map((_, idx) => {
        const point = radarPoint(idx, metrics.length, radius, center, level);
        return `${point.x},${point.y}`;
      })
      .join(' '),
  );

  const axisLines = metrics.map((_, idx) => {
    const end = radarPoint(idx, metrics.length, radius, center, 1);
    return { x1: center, y1: center, x2: end.x, y2: end.y };
  });

  const dataPolygon = metrics
    .map((metric, idx) => {
      const point = radarPoint(idx, metrics.length, radius, center, clamp(metric.value) / 100);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  return (
    <SurfaceCard
      as={motion.article}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      onHoverStart={() => setHoverTick((prev) => prev + 1)}
      hoverable
      className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-900/35 p-6`}
    >
      <div className="mono-data text-xs tracking-[0.14em] text-current">{subtitle}</div>
      <h3 className="mt-2 text-lg font-medium text-current">{title}</h3>
      <div className="mt-5 grid grid-cols-[220px_1fr] gap-6 max-md:grid-cols-1">
        <div className="hover-media">
          <svg viewBox="0 0 220 220" className="mx-auto w-[220px]">
          {gridPolygons.map((points, idx) => (
            <polygon key={`grid-${idx}`} points={points} fill="none" stroke="rgba(15,23,42,0.2)" strokeWidth="1" />
          ))}
          {axisLines.map((line, idx) => (
            <line key={`axis-${idx}`} {...line} stroke="rgba(15,23,42,0.18)" strokeWidth="1" />
          ))}

          <motion.polygon
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            points={dataPolygon}
            fill="var(--accent)"
            fillOpacity="0.16"
            stroke="var(--accent)"
            strokeWidth="2"
          />

          {metrics.map((metric, idx) => {
            const point = radarPoint(idx, metrics.length, radius, center, clamp(metric.value) / 100);
            return <circle key={`dot-${idx}`} cx={point.x} cy={point.y} r="2.8" fill="var(--accent)" />;
          })}
          </svg>
        </div>

        <ul className="space-y-2 text-sm">
          {metrics.map((metric, idx) => (
            <li key={metric.label} className={`flex items-center justify-between ${UI_PRESETS.borderBottom} py-1.5`}>
              <span className="text-current">{metric.label}</span>
              <RollingValue value={clamp(metric.value)} trigger={hoverTick + idx} className={UI_PRESETS.accentText} />
            </li>
          ))}
        </ul>
      </div>
    </SurfaceCard>
  );
};

export const GlitchLineQuantCard = ({ title, subtitle, labels, values }: GlitchLineQuantCardProps) => {
  const [hoverTick, setHoverTick] = useState(0);
  const width = 420;
  const height = 172;
  const padX = 22;
  const padY = 16;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const points = values.map((value, idx) => {
    const x = padX + (idx / Math.max(1, values.length - 1)) * chartW;
    const y = height - padY - ((value - min) / range) * chartH;
    return { x, y };
  });

  const pointString = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <SurfaceCard
      as={motion.article}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      onHoverStart={() => setHoverTick((prev) => prev + 1)}
      hoverable
      className={`quant-scan rounded-full ${UI_PRESETS.borderBase} bg-zinc-900/35 p-6`}
    >
      <div className="mono-data text-xs tracking-[0.14em] text-current">{subtitle}</div>
      <h3 className="mt-2 text-lg font-medium text-current">{title}</h3>

      <div className={`hover-media mt-5 overflow-hidden rounded-full ${UI_PRESETS.borderBase} bg-zinc-950/70 p-3`}>
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[172px] w-full">
          {[0, 1, 2, 3].map((idx) => {
            const y = padY + (idx / 3) * chartH;
            return <line key={`h-${idx}`} x1={padX} y1={y} x2={width - padX} y2={y} stroke="rgba(15,23,42,0.16)" strokeWidth="1" />;
          })}
          {points.map((point, idx) => (
            <line
              key={`v-${idx}`}
              x1={point.x}
              y1={padY}
              x2={point.x}
              y2={height - padY}
              stroke="rgba(15,23,42,0.13)"
              strokeWidth="1"
            />
          ))}

          <motion.polyline
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            points={pointString}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline className="quant-glitch-a" points={pointString} fill="none" stroke="var(--accent)" strokeWidth="1.6" />
          <polyline className="quant-glitch-b" points={pointString} fill="none" stroke="var(--accent)" strokeWidth="1.6" />
          {points.map((point, idx) => (
            <circle key={`pt-${idx}`} cx={point.x} cy={point.y} r="2.6" fill="var(--accent)" />
          ))}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs md:grid-cols-4">
        {labels.map((label, idx) => (
          <div key={`${label}-${idx}`} className="mono-data text-current">
            {label}: <RollingValue value={values[idx]} trigger={hoverTick + idx} className="text-current" />
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
};

export const PremiumInsightPaywallCard = ({ title, subtitle, lockedRows }: PremiumInsightPaywallCardProps) => {
  return (
    <SurfaceCard
      as={motion.article}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      hoverable
      className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-900/35 p-6`}
    >
      <div className="mono-data text-xs tracking-[0.14em] text-current">{subtitle}</div>
      <h3 className="mt-2 text-lg font-medium text-current">{title}</h3>

      <div className={`paywall-wrap mt-5 rounded-full ${UI_PRESETS.borderBase} bg-zinc-950/70 p-4`}>
        <div className="paywall-blur space-y-2 text-sm">
          {lockedRows.map((row) => (
            <div key={row.label} className={`flex items-center justify-between ${UI_PRESETS.borderBottom} py-2 text-current`}>
              <span>{row.label}</span>
              <span className="mono-data">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="paywall-overlay">
          <UiButton variant="ghost" size="lg" className={`mono-data bg-zinc-900 text-current ${UI_PRESETS.accentBgSoft14} ${UI_PRESETS.accentTextHover} ${UI_PRESETS.accentBorderHoverSoft}`}>
            프리미엄 콘텐츠의 전체 분석 리포트 보기
          </UiButton>
        </div>
      </div>
    </SurfaceCard>
  );
};



