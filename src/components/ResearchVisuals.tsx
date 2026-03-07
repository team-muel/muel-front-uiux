import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SurfaceCard } from './ui/SurfaceCard';

type RadarMetric = { label: string; value: number };

interface RadarCardProps {
  title: string;
  subtitle: string;
  metrics: readonly RadarMetric[];
}

export const RadarResearchCard = ({ title, subtitle, metrics }: RadarCardProps) => {
  const radarData = metrics.map((metric) => ({
    label: metric.label,
    value: Math.max(0, Math.min(100, metric.value)),
  }));

  return (
    <SurfaceCard hoverable className="research-card research-visual-card muel-interact">
      <div className="mono-data research-card-kicker">{subtitle}</div>
      <h3 className="research-card-title">{title}</h3>
      <div className="research-radar-layout">
        <div className="hover-media research-radar-shell">
          <div className="research-radar-responsive">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgb(95 99 104 / 18%)" />
                <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: '#5f6368' }} />
                <Radar
                  dataKey="value"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  isAnimationActive
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <ul className="research-row-list">
          {metrics.map((metric) => (
            <li key={metric.label} className="research-row-line research-row-item">
              <span>{metric.label}</span>
              <span className="mono-data research-row-value">{metric.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </SurfaceCard>
  );
};

interface TrendCardProps {
  title: string;
  subtitle: string;
  labels: readonly string[];
  values: readonly number[];
}

export const TrendResearchCard = ({ title, subtitle, labels, values }: TrendCardProps) => {
  const chartData = labels.map((label, idx) => ({
    label,
    value: values[idx],
  }));

  return (
    <SurfaceCard hoverable className="research-card research-visual-card muel-interact">
      <div className="mono-data research-card-kicker">{subtitle}</div>
      <h3 className="research-card-title">{title}</h3>

      <div className="hover-media research-chart-shell research-trend-shell">
        <div className="research-trend-responsive">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid stroke="rgb(95 99 104 / 12%)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#5f6368' }} />
              <YAxis hide />
              <Tooltip cursor={{ stroke: 'rgb(62 207 142 / 30%)', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--accent)' }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="research-trend-meta-grid">
        {labels.map((label, idx) => (
          <div key={`${label}-${idx}`} className="mono-data research-trend-meta-item">
            {label}: {values[idx]}
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
};

interface PremiumCardProps {
  title: string;
  subtitle: string;
  lockLabel: string;
  rows: ReadonlyArray<{ label: string; value: string }>;
}

export const PremiumResearchCard = ({ title, subtitle, lockLabel, rows }: PremiumCardProps) => {
  return (
    <SurfaceCard hoverable className="research-card research-visual-card muel-interact">
      <div className="mono-data research-card-kicker">{subtitle}</div>
      <h3 className="research-card-title">{title}</h3>

      <div className="paywall-wrap research-chart-shell research-premium-shell">
        <div className="paywall-blur research-row-list research-premium-list">
          {rows.map((row) => (
            <div key={row.label} className="research-row-line research-premium-row">
              <span>{row.label}</span>
              <span className="mono-data research-row-value">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="paywall-overlay">
          <p className="mono-data research-lock-pill">{lockLabel}</p>
        </div>
      </div>
    </SurfaceCard>
  );
};
