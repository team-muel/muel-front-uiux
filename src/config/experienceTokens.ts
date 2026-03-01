export const SECTION_MOTION_TOKENS = {
  revealLine: {
    duration: 0.8,
    ease: 'easeOut' as const,
    viewportAmount: 0.3,
  },
  hero: {
    headingDuration: 0.6,
    headingDelay: 0.08,
    bodyDuration: 0.55,
    bodyDelay: 0.14,
    ctaDuration: 0.5,
    ctaDelay: 0.2,
    riseOffset: 14,
  },
  sectionGrid: {
    viewportAmount: 0.2,
    once: true,
    staggerChildren: 0.1,
    delayChildren: 0.04,
  },
  embedded: {
    itemDuration: 0.52,
  },
  dashboard: {
    pollIntervalMs: 5000,
    statusFadeDuration: 0.45,
    statusRiseOffset: 14,
    staggerChildren: 0.09,
    delayChildren: 0.03,
    itemDuration: 0.5,
  },
} as const;

export const HUB_VIEW_TOKENS = {
  defaultItemsGrid: 'grid grid-cols-1 overflow-hidden rounded-xl border-l border-t border-zinc-800 md:grid-cols-3',
  compactItemsGrid: 'grid grid-cols-1 overflow-hidden rounded-xl border-l border-t border-zinc-800 md:grid-cols-2',
} as const;
