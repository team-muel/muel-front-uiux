export const homeContent = {
  landing: {
    stickyDashboardLabel: '운영 화면',
    hero: {
      badge: 'HOME HUB',
      titleLines: ['YouTube 신호를', 'Discord 운영 플로우로', '즉시 변환합니다.'],
      description:
        'Muel은 커뮤니티 게시글 감지, 알림 스레드 생성, 상태 로깅을 하나의 운영 화면으로 연결합니다. 빠른 확인과 명확한 제어를 위해 프론트엔드를 실무 중심으로 재구성했습니다.',
    },
    heroActions: {
      embedded: 'QnA 보기',
      dashboard: '운영 화면',
      viewStructure: '구조 보기',
    },
    sections: {
      architecture: { title: 'Surface Architecture', label: 'HOME / DASHBOARD SPLIT' },
      categories: { title: 'Core Capabilities', label: 'LIVE OVERVIEW' },
      jobs: { title: 'Job Openings', label: 'CARD MODULE' },
      faq: { title: 'FAQ', label: 'SERVICE GUIDE' },
    },
    jobMetaLabels: {
      team: 'Team',
      location: 'Location',
      type: 'Type',
    },
    flow: {
      title: '홈 핵심 구간 안내',
      description: '홈은 서비스 개요와 QnA를 제공합니다. 다음 화면에서 인앱 데이터 뷰를 확인할 수 있습니다.',
      nextLabel: '인앱 데이터로',
    },
  },
  landingSecond: {
    intro: {
      badge: 'CONTINUED SURFACE',
      title: '탐색 중심 섹션 화면',
      description: '뉴스, 퀀트, FAQ, CTA/푸터를 모아 상세 탐색에 집중한 화면입니다.',
    },
    sections: {
      updates: { title: 'News Feed', label: 'NEWS CARD' },
      quant: { title: 'Quant Insight Layer', label: 'ECONOMETRIC PREVIEW' },
      faq: { title: 'FAQ', label: 'ACCORDION' },
    },
    join: {
      badge: 'JOIN MUEL',
      title: '운영 자동화 기반을 강화하세요.',
      embeddedLabel: '홈 허브 보기',
    },
    footer: {
      badge: 'FOOTER',
      links: {
        part1: 'Home',
        embedded: '홈 허브',
        dashboard: 'Dashboard',
      },
    },
    flow: {
      title: '탐색 구간 완료',
      description: '첫 화면으로 돌아가면 홈 허브부터 다시 확인할 수 있습니다.',
      prevLabel: '첫 화면으로',
    },
  },
} as const;
