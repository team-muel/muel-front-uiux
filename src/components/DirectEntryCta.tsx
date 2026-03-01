import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ROUTES } from '../config/routes';
import { UI_PRESETS } from '../config/uiPresets';
import { BENCHMARK_EVENTS } from '../config/benchmarkEvents';
import { commonText } from '../content/commonText';
import { UiButton } from './ui/UiButton';

interface DirectEntryRoute {
  to: typeof ROUTES.inApp | typeof ROUTES.dashboard;
  label: string;
}

interface DirectEntryCtaProps {
  routes?: DirectEntryRoute[];
  className?: string;
}

const defaultRoutes: DirectEntryRoute[] = [
  { to: ROUTES.inApp, label: commonText.action.moveEmbedded },
  { to: ROUTES.dashboard, label: commonText.action.moveDashboard },
];

export const DirectEntryCta: React.FC<DirectEntryCtaProps> = ({
  routes = defaultRoutes,
  className = '',
}) => {
  return (
    <div className={`mt-12 ${UI_PRESETS.borderTop} pt-8 ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-card">
        <p className="type-body text-current">{commonText.helper.directEntry}</p>
        <div className="flex flex-wrap items-center gap-card">
          {routes.map((route) => (
            <UiButton
              key={route.to}
              to={route.to}
              variant="outline"
              size="lg"
              benchmarkEvent={BENCHMARK_EVENTS.ctaClick}
              benchmarkId={route.to}
              benchmarkLabel={route.label}
              benchmarkArea="direct-entry"
            >
              {route.label} <ArrowUpRight className="h-4 w-4" />
            </UiButton>
          ))}
        </div>
      </div>
    </div>
  );
};
