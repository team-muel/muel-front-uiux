import React from 'react';
import { AlertCircle, ArrowRight, Home, ShieldCheck } from 'lucide-react';
import { AppHeader } from '../components/ui/AppHeader';
import { TopSectionSwitcher } from '../components/TopSectionSwitcher';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { UiButton } from '../components/ui/UiButton';
import { UI_PRESETS } from '../config/uiPresets';
import { ROUTES } from '../config/routes';

export const OperationsAccessGate: React.FC = () => {
  return (
    <div className="surface-page surface-bridge hud-grid min-h-screen">
      <AppHeader title="MUEL OPERATIONS ACCESS" actions={<TopSectionSwitcher compact includeExternal={false} />} />

      <main className="section-wrap section-v-80">
        <SurfaceCard className={`mx-auto max-w-3xl rounded-xl ${UI_PRESETS.borderBase} bg-zinc-900/35 p-8`}>
          <div className="mono-data inline-flex items-center gap-2 text-xs tracking-[0.2em] text-current">
            <ShieldCheck className="h-4 w-4" />
            OPERATIONS ACCESS REQUIRED
          </div>

          <h1 className="type-h2 mt-4">운영 화면은 인증된 사용자만 접근할 수 있습니다.</h1>
          <p className="type-body mt-3 text-current">
            홈에서는 서비스 개요와 QnA를 확인할 수 있고, 운영 화면에서는 Discord 대시보드 기능을 수행합니다.
            현재 세션이 인증되지 않아 운영 화면 진입이 제한되었습니다.
          </p>

          <div className={`mt-6 rounded-lg ${UI_PRESETS.borderBase} bg-zinc-950/70 p-4 text-sm text-current`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <p>Discord 인증 완료 후 운영 화면으로 다시 진입해 주세요.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <UiButton to={ROUTES.home} variant="outline" size="lg">
              <Home className="h-4 w-4" /> 홈으로 이동
            </UiButton>
            <UiButton to={ROUTES.dashboard} variant="accent" size="lg">
              운영 화면 다시 확인 <ArrowRight className="h-4 w-4" />
            </UiButton>
          </div>
        </SurfaceCard>
      </main>
    </div>
  );
};
