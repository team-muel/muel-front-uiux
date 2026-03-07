import { ROUTES } from '../config/routes';

export const playgroundContent = {
  chart: {
    description: 'FRED 조합 차트를 놀이터에서 바로 실험하고, 결과를 리서치로 이어갑니다.',
  },
  actions: [
    {
      id: 'to-research',
      label: '리서치 바로가기',
      to: ROUTES.inApp,
      variant: 'solid' as const,
      size: 'lg' as const,
    },
    {
      id: 'to-home',
      label: '메인 허브로 돌아가기',
      to: ROUTES.home,
      variant: 'outline' as const,
      size: 'md' as const,
    },
  ],
} as const;
