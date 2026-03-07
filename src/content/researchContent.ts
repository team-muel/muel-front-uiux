import { ROUTES } from '../config/routes';

export const researchContent = {
  hero: {
    overline: 'RESEARCH IN-APP LINKED SURFACE',
    title: '리서치 인앱 연동 워크스페이스',
    description:
      'Discord 인앱에서 웹으로 연동 시 열리는 전용 분석 공간입니다. 경제·퀀트 API를 연결해 필요한 데이터를 시각화하고, 운영 팀의 분석 노트를 앱 유저 관점으로 구조화합니다.',
  },
  sections: {
    connectors: {
      overline: '01 API CONNECTORS',
      title: '연결 상태',
      description: '필요한 데이터 소스를 연결하고 갱신 상태를 점검합니다.',
    },
    workbench: {
      overline: '02 RESEARCH WORKBENCH',
      title: '열람 워크벤치',
      description: '수집 -> 가공 -> 시각화 -> 리서치 노트 확인 흐름을 한 화면에서 확인합니다.',
    },
    charts: {
      overline: '03 VISUAL ANALYSIS',
      title: '시각화 레이어',
      description: '거시 리스크와 퀀트 시그널을 동시에 비교해 해석합니다.',
    },
  },
  connectors: [
    {
      id: 'macro-api',
      title: '거시 경제 API',
      status: 'CONNECTED',
      description: '금리, 물가, 환율, 유동성 지표를 수집해 기준 시계열로 정렬합니다.',
    },
    {
      id: 'quant-api',
      title: '퀀트 신호 API',
      status: 'READY',
      description: '팩터 신호와 변동성 이벤트를 수신해 실시간 신호 레이어를 만듭니다.',
    },
    {
      id: 'publish-api',
      title: '리서치 콘텐츠 허브',
      status: 'REFERENCE',
      description: '운영자가 발행한 리서치 콘텐츠 메타데이터를 열람하는 기준 섹션입니다.',
    },
  ],
  workbench: {
    feeds: ['FRED / 한국은행 ECOS', 'Yahoo / Polygon / 자체 팩터', 'Discord 인앱 컨텍스트'],
    views: ['멀티 자산 비교 차트', '리스크 레이더', '이벤트 타임라인'],
    library: ['운영자 리서치 노트 피드', '카테고리/태그 메타데이터 보기', '최신 노트 열람 체크리스트'],
  },
  radar: {
    title: 'Macro Risk Radar',
    subtitle: '거시 리스크 레이어',
    metrics: [
      { label: 'Liquidity', value: 72 },
      { label: 'Volatility', value: 44 },
      { label: 'Momentum', value: 67 },
      { label: 'Risk Spread', value: 53 },
      { label: 'Sentiment', value: 61 },
      { label: 'Stability', value: 70 },
    ],
  },
  trend: {
    title: 'Quant Signal Timeline',
    subtitle: '신호 편차 추세',
    labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'],
    values: [61, 64, 66, 59, 71, 74, 69, 77],
  },
  premium: {
    title: 'Research Insight Deck',
    subtitle: '리서치 콘텐츠 열람 레이어',
    lockLabel: 'VIEW ONLY · PUBLISHED BY OPERATOR',
    rows: [
      { label: 'Core CPI Forecast', value: '3.42% → 2.88%' },
      { label: 'Policy Rate Path', value: 'Q3 Pivot Probability 74%' },
      { label: 'FX Regime Shift', value: 'KRW Strength Window 5W' },
      { label: 'Risk-On Trigger', value: 'Liquidity Delta +18.6' },
    ],
  },
  quantPreview: {
    overline: 'PHASE 2.2 PREVIEW',
    title: '퀀트 트레이딩 패널 (준비 중)',
    description: '포지션, 승률, CVD 실시간 슬롯을 미리 배치해 이후 엔진 연동을 빠르게 진행할 수 있도록 구성했습니다.',
    noDataMessage: 'Quant backend data not connected yet. Contract endpoint: /api/quant/panel',
  },
  contact: {
    overline: 'CONTACT',
    title: '문의',
    description: '리서치 사용 중 필요한 문의는 고객센터 또는 Discord를 통해 바로 남길 수 있습니다.',
    supportCta: '문의센터 이동',
    discordCta: 'Discord 문의',
    channels: [
      {
        id: 'channel-support',
        label: '고객센터 티켓',
        detail: '기능 오류, 계정 이슈, 접근 문제 접수',
      },
      {
        id: 'channel-discord',
        label: 'Discord 운영 채널',
        detail: '실시간 문의 및 사용 맥락 공유',
      },
      {
        id: 'channel-roadmap',
        label: '기획/피드백 요청',
        detail: '신규 지표 요청, UX 개선 제안, 운영 정책 문의',
      },
    ],
    responsePolicy: '운영 시간 기준 1영업일 내 1차 응답을 목표로 합니다.',
    escalationNote: '긴급 장애는 고객센터 티켓과 Discord를 동시에 남겨 우선 대응을 요청하세요.',
  },
  presets: {
    embedded: {
      page: {
        mainClassName: 'section-wrap section-v-80 section-cluster dashboard-kpay-flow',
      },
      stepNav: {
        ariaLabel: 'Research flow steps',
        showLabels: false,
        showSeparators: true,
      },
      core: {
        feedsLabel: 'DATA FEEDS',
        viewsLabel: 'VISUAL MODES',
        libraryLabel: 'RESEARCH ARCHIVE VIEW',
      },
      hero: {
        layout: 'embedded',
      },
      charts: {
        radar: {
          title: 'Macro Risk Radar',
          subtitle: '거시 리스크 레이어',
        },
        trend: {
          title: 'Quant Signal Timeline',
          subtitle: '신호 편차 추세',
        },
        premium: {
          title: 'Research Insight Deck',
          subtitle: '리서치 콘텐츠 열람 레이어',
          lockLabel: 'VIEW ONLY · PUBLISHED BY OPERATOR',
        },
      },
    },
    studio: {
      page: {
        mainClassName: 'section-wrap section-v-80 section-cluster dashboard-kpay-flow dashboard-main-shell',
      },
      stepNav: {
        ariaLabel: 'Research pipeline steps',
        showLabels: true,
        showSeparators: false,
      },
      core: {
        feedsLabel: 'DATA FEEDS',
        viewsLabel: 'VISUAL MODES',
        libraryLabel: 'PUBLISHED LIBRARY',
      },
      hero: {
        layout: 'studio',
        ctas: [
          {
            label: 'Open In-App Workspace',
            to: ROUTES.inApp,
            variant: 'solid',
            size: 'lg',
            className: 'kpay-primary-cta muel-interact',
          },
          {
            label: 'View Support Center',
            to: ROUTES.support,
            variant: 'outline',
            size: 'md',
            className: 'muel-interact',
          },
        ],
        kpi: {
          kicker: 'LIVE CONNECTOR SNAPSHOT',
          listAriaLabel: 'Current connector states',
          footnoteLabel: 'SOURCE OF TRUTH',
          footnoteLinkLabel: 'Validate in Embedded App',
          footnoteLinkTo: ROUTES.inApp,
        },
      },
      charts: {
        radar: {
          title: 'Studio Macro Risk Radar',
          subtitle: '운영 리서치 기준 레이어',
        },
        trend: {
          title: 'Studio Quant Signal Timeline',
          subtitle: '운영 편집용 신호 추세',
        },
        premium: {
          title: 'Research Insight Deck',
          subtitle: '리서치 콘텐츠 열람 레이어',
          lockLabel: 'REFERENCE VIEW · OPERATOR CONTROLLED',
        },
      },
      data: {
        connectors: [
          {
            id: 'macro-api',
            title: '거시 경제 API',
            status: 'CONNECTED',
            description: '핵심 거시 시계열 정합성 검증 완료 상태를 유지합니다.',
          },
          {
            id: 'quant-api',
            title: '퀀트 신호 API',
            status: 'MONITORING',
            description: '운영 대시보드 기준 임계치 및 이상치 모니터링이 활성화되어 있습니다.',
          },
          {
            id: 'publish-api',
            title: '리서치 콘텐츠 허브',
            status: 'EDITORIAL READY',
            description: '발행 메타데이터 검수 플로우와 동기화되어 편집 준비 상태입니다.',
          },
        ],
        workbench: {
          feeds: ['FRED / 한국은행 ECOS (검증)', 'Yahoo / Polygon / 내부 팩터 (운영)', 'Discord 인앱 컨텍스트 (세션)'],
          views: ['운영 비교 차트', '리스크 레이더 운영뷰', '이벤트 타임라인 검수뷰'],
          library: ['발행본 검수 피드', '카테고리/태그 교정 로그', '출시 전 체크리스트'],
        },
        radar: {
          metrics: [
            { label: 'Liquidity', value: 76 },
            { label: 'Volatility', value: 41 },
            { label: 'Momentum', value: 69 },
            { label: 'Risk Spread', value: 49 },
            { label: 'Sentiment', value: 63 },
            { label: 'Stability', value: 73 },
          ],
        },
        trend: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
          values: [62, 63, 67, 65, 72, 75, 73, 79],
        },
        premium: {
          rows: [
            { label: 'Editorial Queue', value: '4 Scheduled / 1 Draft' },
            { label: 'Macro Revision Note', value: 'CPI Delta +0.18pt' },
            { label: 'Signal Confidence', value: 'Tier-A 68% / Tier-B 24%' },
            { label: 'Publish Readiness', value: 'Final QA 92%' },
          ],
        },
      },
    },
  },
} as const;

