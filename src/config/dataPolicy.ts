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
  allowFredPlaygroundFallback: parseBoolean(import.meta.env.VITE_ALLOW_FRED_PLAYGROUND_FALLBACK as string | undefined, true),
  allowFredIndicatorFallback: parseBoolean(import.meta.env.VITE_ALLOW_FRED_INDICATOR_FALLBACK as string | undefined, true),
  allowQuantPanelFallback: parseBoolean(import.meta.env.VITE_ALLOW_QUANT_PANEL_FALLBACK as string | undefined, true),
} as const;
