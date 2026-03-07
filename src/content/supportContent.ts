import { ROUTES } from '../config/routes';
import { BOT_INVITE_URL } from '../config/sectionNavigation';

export const supportContent = {
  hero: {
    overline: 'SUPPORT CENTER',
    title: '문의센터',
    description: '이슈 유형에 맞는 채널을 선택해 빠르게 문의를 남길 수 있습니다.',
  },
  channels: [
    {
      id: 'ticket',
      overline: 'CHANNEL',
      title: '고객센터 티켓',
      description: '기능 오류, 접근 문제, 계정 이슈를 접수하는 기본 채널입니다.',
      ctaLabel: '티켓 접수',
      to: ROUTES.support,
    },
    {
      id: 'discord',
      overline: 'CHANNEL',
      title: 'Discord 운영 채널',
      description: '실시간 상황 공유와 빠른 맥락 전달이 필요한 경우에 적합합니다.',
      ctaLabel: 'Discord 바로가기',
      href: BOT_INVITE_URL,
    },
    {
      id: 'feedback',
      overline: 'CHANNEL',
      title: '기획/개선 요청',
      description: '지표 추가, 화면 개선, 워크플로우 제안 등 제품 피드백을 남길 수 있습니다.',
      ctaLabel: '리서치로 이동',
      to: ROUTES.inApp,
    },
  ],
  responsePolicy: {
    overline: 'RESPONSE POLICY',
    title: '응답 기준',
    description: '운영 시간 기준 1영업일 내 1차 응답을 목표로 하며, 긴급 장애는 우선 대응합니다.',
    notes: [
      '긴급 장애는 고객센터 티켓과 Discord 문의를 동시에 남겨주세요.',
      '문의 시 화면 캡처, 발생 시간, 재현 단계가 포함되면 처리 속도가 빨라집니다.',
    ],
    ctas: [
      {
        id: 'discord-help',
        label: 'Discord 문의',
        href: BOT_INVITE_URL,
        variant: 'solid' as const,
        size: 'lg' as const,
      },
      {
        id: 'back-home',
        label: '메인으로 이동',
        to: ROUTES.home,
        variant: 'outline' as const,
        size: 'md' as const,
      },
    ],
  },
  faq: {
    overline: 'FAQ',
    title: '자주 묻는 질문',
    items: [
      {
        id: 'faq-empty-research',
        question: '리서치 데이터가 비어 보입니다.',
        answer: '백엔드 동기화 지연 또는 권한 문제가 원인일 수 있습니다. 먼저 새로고침 후 재접속을 시도하세요.',
      },
      {
        id: 'faq-missing-series',
        question: '플레이그라운드에서 지표가 검색되지 않습니다.',
        answer: '해당 지표가 현재 카탈로그에 없는 상태일 수 있습니다. 지표 ID와 범위를 확인한 뒤 문의를 남겨주세요.',
      },
      {
        id: 'faq-quant-lag',
        question: '퀀트 패널 수치가 업데이트되지 않습니다.',
        answer: '실시간 파이프라인 상태 점검 중일 수 있습니다. 지속되면 장애 문의로 분류해 접수해 주세요.',
      },
    ],
    footerPrefix: '해결되지 않은 이슈는',
    footerLinkLabel: '리서치 섹션',
    footerSuffix: '에서 재현 후 문의해 주세요.',
  },
} as const;
