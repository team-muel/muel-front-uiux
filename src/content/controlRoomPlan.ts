import { ROUTES } from '../config/routes';

export type PlanStatus = 'completed' | 'in-progress' | 'pending';

export interface PlanPhase {
  id: string;
  title: string;
  status: PlanStatus;
  description: string;
}

export interface PlanTrack {
  id: string;
  title: string;
  subtitle: string;
  goal: string;
  phases: PlanPhase[];
}

export const controlRoomPlan: PlanTrack[] = [
  {
    id: 'track-1',
    title: 'Track 1. Data Pipeline',
    subtitle: '원자재 채굴 및 정제소 - Backend',
    goal: '금융 데이터의 비대칭성을 해소할 독점적 데이터 확보',
    phases: [
      {
        id: 't1-infra',
        title: '인프라 세팅 (Render + Supabase)',
        status: 'completed',
        description: '수집 엔진과 저장소 기반 구축 완료',
      },
      {
        id: 't1-fred',
        title: 'Phase 1.1 FRED API 직결',
        status: 'pending',
        description: 'Render 정기 수집 + Supabase 적재 + 호출 최적화',
      },
      {
        id: 't1-alt-data',
        title: 'Phase 1.2 Alt-Data 크롤러',
        status: 'pending',
        description: 'B2B 수출입/재고/해운 지표 기반 선행 시그널 확보',
      },
    ],
  },
  {
    id: 'track-2',
    title: 'Track 2. Control Room',
    subtitle: '중앙 통제실 및 쇼룸 - Frontend',
    goal: '긁어온 데이터를 시각화하고 퀀트 엔진을 통제하는 조종석',
    phases: [
      {
        id: 't2-ui-foundation',
        title: 'UI/UX 뼈대 + Progressive Disclosure',
        status: 'completed',
        description: 'Vercel 배포 및 상호작용 중심 레이아웃 완료',
      },
      {
        id: 't2-playground',
        title: '거시경제 놀이터 모듈',
        status: 'completed',
        description: 'FRED 지식 사전 결합 + 유저 조합형 차트 구현',
      },
      {
        id: 't2-live-binding',
        title: 'Phase 2.1 실제 데이터 바인딩',
        status: 'in-progress',
        description: 'Mock 제거 후 Supabase 실데이터 연결 진행 중',
      },
      {
        id: 't2-quant-panel',
        title: 'Phase 2.2 퀀트 트레이딩 패널',
        status: 'pending',
        description: '포지션/승률/CVD 실시간 모니터링 패널 추가 예정',
      },
    ],
  },
  {
    id: 'track-3',
    title: 'Track 3. Quant Engine & B2C',
    subtitle: '알파 창출 및 대중화 - Algorithmic Bot',
    goal: '일반 대중도 쉽게 접근 가능한 정제된 금융 시그널 배포',
    phases: [
      {
        id: 't3-dev-env',
        title: '개발 환경 세팅 (VS Code + Copilot)',
        status: 'completed',
        description: '팀원의 매매 로직 개발 생산성 기반 완료',
      },
      {
        id: 't3-engine',
        title: 'Phase 3.1 퀀트 엔진 고도화',
        status: 'in-progress',
        description: '대안 데이터 + 매크로 지표 결합 알파 도출 진행 중',
      },
      {
        id: 't3-b2c',
        title: 'Phase 3.2 Discord B2C 배포',
        status: 'pending',
        description: '복잡한 시그널을 직관 문장으로 자동 번역·송출',
      },
    ],
  },
];

export const controlRoomMainFlow = [
  {
    id: 'discord',
    label: 'Discord',
    description: '운영 이벤트와 커뮤니티 맥락 확인',
    to: undefined,
  },
  {
    id: 'playground',
    label: 'Playground',
    description: '탐색 시나리오 조합 및 실험',
    to: ROUTES.playground,
  },
  {
    id: 'research',
    label: 'Research',
    description: '통합 차트와 리서치 해석 수행',
    to: ROUTES.inApp,
  },
] as const;

export const CONTROL_ROOM_FLOW_LABEL = controlRoomMainFlow.map((step) => step.label).join(' -> ');
export const CONTROL_ROOM_FLOW_TITLE = `Main Flow: ${CONTROL_ROOM_FLOW_LABEL}`;
export const CONTROL_ROOM_FLOW_DESCRIPTION =
  'Discord 운영 맥락에서 시작해 Playground 탐색 후 Research 분석으로 이어집니다.';
