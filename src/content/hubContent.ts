import { benchmarkDimensions, hypergryphBenchmarkItems } from './benchmarkTokens';
import { HUB_VIEW_TOKENS } from '../config/experienceTokens';

export type HubItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
  date?: string;
  category?: string;
};

export type HubFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type HubItemsTab = {
  id: string;
  label: string;
  kind: 'items';
  items: HubItem[];
  gridClassName?: string;
};

export type HubFaqTab = {
  id: string;
  label: string;
  kind: 'faq';
  faqs: HubFaqItem[];
};

export type HubTab = HubItemsTab | HubFaqTab;

export const hubNewsItems: HubItem[] = [
  {
    id: 'news-alert-engine',
    title: 'Alert Engine Improvement',
    description: 'Improved YouTube community post detection and end-to-end delivery stability.',
    date: 'DATE 2026/03/02',
    category: 'Operations',
  },
  {
    id: 'news-ia-refactor',
    title: 'Dashboard IA Refactor',
    description: 'Restructured information hierarchy for faster operator decision flow.',
    date: 'DATE 2026/02/20',
    category: 'IA',
  },
  {
    id: 'news-channel-linking',
    title: 'Channel Linking UX Update',
    description: 'Simplified guild/channel selection flow and strengthened error guidance.',
    date: 'DATE 2026/02/11',
    category: 'UX',
  },
];

export const hubSupportFaqItems: HubFaqItem[] = [
  {
    id: 'faq-flow',
    question: '이 서비스는 어떤 흐름으로 동작하나요?',
    answer: 'YouTube 소스를 감시해 새 이벤트를 감지하고, Discord 채널로 자동 전송한 뒤 로그를 대시보드에 기록합니다.',
  },
  {
    id: 'faq-views',
    question: '홈 / 인앱 데이터 / 운영 화면은 어떻게 다른가요?',
    answer: '홈은 서비스 개요·QnA, 인앱 데이터는 Discord 내 지표 확인, 운영은 관리·테스트·로그 제어를 담당합니다.',
  },
  {
    id: 'faq-source-count',
    question: '알림 소스는 몇 개까지 등록할 수 있나요?',
    answer: '여러 소스를 등록할 수 있으며, 운영 안정성을 위해 소스별 상태 로그를 함께 확인하는 것을 권장합니다.',
  },
];

export const hubStudioReferenceItems: HubItem[] = [
  {
    id: 'studio-planning-guide',
    title: '콘텐츠 기획 가이드',
    description: '프리미엄 콘텐츠 발행 구조, 카테고리 정책, 품질 체크리스트',
    href: '#',
    category: 'Planning',
  },
  {
    id: 'studio-operation-hub',
    title: '운영 레퍼런스 허브',
    description: '운영팀 내부 레퍼런스와 게시 흐름 템플릿',
    href: '#',
    category: 'Operations',
  },
  {
    id: 'studio-performance-dash',
    title: '콘텐츠 성과 대시',
    description: '조회, 전환, 체류시간 기반의 콘텐츠 운영 지표',
    href: '#',
    category: 'Metrics',
  },
];

export const hubSupportChannels: HubItem[] = [
  {
    id: 'support-discord',
    title: '운영팀 Discord 채널',
    description: '긴급 장애, 권한 이슈, 전송 실패 대응 접수 채널',
    href: '#',
    category: 'Realtime',
  },
  {
    id: 'support-studio',
    title: '스튜디오 문의 채널',
    description: '콘텐츠 게시/검수/정산 관련 문의 채널',
    href: '#',
    category: 'Studio',
  },
];

export const hubBenchmarkItems: HubItem[] = hypergryphBenchmarkItems;

export const hubBenchmarkDimensionItems: HubItem[] = benchmarkDimensions.map((dimension) => ({
  id: `benchmark-dimension-${dimension.id}`,
  title: `${dimension.label} Token`,
  description: `${dimension.objective} | KPI: ${dimension.measure} | 적용: ${dimension.implementationToken} | Event: ${dimension.eventKeys.join(', ')}`,
  category: 'Token',
  date: 'DATE 2026/03/02',
}));

export const homeHubTabs: HubTab[] = [
  {
    id: 'home-updates',
    label: '업데이트',
    kind: 'items',
    items: hubNewsItems,
    gridClassName: HUB_VIEW_TOKENS.defaultItemsGrid,
  },
  {
    id: 'home-faq',
    label: 'FAQ',
    kind: 'faq',
    faqs: hubSupportFaqItems,
  },
  {
    id: 'home-benchmark',
    label: '벤치마크',
    kind: 'items',
    items: hubBenchmarkItems,
    gridClassName: HUB_VIEW_TOKENS.compactItemsGrid,
  },
];

export const studioHubTabs: HubTab[] = [
  {
    id: 'studio-reference',
    label: '레퍼런스',
    kind: 'items',
    items: hubStudioReferenceItems,
    gridClassName: HUB_VIEW_TOKENS.defaultItemsGrid,
  },
  {
    id: 'studio-news',
    label: '업데이트',
    kind: 'items',
    items: hubNewsItems,
    gridClassName: HUB_VIEW_TOKENS.defaultItemsGrid,
  },
  {
    id: 'studio-benchmark',
    label: '벤치마크',
    kind: 'items',
    items: hubBenchmarkDimensionItems,
    gridClassName: HUB_VIEW_TOKENS.compactItemsGrid,
  },
];

export const supportHubTabs: HubTab[] = [
  {
    id: 'support-faq',
    label: 'FAQ',
    kind: 'faq',
    faqs: hubSupportFaqItems,
  },
  {
    id: 'support-channels',
    label: '문의 채널',
    kind: 'items',
    items: hubSupportChannels,
    gridClassName: HUB_VIEW_TOKENS.compactItemsGrid,
  },
  {
    id: 'support-benchmark',
    label: '벤치마크',
    kind: 'items',
    items: hubBenchmarkItems,
    gridClassName: HUB_VIEW_TOKENS.compactItemsGrid,
  },
];
