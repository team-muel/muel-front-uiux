export type LandingSecondSectionFlowItem = {
  id: string;
  label: string;
};

export type UpdateItem = {
  title: string;
  date: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const landingSecondSectionFlow: LandingSecondSectionFlowItem[] = [
  { id: 'updates', label: '01 / News Cards' },
  { id: 'quant', label: '02 / Quant Layer' },
  { id: 'faq', label: '03 / FAQ' },
  { id: 'join', label: '04 / CTA + Footer' },
  { id: 'flow-nav', label: '05 / Back' },
];

export const updates: UpdateItem[] = [
  {
    title: 'Alert Engine Improvement',
    date: 'DATE 2026/03/02',
    description: 'Improved YouTube community post detection and end-to-end delivery stability.',
  },
  {
    title: 'Dashboard IA Refactor',
    date: 'DATE 2026/02/20',
    description: 'Restructured information hierarchy for faster operator decision flow.',
  },
  {
    title: 'Channel Linking UX Update',
    date: 'DATE 2026/02/11',
    description: 'Simplified guild/channel selection flow and strengthened error guidance.',
  },
];

export const faqs: FaqItem[] = [
  {
    question: '이 서비스는 어떤 흐름으로 동작하나요?',
    answer: 'YouTube 소스를 감시해 새 이벤트를 감지하고, Discord 채널로 자동 전송한 뒤 로그를 대시보드에 기록합니다.',
  },
  {
    question: 'Embedded와 Dashboard는 어떻게 다르나요?',
    answer: 'Embedded는 Discord 인앱 경험 전용 화면이고, Dashboard는 운영자 설정/모니터링 제어 화면입니다.',
  },
  {
    question: '알림 소스는 몇 개까지 등록할 수 있나요?',
    answer: '기본적으로 여러 소스를 등록할 수 있으며, 운영 안정성을 위해 소스별 상태 로그를 함께 확인하는 것을 권장합니다.',
  },
];

export const macroRadar = [
  { label: 'Liquidity', value: 72 },
  { label: 'Volatility', value: 44 },
  { label: 'Momentum', value: 67 },
  { label: 'Risk Spread', value: 53 },
  { label: 'Sentiment', value: 61 },
  { label: 'Stability', value: 70 },
];

export const flowLabels = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'];
export const flowValues = [61, 64, 66, 59, 71, 74, 69, 77];

export const lockedInsightRows = [
  { label: 'Core CPI Forecast', value: '3.42% → 2.88%' },
  { label: 'Policy Rate Path', value: 'Q3 Pivot Probability 74%' },
  { label: 'FX Regime Shift', value: 'KRW Strength Window 5W' },
  { label: 'Risk-On Trigger', value: 'Liquidity Delta +18.6' },
];
