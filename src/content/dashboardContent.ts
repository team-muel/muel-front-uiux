export type HubMetric = {
  id: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
};

export type HubPageContent = {
  header: {
    title: string;
    inviteBot: string;
    browseFeatures: string;
  };
  hero: {
    badge: string;
    title: string;
    description: string;
    panelKicker: string;
    secondaryLinks: {
      features: string;
      snapshots: string;
    };
  };
  quickHighlights: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  socialProof: {
    title: string;
    description: string;
  };
  chapter: {
    overline: string;
    title: string;
    description: string;
  };
  sections: {
    metrics: {
      overline: string;
      title: string;
      description: string;
      ariaLabel: string;
    };
    snapshots: {
      overline: string;
      title: string;
      description: string;
      prefix: string;
      ariaLabel: string;
    };
  };
  metrics: HubMetric[];
  features: Array<{
    id: string;
    title: string;
    subtitle: string;
    description: string;
    token: string;
  }>;
  snapshots: Array<{
    id: string;
    title: string;
    description: string;
  }>;
};

export const dashboardContent: HubPageContent = {
  header: {
    title: 'muel',
    inviteBot: 'Discord에 추가',
    browseFeatures: '기능 보기',
  },
  hero: {
    badge: '',
    title: '경제 리서치 팀을 위한 / 디스코드 허브',
    description: '디스코드 운영, 데이터 놀이터, 리서치 워크스페이스를 하나의 플로우로 연결하는 메인 허브입니다.',
    panelKicker: '오늘의 운영 스냅샷',
    secondaryLinks: {
      features: '메인 운영 플로우',
      snapshots: '화면 요약',
    },
  },
  sections: {
    metrics: {
      overline: '운영 지표',
      title: '한눈에 보는 현재 상태',
      description: '디스코드, 놀이터, 리서치의 핵심 상태를 빠르게 확인합니다.',
      ariaLabel: 'operations metrics',
    },
    snapshots: {
      overline: 'SCROLL SNAP PREVIEW',
      title: '플로우 스냅샷',
      description: '현재 단계별 화면을 빠르게 확인합니다.',
      prefix: 'SNAP',
      ariaLabel: 'dashboard snapshots',
    },
  },
  quickHighlights: [
    {
      id: 'quick-brief',
      title: 'Discord 상태',
      description: '커뮤니티 운영 이벤트와 알림 컨텍스트를 바로 확인합니다.',
    },
    {
      id: 'quick-ops',
      title: 'Playground 탐색',
      description: '지표 조합과 지식 사전을 통해 가설을 빠르게 실험합니다.',
    },
  ],
  socialProof: {
    title: '운영 팀을 위한 리서치 중심 모듈',
    description: '리서치 자동화와 커뮤니티 운영 기능을 동일한 규칙으로 연결합니다.',
  },
  chapter: {
    overline: '운영 흐름',
    title: '핵심 운영 모듈',
    description: '자주 사용하는 운영 모듈을 한곳에서 확인합니다.',
  },
  metrics: [
    {
      id: 'metric-servers',
      value: 84,
      suffix: '+',
      label: 'DISCORD ACTIVE',
      description: '현재 운영 중인 서버 및 세션 상태',
    },
    {
      id: 'metric-briefs',
      value: 540,
      suffix: '+',
      label: 'PLAYGROUND RUNS',
      description: '최근 7일 데이터 조합 실험 건수',
    },
    {
      id: 'metric-latency',
      value: 3,
      suffix: 's',
      label: 'RESEARCH REFRESH',
      description: '리서치 화면 데이터 갱신 평균 지연',
    },
  ],
  features: [
    {
      id: 'flow-discord',
      title: 'Discord Operations',
      subtitle: '커뮤니티 실시간 운영',
      description: '서버 이벤트, 알림 정책, 운영 로그를 중심으로 즉시 상황을 파악합니다.',
      token: 'DISCORD',
    },
    {
      id: 'flow-playground',
      title: 'Playground Compose',
      subtitle: '가설 탐색과 조합 실험',
      description: '핵심 지표를 조합해 빠르게 비교하고, 분석에 필요한 컨텍스트를 준비합니다.',
      token: 'PLAYGROUND',
    },
    {
      id: 'flow-research',
      title: 'Research Workbench',
      subtitle: '심화 분석 및 해석',
      description: '탐색 결과를 리서치 화면에서 구조화해 의사결정에 연결합니다.',
      token: 'RESEARCH',
    },
  ],
  snapshots: [
    {
      id: 'snapshot-discord',
      title: 'Discord 운영 화면',
      description: '실시간 이벤트와 알림 상태를 먼저 확인하는 시작 지점.',
    },
    {
      id: 'snapshot-playground',
      title: 'Playground 실험 화면',
      description: '지표 조합과 시나리오 탐색으로 가설을 검증하는 중간 단계.',
    },
    {
      id: 'snapshot-research',
      title: 'Research 분석 화면',
      description: '탐색 결과를 심화 분석으로 확장해 최종 해석을 정리하는 단계.',
    },
  ],
} as const;
