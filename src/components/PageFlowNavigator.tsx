import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { UI_PRESETS } from '../config/uiPresets';
import { BENCHMARK_EVENTS } from '../config/benchmarkEvents';
import { SurfaceCard } from './ui/SurfaceCard';
import { UiButton } from './ui/UiButton';

interface PageFlowNavigatorProps {
  current: number;
  total: number;
  title: string;
  description?: string;
  prevTo?: string;
  prevLabel?: string;
  nextTo?: string;
  nextLabel?: string;
}

export const PageFlowNavigator: React.FC<PageFlowNavigatorProps> = ({
  current,
  total,
  title,
  description,
  prevTo,
  prevLabel = '이전 화면',
  nextTo,
  nextLabel = '다음 화면',
}) => {
  return (
    <section className={UI_PRESETS.flowSection}>
      <SurfaceCard className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-900/35 p-6`}>
        <div className="mono-data text-xs tracking-[0.16em] text-current">PAGE FLOW</div>
        <h2 className="type-h2 mt-3">{title}</h2>
        {description && <p className="type-body mt-3 text-current">{description}</p>}
        <div className={`mt-5 flex items-center justify-between gap-4 ${UI_PRESETS.borderTop} pt-4`}>
          <span className="mono-data text-xs tracking-[0.15em] text-current">
            PAGE {current} / {total}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {prevTo && (
              <UiButton
                to={prevTo}
                variant="outline"
                benchmarkEvent={BENCHMARK_EVENTS.flowClick}
                benchmarkId={prevTo}
                benchmarkLabel={prevLabel}
                benchmarkArea="page-flow-prev"
              >
                <ArrowLeft className="h-4 w-4" /> {prevLabel}
              </UiButton>
            )}
            {nextTo && (
              <UiButton
                to={nextTo}
                variant="accent"
                benchmarkEvent={BENCHMARK_EVENTS.flowClick}
                benchmarkId={nextTo}
                benchmarkLabel={nextLabel}
                benchmarkArea="page-flow-next"
              >
                {nextLabel} <ArrowRight className="h-4 w-4" />
              </UiButton>
            )}
          </div>
        </div>
      </SurfaceCard>
    </section>
  );
};
