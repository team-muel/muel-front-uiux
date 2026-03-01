import React from 'react';
import { LifeBuoy } from 'lucide-react';
import { AppHeader } from '../components/ui/AppHeader';
import { TopSectionSwitcher } from '../components/TopSectionSwitcher';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SectionHeader } from '../components/sections/GridSection';
import { HubTabs } from '../components/hub/HubTabs';
import { BackToTopButton } from '../components/BackToTopButton';
import { UI_PRESETS } from '../config/uiPresets';
import { supportHubTabs } from '../content/hubContent';
import { pageMetaTokens } from '../content/pageMetaTokens';

export const SupportCenter: React.FC = () => {
  const supportMeta = pageMetaTokens.support;

  return (
    <div className="surface-page surface-bridge hud-grid min-h-screen">
      <AppHeader title={supportMeta.headerTitle} actions={<TopSectionSwitcher />} />
      <main className="section-wrap section-v-80 section-cluster">
        <SurfaceCard className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-900/35 p-6`}>
          <div className="mono-data inline-flex items-center gap-2 text-xs tracking-[0.2em] text-current">
            <LifeBuoy className="h-3.5 w-3.5" />
            {supportMeta.badge}
          </div>
          <h1 className="type-h2 mt-4">{supportMeta.title}</h1>
          <p className="type-body mt-3 text-current">{supportMeta.description}</p>
        </SurfaceCard>

        <section className={UI_PRESETS.flowSection}>
          <SectionHeader title={supportMeta.sectionTitle} label={supportMeta.sectionLabel} accentLineClass={UI_PRESETS.accentLine} />
          <HubTabs tabs={supportHubTabs} defaultTabId={supportMeta.defaultTabId} />
        </section>
      </main>
      <BackToTopButton />
    </div>
  );
};
