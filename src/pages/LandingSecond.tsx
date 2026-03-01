import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { GlitchLineQuantCard, PremiumInsightPaywallCard, RadarQuantCard } from '../components/QuantVisuals';
import { GridSection, SectionHeader } from '../components/sections/GridSection';
import { PageFlowNavigator } from '../components/PageFlowNavigator';
import { TopSectionSwitcher } from '../components/TopSectionSwitcher';
import { BackToTopButton } from '../components/BackToTopButton';
import { ScrollProgressBar } from '../components/ScrollProgressBar';
import { SectionFlowRail } from '../components/SectionFlowRail';
import { DirectEntryCta } from '../components/DirectEntryCta';
import { getPrimaryFlowPosition } from '../config/informationArchitecture';
import { ROUTES } from '../config/routes';
import { UI_PRESETS } from '../config/uiPresets';
import { homeContent } from '../content/homeContent';
import { faqs, flowLabels, flowValues, landingSecondSectionFlow, lockedInsightRows, macroRadar, updates } from '../content/landingSecondContent';
import { commonText } from '../content/commonText';
import { BOT_INVITE_URL } from '../config/sectionNavigation';
import { AppHeader } from '../components/ui/AppHeader';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { UiButton } from '../components/ui/UiButton';
import { FaqAccordionItem } from '../components/ui/FaqAccordionItem';
import { useActiveSection } from '../hooks/useActiveSection';
import { useScrollProgress } from '../hooks/useScrollProgress';

