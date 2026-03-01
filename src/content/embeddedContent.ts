import { type AppIconKey } from '../config/iconRegistry';

export type EmbeddedSdkBlock = {
  title: string;
  value: string;
  description: string;
  iconKey: AppIconKey;
};

export type EmbeddedModule = {
  title: string;
  subtitle: string;
  iconKey: AppIconKey;
};

export const sdkBlocks: EmbeddedSdkBlock[] = [
  {
    title: 'SDK HANDSHAKE',
    value: 'READY',
    description: 'Initial bridge setup and runtime context sync for the Discord Embedded App SDK.',
    iconKey: 'link2',
  },
  {
    title: 'IN-APP AUTH',
    value: 'PENDING',
    description: 'Secure in-app auth flow for exchanging guild and user context from Discord clients.',
    iconKey: 'shieldCheck',
  },
  {
    title: 'CONTEXT FEED',
    value: 'LIVE',
    description: 'Real-time channel, guild, and permission feeds for adaptive embedded UI composition.',
    iconKey: 'cpu',
  },
];

export const embedModules: EmbeddedModule[] = [
  {
    title: 'News Embed',
    subtitle: '커뮤니티/경제 속보 피드 임베드 모듈',
    iconKey: 'newspaper',
  },
  {
    title: 'Quant Signal Embed',
    subtitle: '실시간 계량 신호 추적 임베드 모듈',
    iconKey: 'chartNoAxesCombined',
  },
  {
    title: 'Premium Gate Embed',
    subtitle: '프리미엄 페이월 CTA 임베드 모듈',
    iconKey: 'wallet',
  },
];

export const embeddedPageContent = {
  headerTitle: 'DISCORD EMBEDDED APP SURFACE',
  intro: {
    badge: 'EMBEDDED RUNTIME',
    titleLines: ['Discord 인앱 전용 화면과', 'Bot 운영 대시보드를 분리합니다.'],
    description:
      '이 영역은 향후 Discord Embedded App SDK 기능(컨텍스트 인식, 인앱 인증, 연동 UI)을 담는 전용 표면입니다. 기존 운영 제어 중심의 Bot Dashboard와 목적을 분리해 IA를 명확하게 유지합니다.',
  },
  sections: {
    sdkGrid: { title: 'SDK Integration Grid', label: 'PHASED DELIVERY' },
    modules: { title: 'Additional Embedded Modules', label: 'HOOKING COMPONENTS' },
    policy: {
      title: 'Surface Split Policy',
      embeddedPath: '/embedded',
      embeddedDescription: 'Discord 인앱 임베디드 사용자 경험 전용',
      dashboardPath: '/dashboard',
      dashboardDescription: '운영자용 봇 설정/모니터링 대시보드 전용',
    },
  },
} as const;
