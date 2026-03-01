import React from 'react';
import { UI_PRESETS } from '../config/uiPresets';
import { BENCHMARK_EVENTS } from '../config/benchmarkEvents';

interface SectionFlowItem {
  id: string;
  label: string;
}

interface SectionFlowRailProps {
  items: SectionFlowItem[];
  activeSection: string;
  activeTextClassName?: string;
}

export const SectionFlowRail: React.FC<SectionFlowRailProps> = ({
  items,
  activeSection,
  activeTextClassName = UI_PRESETS.inkText,
}) => {
  return (
    <aside className="pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      <div className={`pointer-events-auto rounded-xl ${UI_PRESETS.borderBase} bg-zinc-950/80 p-3 backdrop-blur`}>
        <div className="mono-data mb-3 text-[10px] tracking-[0.2em] text-current">SCROLL FLOW</div>
        <nav className="flex flex-col gap-2">
          {items.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`group flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition ${isActive ? activeTextClassName : 'text-current hover:text-current'}`}
                data-benchmark-event={BENCHMARK_EVENTS.sectionRailClick}
                data-benchmark-id={section.id}
                data-benchmark-label={section.label}
                data-benchmark-area="section-rail"
              >
                <span
                  className={`h-2 w-2 rounded-full border transition ${isActive ? `${UI_PRESETS.flowDotActiveBorder} ${UI_PRESETS.flowDotActiveBg}` : 'border-zinc-600 bg-transparent group-hover:border-zinc-400'}`}
                />
                <span className="mono-data tracking-[0.12em]">{section.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
