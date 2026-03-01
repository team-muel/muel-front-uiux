import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { AppWindow, Bot } from 'lucide-react';
import { TopSectionSwitcher } from '../components/TopSectionSwitcher';
import { BackToTopButton } from '../components/BackToTopButton';
import { commonText } from '../content/commonText';
import { embedModules, embeddedPageContent, sdkBlocks } from '../content/embeddedContent';
import { APP_ICONS } from '../config/iconRegistry';
import { createStaggerPreset } from '../config/motionPresets';
import { SECTION_MOTION_TOKENS } from '../config/experienceTokens';
import { UI_PRESETS } from '../config/uiPresets';
import { AppHeader } from '../components/ui/AppHeader';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { PanelHeader } from '../components/ui/PanelHeader';

const embeddedStagger = createStaggerPreset({
  staggerChildren: SECTION_MOTION_TOKENS.sectionGrid.staggerChildren,
  delayChildren: SECTION_MOTION_TOKENS.sectionGrid.delayChildren,
  itemDuration: SECTION_MOTION_TOKENS.embedded.itemDuration,
});
const staggerContainer = embeddedStagger.container;
const staggerItem = embeddedStagger.item;

export const EmbeddedApp = () => {
  return (
    <div className="surface-page surface-bridge hud-grid min-h-screen">
      <a href="#embedded-main" className="skip-link">{commonText.helper.skipToContent}</a>
      <AppHeader title={embeddedPageContent.headerTitle} actions={<TopSectionSwitcher />} animated={false} />

      <main id="embedded-main" className={`section-wrap section-v-80 section-cluster ${UI_PRESETS.borderX}`}>
        <section className={`io-reveal ${UI_PRESETS.borderBottom} pb-8`}>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: SECTION_MOTION_TOKENS.revealLine.duration, ease: SECTION_MOTION_TOKENS.revealLine.ease }}
            className={`mb-6 h-px origin-left ${UI_PRESETS.accentLineStrong}`}
          />
          <div className={`inline-flex items-center gap-2 ${UI_PRESETS.borderBase} bg-zinc-950/70 px-3 py-1.5 text-xs text-current`}>
            <AppWindow className={`h-3.5 w-3.5 ${UI_PRESETS.accentText}`} />
            <span className="mono-data tracking-[0.16em]">{embeddedPageContent.intro.badge}</span>
          </div>
          <h1 className="type-h1 mt-4 max-w-4xl">
            {embeddedPageContent.intro.titleLines[0]}
            <br className="hidden md:block" />
            {embeddedPageContent.intro.titleLines[1]}
          </h1>
          <p className="type-body mt-6 max-w-3xl text-current">
            {embeddedPageContent.intro.description}
          </p>
        </section>

        <section className="io-reveal">
          <PanelHeader title={embeddedPageContent.sections.sdkGrid.title} label={embeddedPageContent.sections.sdkGrid.label} />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: SECTION_MOTION_TOKENS.sectionGrid.once, amount: SECTION_MOTION_TOKENS.sectionGrid.viewportAmount }}
            className={`grid grid-cols-1 ${UI_PRESETS.gridFrame} md:grid-cols-3`}
          >
            {sdkBlocks.map((block) => {
              const Icon = APP_ICONS[block.iconKey];
              return (
                <SurfaceCard
                  as={motion.article}
                  key={block.title}
                  variants={staggerItem}
                  hoverable
                  className={`${UI_PRESETS.gridCell} bg-zinc-900/35 p-6`}
                >
                  <Icon className={`h-5 w-5 ${UI_PRESETS.accentText}`} />
                  <div className="mono-data mt-4 text-xs tracking-[0.15em] text-current">{block.title}</div>
                  <div className={`mono-data mt-2 text-2xl ${UI_PRESETS.accentText}`}>{block.value}</div>
                  <p className="mt-3 text-sm leading-relaxed text-current">{block.description}</p>
                </SurfaceCard>
              );
            })}
          </motion.div>
        </section>

        <section className="io-reveal">
          <PanelHeader title={embeddedPageContent.sections.modules.title} label={embeddedPageContent.sections.modules.label} />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: SECTION_MOTION_TOKENS.sectionGrid.once, amount: SECTION_MOTION_TOKENS.sectionGrid.viewportAmount }}
            className={`grid grid-cols-1 ${UI_PRESETS.gridFrame} md:grid-cols-3`}
          >
            {embedModules.map((module) => {
              const Icon = APP_ICONS[module.iconKey];
              return (
                <SurfaceCard
                  as={motion.article}
                  key={module.title}
                  variants={staggerItem}
                  hoverable
                  className={`${UI_PRESETS.gridCell} bg-zinc-900/35 p-6`}
                >
                  <Icon className={`h-5 w-5 ${UI_PRESETS.accentText}`} />
                  <h3 className="mt-4 text-lg font-medium">{module.title}</h3>
                  <p className="mt-2 text-sm text-current">{module.subtitle}</p>
                </SurfaceCard>
              );
            })}
          </motion.div>
        </section>

        <SurfaceCard as="section" hoverable className={`io-reveal rounded-xl ${UI_PRESETS.borderBase} bg-zinc-900/35 p-6`}>
          <PanelHeader title={embeddedPageContent.sections.policy.title} leading={<Bot className={`h-5 w-5 ${UI_PRESETS.accentText}`} />} className="!mb-4" />
          <ul className="space-y-2 text-sm text-current">
            <li className={`${UI_PRESETS.borderLeft} pl-3`}>
              <span className={`mono-data ${UI_PRESETS.accentText}`}>{embeddedPageContent.sections.policy.embeddedPath}</span> : {embeddedPageContent.sections.policy.embeddedDescription}
            </li>
            <li className={`${UI_PRESETS.borderLeft} pl-3`}>
              <span className={`mono-data ${UI_PRESETS.accentText}`}>{embeddedPageContent.sections.policy.dashboardPath}</span> : {embeddedPageContent.sections.policy.dashboardDescription}
            </li>
          </ul>
        </SurfaceCard>
      </main>
      <BackToTopButton />
    </div>
  );
};



