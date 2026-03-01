export const BENCHMARK_EVENTS = {
  appBootStart: 'app_boot_start',
  appBootComplete: 'app_boot_complete',
  routeView: 'route_view',
  navClick: 'nav_click',
  flowClick: 'flow_click',
  ctaClick: 'cta_click',
  sectionRailClick: 'section_rail_click',
  hubTabOpen: 'hub_tab_open',
  hubItemOpen: 'hub_item_open',
  dashboardTabSwitch: 'dashboard_tab_switch',
  sourceAddAttempt: 'source_add_attempt',
  sourceAddResult: 'source_add_result',
  testTriggerAttempt: 'test_trigger_attempt',
  testTriggerResult: 'test_trigger_result',
} as const;

export type BenchmarkEventName = (typeof BENCHMARK_EVENTS)[keyof typeof BENCHMARK_EVENTS];

export const BENCHMARK_STORAGE_KEY = 'muel_benchmark_events';
export const BENCHMARK_MAX_EVENTS = 500;