export const LandingSecond: React.FC = () => {
  const activeSection = useActiveSection(landingSecondSectionFlow.map((section) => section.id));
  const scrollProgress = useScrollProgress();
  const flow = getPrimaryFlowPosition(ROUTES.embedded);
  const [openFaq, setOpenFaq] = React.useState<number>(0);

  const repeatCta = <DirectEntryCta />;

  return (
    <div className="surface-page surface-bridge hud-grid min-h-screen pt-16">
      <a href="#updates" className="skip-link">{commonText.helper.skipToContent}</a>
      <ScrollProgressBar progress={scrollProgress} />
      <SectionFlowRail items={landingSecondSectionFlow} activeSection={activeSection} activeTextClassName={UI_PRESETS.inkText} />

      <AppHeader title={commonText.brand.part2} actions={<TopSectionSwitcher />} fixed />

      <section className={UI_PRESETS.heroSection}>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`absolute left-0 right-0 top-0 h-px origin-left ${UI_PRESETS.accentLineStrong}`}
        />
        <div className="section-wrap section-v-80">
          <div className={`mono-data inline-flex items-center gap-2 ${UI_PRESETS.borderBase} bg-zinc-950/70 px-3 py-1.5 text-xs tracking-[0.22em] ${UI_PRESETS.inkText}`}>
            <Sparkles className="h-3.5 w-3.5" />
            {homeContent.landingSecond.intro.badge}
          </div>
          <h1 className="type-h2 mt-5">{homeContent.landingSecond.intro.title}</h1>
          <p className="type-body mt-4 max-w-2xl text-current">{homeContent.landingSecond.intro.description}</p>
        </div>
      </section>

      <GridSection
        id="updates"
        title={homeContent.landingSecond.sections.updates.title}
        label={homeContent.landingSecond.sections.updates.label}
        items={updates}
        getKey={(item) => item.title}
        gridClassName={`grid grid-cols-1 ${UI_PRESETS.gridFrame} lg:grid-cols-3`}
        renderItem={(item) => (
          <SurfaceCard className={`${UI_PRESETS.gridCell} bg-zinc-900/35 p-6`}>
            <div className="mono-data text-xs tracking-[0.16em] text-current">{item.date}</div>
            <h3 className="mt-4 text-xl font-medium text-current">{item.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-current">{item.description}</p>
          </SurfaceCard>
        )}
        accentLineClass={UI_PRESETS.accentLine}
        footer={repeatCta}
      />

      <GridSection
        id="quant"
        title={homeContent.landingSecond.sections.quant.title}
        label={homeContent.landingSecond.sections.quant.label}
        items={[
          {
            key: 'radar',
            render: () => <RadarQuantCard title="Macro Balance Radar" subtitle="RISK TOPOLOGY" metrics={macroRadar} />,
          },
          {
            key: 'glitch',
            render: () => <GlitchLineQuantCard title="Signal Deviation Line" subtitle="GLITCH TREND FEED" labels={flowLabels} values={flowValues} />,
          },
        ]}
        getKey={(item) => item.key}
        gridClassName="grid grid-cols-1 gap-card-lg xl:grid-cols-2"
        renderItem={(item) => item.render()}
        extraContent={(
          <div className="mt-4 grid grid-cols-1">
            <PremiumInsightPaywallCard title="Premium Forecast Deck" subtitle="LOCKED CORE INSIGHT" lockedRows={lockedInsightRows} />
          </div>
        )}
        accentLineClass={UI_PRESETS.accentLine}
        footer={repeatCta}
      />

      <section id="faq" className={`${UI_PRESETS.flowSection} scroll-mt-24`}>
        <SectionHeader title={homeContent.landingSecond.sections.faq.title} label={homeContent.landingSecond.sections.faq.label} accentLineClass={UI_PRESETS.accentLine} />
        <div className="space-y-3">
          {faqs.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <FaqAccordionItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={isOpen}
                index={index}
                onToggle={() => setOpenFaq((prev) => (prev === index ? -1 : index))}
              />
            );
          })}
        </div>

        {repeatCta}
      </section>

      <SurfaceCard
        as={motion.section}
        id="join"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`${UI_PRESETS.flowSection} scroll-mt-24 flex flex-col items-start gap-7 border-t md:flex-row md:items-end md:justify-between`}
      >
        <div>
          <div className={`mono-data text-xs tracking-[0.2em] ${UI_PRESETS.inkText}`}>{homeContent.landingSecond.join.badge}</div>
          <h2 className="type-h2 mt-4">{homeContent.landingSecond.join.title}</h2>
        </div>
        <div className="flex flex-wrap gap-card">
          <UiButton to={ROUTES.home} variant="outline" size="lg">
            {homeContent.landingSecond.join.embeddedLabel}
          </UiButton>
          <UiButton to={ROUTES.dashboard} variant="accent" size="lg">
            {commonText.action.viewDashboard}
          </UiButton>
          <UiButton
            href={BOT_INVITE_URL}
            variant="outline"
            size="lg"
          >
            {commonText.action.inviteBotToServer}
          </UiButton>
        </div>
      </SurfaceCard>

      <footer className={`${UI_PRESETS.flowSection} bg-zinc-950/60`}>
        <div className={`flex flex-col gap-6 ${UI_PRESETS.borderTop} pt-8 md:flex-row md:items-end md:justify-between`}>
          <div>
            <div className={`mono-data text-xs tracking-[0.2em] ${UI_PRESETS.inkText}`}>{homeContent.landingSecond.footer.badge}</div>
            <p className="type-body mt-3 max-w-2xl text-current">{commonText.brand.footerDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <UiButton to={ROUTES.home} variant="outline">{homeContent.landingSecond.footer.links.part1}</UiButton>
            <UiButton to={ROUTES.home} variant="outline">{homeContent.landingSecond.footer.links.embedded}</UiButton>
            <UiButton to={ROUTES.dashboard} variant="accent">{homeContent.landingSecond.footer.links.dashboard}</UiButton>
          </div>
        </div>
      </footer>

      <div id="flow-nav">
        {flow && (
          <PageFlowNavigator
            current={flow.current}
            total={flow.total}
            title={homeContent.landingSecond.flow.title}
            description={homeContent.landingSecond.flow.description}
            prevTo={flow.prevTo}
            nextTo={flow.nextTo}
            prevLabel={homeContent.landingSecond.flow.prevLabel}
          />
        )}
      </div>
      <BackToTopButton />
    </div>
  );
};
