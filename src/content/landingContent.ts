import { type AppIconKey } from '../config/iconRegistry';
import { ROUTES } from '../config/routes';

export type LandingSectionFlowItem = {
  id: string;
  label: string;
};

export type ArchitectureCard = {
  iconKey: AppIconKey;
  title: string;
  description: string;
  to: typeof ROUTES.home | typeof ROUTES.inApp | typeof ROUTES.dashboard;
};

export type CategoryCard = {
  name: string;
  count: string;
  description: string;
  iconKey: AppIconKey;
};

export type JobCard = {
  title: string;
  team: string;
  location: string;
  type: string;
  iconKey: AppIconKey;
  summary: string;
};

export const landingSectionFlow: LandingSectionFlowItem[] = [
  { id: 'hero', label: '01 / Overview' },
  { id: 'architecture', label: '02 / View Architecture' },
  { id: 'categories', label: '03 / Core Capabilities' },
  { id: 'jobs', label: '04 / Operations Team' },
  { id: 'faq', label: '05 / FAQ' },
  { id: 'flow-next', label: '06 / In-App Data' },
];

export const architectureCards: ArchitectureCard[] = [
  {
    iconKey: 'appWindow',
    title: 'In-App Economic Data View',
    description: 'Discord 인앱에서 경제 데이터와 요약 지표를 확인하는 전용 화면입니다.',
    to: ROUTES.inApp,
  },
  {
    iconKey: 'bot',
    title: 'Bot Operations Dashboard',
    description: '디스코드 운영자용 제어 화면입니다. 테스트 관리, 테스트 전송, 로그 추적은 운영 화면에서 수행합니다.',
    to: ROUTES.dashboard,
  },
  {
    iconKey: 'layers',
    title: 'Service Overview Home',
    description: '서비스 개요, 핵심 기능, FAQ를 확인하는 안내 허브 화면입니다.',
    to: ROUTES.home,
  },
];

export const jobs: JobCard[] = [
  {
    title: 'Bot Operations Engineer',
    team: 'Automation Platform',
    location: 'Remote / Seoul',
    type: 'Full-time',
    iconKey: 'briefcase',
    summary: 'Discord 전송 파이프라인 신뢰성 개선과 장애 대응 자동화를 담당합니다.',
  },
  {
    title: 'Embedded Experience Developer',
    team: 'Embedded Surface',
    location: 'Remote',
    type: 'Contract',
    iconKey: 'layers',
    summary: 'Embedded App SDK 기반 인앱 UI 컴포넌트와 상호작용 흐름을 설계합니다.',
  },
  {
    title: 'Realtime Monitoring Analyst',
    team: 'Signal Intelligence',
    location: 'Seoul',
    type: 'Part-time',
    iconKey: 'radio',
    summary: '운영 로그/알림 패턴 분석 및 품질 지표 대시보드 운영을 담당합니다.',
  },
];

export const categories: CategoryCard[] = [
  { name: 'PROGRAMMING AND TECHNICAL', count: '100+', description: 'Real-time monitoring and automated dispatch engine.', iconKey: 'cpu' },
  { name: 'PRODUCT PLANNING', count: '12', description: 'Alert scenarios and operational workflow design.', iconKey: 'orbit' },
  { name: 'COMMUNITY OPERATIONS', count: '28', description: 'Server governance, permission policy, and channel mapping.', iconKey: 'wrench' },
  { name: 'QUALITY MANAGEMENT', count: '24', description: 'Failure log inspection and recovery runbook management.', iconKey: 'shieldCheck' },
];
