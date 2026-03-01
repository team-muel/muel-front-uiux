import React from 'react';
import { useLocation } from 'react-router-dom';
import { sectionNavigationItems } from '../config/sectionNavigation';
import { UI_PRESETS } from '../config/uiPresets';
import { BENCHMARK_EVENTS } from '../config/benchmarkEvents';
import { UiButton } from './ui/UiButton';

interface TopSectionSwitcherProps {
  compact?: boolean;
  includeExternal?: boolean;
}

export const TopSectionSwitcher: React.FC<TopSectionSwitcherProps> = ({ compact = false, includeExternal = true }) => {
  const location = useLocation();
  const items = includeExternal ? sectionNavigationItems : sectionNavigationItems.filter((item) => !item.external);

  return (
    <nav className="flex max-w-full items-center gap-2 overflow-x-auto">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = !item.external && (location.pathname === item.to || (item.to === '/' && location.pathname === '/'));
        const commonClass = `!px-3 !py-1.5 !text-xs !gap-1.5 ${isActive ? UI_PRESETS.switcherActive : UI_PRESETS.switcherBase}`;
        const label = compact ? (item.shortLabel ?? item.label) : item.label;

        return (
          <UiButton
            key={item.label}
            to={!item.external ? item.to : undefined}
            href={item.external ? item.to : undefined}
            variant="outline"
            className={commonClass}
            ariaLabel={`${item.label} ${item.external ? '열기' : '이동'}`}
            benchmarkEvent={BENCHMARK_EVENTS.navClick}
            benchmarkId={item.to}
            benchmarkLabel={item.label}
            benchmarkArea="top-switcher"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </UiButton>
        );
      })}
    </nav>
  );
};
