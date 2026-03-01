export type BenchmarkDimensionToken = {
  id: string;
  label: string;
  objective: string;
  measure: string;
  implementationToken: string;
  eventKeys: string[];
};

export type HypergryphBenchmarkItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
};

export const benchmarkDimensions: BenchmarkDimensionToken[] = [
  {
    id: 'ia-depth',
    label: 'IA Depth',
    objective: '뷰별 목적과 접근 정책을 명확히 분리해 탐색 혼선을 줄입니다.',
    measure: 'first-route success rate / protected-route bounce',
    implementationToken: 'IA_NODES + access/purpose/mode metadata',
    eventKeys: ['route_view', 'nav_click'],
  },
  {
    id: 'scroll-narrative',
    label: 'Scroll Narrative',
    objective: '스크롤 동선마다 정보 밀도를 조절해 집중 전환을 유도합니다.',
    measure: 'section completion rate / rail engagement',
    implementationToken: 'SECTION_MOTION_TOKENS + SectionFlowRail',
    eventKeys: ['section_rail_click', 'flow_click'],
  },
  {
    id: 'content-hub',
    label: 'Content Hub Engine',
    objective: '뉴스/FAQ/레퍼런스를 동일 스키마로 운영해 게시 속도를 높입니다.',
    measure: 'content publish lead time / tab dwell time',
    implementationToken: 'HubTab schema + HubTabs renderer',
    eventKeys: ['hub_tab_open', 'hub_item_open'],
  },
  {
    id: 'media-rhythm',
    label: 'Media Rhythm',
    objective: '모션 강도와 지연을 섹션 목적에 맞춰 표준화합니다.',
    measure: 'motion jank count / interaction latency',
    implementationToken: 'MOTION_TOKENS + createStaggerPreset',
    eventKeys: ['app_boot_start', 'app_boot_complete'],
  },
  {
    id: 'ops-observability',
    label: 'Ops Observability',
    objective: '운영 상태·로그·소스 흐름을 단일 화면에서 추적 가능하게 만듭니다.',
    measure: 'MTTD / test-trigger success / source failure recovery',
    implementationToken: 'dashboardContent + realtime/source panels',
    eventKeys: ['dashboard_tab_switch', 'source_add_attempt', 'source_add_result', 'test_trigger_attempt', 'test_trigger_result'],
  },
  {
    id: 'funnel-governance',
    label: 'Funnel Governance',
    objective: '홈→인앱→운영 퍼널을 측정 가능 상태로 유지합니다.',
    measure: 'flow step conversion / drop-off by node',
    implementationToken: 'PRIMARY_FLOW_ROUTES + flow navigator tokens',
    eventKeys: ['cta_click', 'flow_click'],
  },
];

export const hypergryphBenchmarkItems: HypergryphBenchmarkItem[] = [
  {
    id: 'benchmark-ia-mode-split',
    title: 'Mode-Split IA Governance',
    description: 'Home / In-App / Operations / Studio / Support를 명시적으로 분리하고 정책 기반 접근을 적용합니다.',
    category: 'Architecture',
    date: 'DATE 2026/03/02',
  },
  {
    id: 'benchmark-scroll-density',
    title: 'Section Density Rhythm',
    description: '스크롤 구간별로 헤더-카드-FAQ 밀도를 다르게 설계해 콘텐츠 피로를 줄입니다.',
    category: 'Narrative',
    date: 'DATE 2026/03/02',
  },
  {
    id: 'benchmark-hub-schema',
    title: 'Unified Hub Schema',
    description: '뉴스·FAQ·채널을 공통 스키마로 표준화해 운영/지원/스튜디오 화면을 동일 렌더 파이프라인으로 통합합니다.',
    category: 'Content System',
    date: 'DATE 2026/03/02',
  },
  {
    id: 'benchmark-motion-profile',
    title: 'Motion Profile Tokens',
    description: 'hero/section/grid/card 별 duration·delay·viewport 값을 토큰으로 관리해 모션 품질을 일관화합니다.',
    category: 'Motion',
    date: 'DATE 2026/03/02',
  },
  {
    id: 'benchmark-ops-telemetry',
    title: 'Operations Telemetry Surface',
    description: '실시간 상태, 로그, 테스트 전송, 소스 등록 흐름을 운영 계측 관점으로 재조합합니다.',
    category: 'Observability',
    date: 'DATE 2026/03/02',
  },
  {
    id: 'benchmark-funnel-loop',
    title: 'Funnel-to-Action Loop',
    description: '섹션 플로우 내 CTA 반복 노출과 다음 단계 안내를 토큰화해 전환 루프를 유지합니다.',
    category: 'Conversion',
    date: 'DATE 2026/03/02',
  },
];