export type ResearchPresetKey = keyof typeof researchContent.presets;

export const isResearchPresetKey = (value: string): value is ResearchPresetKey => {
  return value in researchContent.presets;
};

export const getResolvedResearchPreset = (presetKey: ResearchPresetKey) => {
  const preset = researchContent.presets[presetKey];
  const presetData = 'data' in preset ? preset.data : undefined;

  return {
    key: presetKey,
    page: {
      mainClassName: preset.page.mainClassName,
    },
    stepNav: {
      ariaLabel: preset.stepNav.ariaLabel,
      showLabels: preset.stepNav.showLabels,
      showSeparators: preset.stepNav.showSeparators,
    },
    core: {
      feedsLabel: preset.core.feedsLabel,
      viewsLabel: preset.core.viewsLabel,
      libraryLabel: preset.core.libraryLabel,
    },
    hero: {
      layout: preset.hero.layout,
      overline: researchContent.hero.overline,
      title: researchContent.hero.title,
      description: researchContent.hero.description,
      studio: preset.hero.layout === 'studio'
        ? {
            ctas: preset.hero.ctas,
            kpi: preset.hero.kpi,
          }
        : undefined,
    },
    charts: {
      radar: {
        title: preset.charts?.radar?.title ?? researchContent.radar.title,
        subtitle: preset.charts?.radar?.subtitle ?? researchContent.radar.subtitle,
      },
      trend: {
        title: preset.charts?.trend?.title ?? researchContent.trend.title,
        subtitle: preset.charts?.trend?.subtitle ?? researchContent.trend.subtitle,
      },
      premium: {
        title: preset.charts?.premium?.title ?? researchContent.premium.title,
        subtitle: preset.charts?.premium?.subtitle ?? researchContent.premium.subtitle,
        lockLabel: preset.charts?.premium?.lockLabel ?? researchContent.premium.lockLabel,
      },
    },
    data: {
      connectors: presetData?.connectors ?? researchContent.connectors,
      workbench: {
        feeds: presetData?.workbench?.feeds ?? researchContent.workbench.feeds,
        views: presetData?.workbench?.views ?? researchContent.workbench.views,
        library: presetData?.workbench?.library ?? researchContent.workbench.library,
      },
      radar: {
        metrics: presetData?.radar?.metrics ?? researchContent.radar.metrics,
      },
      trend: {
        labels: presetData?.trend?.labels ?? researchContent.trend.labels,
        values: presetData?.trend?.values ?? researchContent.trend.values,
      },
      premium: {
        rows: presetData?.premium?.rows ?? researchContent.premium.rows,
      },
    },
  };
};

export type ResolvedResearchPreset = ReturnType<typeof getResolvedResearchPreset>;
