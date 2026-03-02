import { isResearchPresetKey, type ResolvedResearchPreset } from '../content/researchContent';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

const isNumberArray = (value: unknown): value is number[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'number');
};

export const isResolvedResearchPreset = (value: unknown): value is ResolvedResearchPreset => {
  if (!isRecord(value)) return false;
  if (!isResearchPresetKey(String(value.key || ''))) return false;

  if (!isRecord(value.page) || typeof value.page.mainClassName !== 'string') return false;
  if (!isRecord(value.stepNav)) return false;
  if (typeof value.stepNav.ariaLabel !== 'string') return false;
  if (typeof value.stepNav.showLabels !== 'boolean') return false;
  if (typeof value.stepNav.showSeparators !== 'boolean') return false;

  if (!isRecord(value.core)) return false;
  if (typeof value.core.feedsLabel !== 'string') return false;
  if (typeof value.core.viewsLabel !== 'string') return false;
  if (typeof value.core.libraryLabel !== 'string') return false;

  if (!isRecord(value.hero)) return false;
  if (!['embedded', 'studio'].includes(String(value.hero.layout))) return false;
  if (typeof value.hero.overline !== 'string') return false;
  if (typeof value.hero.title !== 'string') return false;
  if (typeof value.hero.description !== 'string') return false;

  if (value.hero.layout === 'studio') {
    if (!isRecord(value.hero.studio)) return false;
    const ctas = value.hero.studio.ctas;
    if (Array.isArray(ctas)) {
      if (ctas.some((cta) => !isRecord(cta) || typeof cta.label !== 'string' || typeof cta.to !== 'string')) {
        return false;
      }
    }

    if (!isRecord(value.hero.studio.kpi)) return false;
    if (typeof value.hero.studio.kpi.kicker !== 'string') return false;
    if (typeof value.hero.studio.kpi.listAriaLabel !== 'string') return false;
    if (typeof value.hero.studio.kpi.footnoteLabel !== 'string') return false;
    if (typeof value.hero.studio.kpi.footnoteLinkLabel !== 'string') return false;
    if (typeof value.hero.studio.kpi.footnoteLinkTo !== 'string') return false;
  }

  if (!isRecord(value.charts) || !isRecord(value.data)) return false;
  if (!isRecord(value.charts.radar) || typeof value.charts.radar.title !== 'string' || typeof value.charts.radar.subtitle !== 'string') return false;
  if (!isRecord(value.charts.trend) || typeof value.charts.trend.title !== 'string' || typeof value.charts.trend.subtitle !== 'string') return false;
  if (!isRecord(value.charts.premium) || typeof value.charts.premium.title !== 'string' || typeof value.charts.premium.subtitle !== 'string' || typeof value.charts.premium.lockLabel !== 'string') return false;

  if (!Array.isArray(value.data.connectors)) return false;
  if (value.data.connectors.some((connector) => !isRecord(connector) || typeof connector.id !== 'string' || typeof connector.title !== 'string' || typeof connector.status !== 'string' || typeof connector.description !== 'string')) {
    return false;
  }

  if (!isRecord(value.data.workbench)) return false;
  if (!isStringArray(value.data.workbench.feeds)) return false;
  if (!isStringArray(value.data.workbench.views)) return false;
  if (!isStringArray(value.data.workbench.library)) return false;

  if (!isRecord(value.data.radar) || !Array.isArray(value.data.radar.metrics)) return false;
  if (value.data.radar.metrics.some((metric) => !isRecord(metric) || typeof metric.label !== 'string' || typeof metric.value !== 'number')) {
    return false;
  }

  if (!isRecord(value.data.trend)) return false;
  if (!isStringArray(value.data.trend.labels)) return false;
  if (!isNumberArray(value.data.trend.values)) return false;

  if (!isRecord(value.data.premium) || !Array.isArray(value.data.premium.rows)) return false;
  if (value.data.premium.rows.some((row) => !isRecord(row) || typeof row.label !== 'string' || typeof row.value !== 'string')) {
    return false;
  }

  return true;
};
