import React from 'react';
import { Newspaper, Sparkles } from 'lucide-react';
import { AppHeader } from '../components/ui/AppHeader';
import { TopSectionSwitcher } from '../components/TopSectionSwitcher';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { PanelHeader } from '../components/ui/PanelHeader';
import { HubTabs } from '../components/hub/HubTabs';
import { BackToTopButton } from '../components/BackToTopButton';
import { UI_PRESETS } from '../config/uiPresets';
import { studioHubTabs } from '../content/hubContent';
import { pageMetaTokens } from '../content/pageMetaTokens';

export const StudioReference: React.FC = () => {
  const studioMeta = pageMetaTokens.studio;

  return (
    <div className="surface-page surface-bridge hud-grid min-h-screen">
      <AppHeader title={studioMeta.headerTitle} actions={<TopSectionSwitcher />} />
      <main className="section-wrap section-v-80 section-cluster">
        <SurfaceCard className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-900/35 p-6`}>
          <div className="mono-data inline-flex items-center gap-2 text-xs tracking-[0.2em] text-current">
            <Sparkles className="h-3.5 w-3.5" />
            {studioMeta.badge}
          </div>
          <h1 className="type-h2 mt-4">{studioMeta.title}</h1>
          <p className="type-body mt-3 text-current">{studioMeta.description}</p>
        </SurfaceCard>

        <section className={UI_PRESETS.flowSection}>
          <PanelHeader title={studioMeta.moduleTitle} label={studioMeta.moduleLabel} leading={<Newspaper className="h-5 w-5 text-current" />} />
          <HubTabs tabs={studioHubTabs} defaultTabId={studioMeta.defaultTabId} />
        </section>
      </main>
      <BackToTopButton />
    </div>
  );
};
