export interface QuantPanelMetric {
  id: 'position' | 'winRate' | 'cvd';
  label: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'flat';
  updatedAt: string;
}

export interface QuantPanelSnapshot {
  source: 'backend' | 'fallback';
  metrics: QuantPanelMetric[];
}
