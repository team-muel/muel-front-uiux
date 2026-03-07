const parseBoolean = (value: string | undefined, defaultValue: boolean) => {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return defaultValue;
};

export const DATA_POLICY = {
  enableFredPlaygroundBackend: parseBoolean(import.meta.env.VITE_ENABLE_FRED_PLAYGROUND_BACKEND as string | undefined, true),
  enableQuantPanelBackend: parseBoolean(import.meta.env.VITE_ENABLE_QUANT_PANEL_BACKEND as string | undefined, true),
  allowFredPlaygroundFallback: parseBoolean(import.meta.env.VITE_ALLOW_FRED_PLAYGROUND_FALLBACK as string | undefined, true),
  allowFredIndicatorFallback: parseBoolean(import.meta.env.VITE_ALLOW_FRED_INDICATOR_FALLBACK as string | undefined, true),
  allowQuantPanelFallback: parseBoolean(import.meta.env.VITE_ALLOW_QUANT_PANEL_FALLBACK as string | undefined, true),
} as const;
