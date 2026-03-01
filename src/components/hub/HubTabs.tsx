import React from 'react';
import { ExternalLink } from 'lucide-react';
import { UI_PRESETS } from '../../config/uiPresets';
import { HUB_VIEW_TOKENS } from '../../config/experienceTokens';
import { BENCHMARK_EVENTS } from '../../config/benchmarkEvents';
import { UiButton } from '../ui/UiButton';
import { SurfaceCard } from '../ui/SurfaceCard';
import { FaqAccordionItem } from '../ui/FaqAccordionItem';
import { type HubTab } from '../../content/hubContent';

interface HubTabsProps {
  tabs: HubTab[];
  defaultTabId?: string;
}

export const HubTabs: React.FC<HubTabsProps> = ({ tabs, defaultTabId }) => {
  const initialTabId = defaultTabId && tabs.some((tab) => tab.id === defaultTabId) ? defaultTabId : tabs[0]?.id;
  const [activeTabId, setActiveTabId] = React.useState<string>(initialTabId ?? '');
  const [openFaqIndex, setOpenFaqIndex] = React.useState<Record<string, number>>({});

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  if (!activeTab) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <UiButton
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            variant="tab"
            active={activeTab.id === tab.id}
            size="sm"
            benchmarkEvent={BENCHMARK_EVENTS.hubTabOpen}
            benchmarkId={tab.id}
            benchmarkLabel={tab.label}
            benchmarkArea="hub-tabs"
          >
            {tab.label}
          </UiButton>
        ))}
      </div>

      {activeTab.kind === 'items' && (
        <div className={activeTab.gridClassName ?? HUB_VIEW_TOKENS.defaultItemsGrid}>
          {activeTab.items.map((item) => (
            <SurfaceCard
              key={item.id}
              className={`${UI_PRESETS.gridCell} bg-zinc-900/35 p-6`}
              data-benchmark-event={BENCHMARK_EVENTS.hubItemOpen}
              data-benchmark-id={item.id}
              data-benchmark-label={item.title}
              data-benchmark-area="hub-item-card"
            >
              <div className="flex items-center justify-between gap-3">
                {item.category ? <div className="mono-data text-xs tracking-[0.16em] text-current">{item.category}</div> : <div />}
                {item.date ? <div className="mono-data text-xs text-current">{item.date}</div> : null}
              </div>
              <h3 className="mt-4 text-lg font-medium">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-current">{item.description}</p>
              {item.href ? (
                <a
                  href={item.href}
                  className="micro-underline mt-4 inline-flex items-center gap-1 text-sm text-current"
                  data-benchmark-event={BENCHMARK_EVENTS.hubItemOpen}
                  data-benchmark-id={item.id}
                  data-benchmark-label={item.title}
                  data-benchmark-area="hub-item-link"
                >
                  열기 <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </SurfaceCard>
          ))}
        </div>
      )}

      {activeTab.kind === 'faq' && (
        <div className="space-y-3">
          {activeTab.faqs.map((item, index) => {
            const isOpen = openFaqIndex[activeTab.id] === index;
            return (
              <FaqAccordionItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                isOpen={isOpen}
                index={index}
                onToggle={() =>
                  setOpenFaqIndex((prev) => ({
                    ...prev,
                    [activeTab.id]: prev[activeTab.id] === index ? -1 : index,
                  }))
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
