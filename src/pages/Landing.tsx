import React from 'react';
import { motion } from 'motion/react';
import { Bot, ChevronDown, Sparkles } from 'lucide-react';
import { TopSectionSwitcher } from '../components/TopSectionSwitcher';
import { ScrollProgressBar } from '../components/ScrollProgressBar';
import { ROUTES } from '../config/routes';
import { UI_PRESETS } from '../config/uiPresets';
import { SECTION_MOTION_TOKENS } from '../config/experienceTokens';
import { homeContent } from '../content/homeContent';
import { commonText } from '../content/commonText';
import { AppHeader } from '../components/ui/AppHeader';
import { UiButton } from '../components/ui/UiButton';
import { useScrollProgress } from '../hooks/useScrollProgress';

export const Landing: React.FC = () => {
  const scrollProgress = useScrollProgress();

  return (
    <div className="surface-page surface-bridge hud-grid min-h-screen pt-16">
      <a href="#hero" className="skip-link">{commonText.helper.skipToContent}</a>
      <ScrollProgressBar progress={scrollProgress} />

      <AppHeader title={commonText.brand.main} actions={<TopSectionSwitcher />} fixed />

      <section id="hero" className={`${UI_PRESETS.heroSection} scroll-mt-24`}>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: SECTION_MOTION_TOKENS.revealLine.viewportAmount }}
          transition={{ duration: SECTION_MOTION_TOKENS.revealLine.duration, ease: SECTION_MOTION_TOKENS.revealLine.ease }}
          className={`absolute left-0 right-0 top-0 h-px origin-left ${UI_PRESETS.accentLineStrong}`}
        />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: SECTION_MOTION_TOKENS.hero.bodyDuration, ease: SECTION_MOTION_TOKENS.revealLine.ease }}
          className="section-wrap section-v-120"
        >
          <div className={`mono-data mb-7 inline-flex items-center gap-2 ${UI_PRESETS.borderBase} bg-zinc-950/70 px-3 py-1.5 text-xs tracking-[0.22em] ${UI_PRESETS.inkText}`}>
            <Sparkles className="h-3.5 w-3.5" />
            {homeContent.landing.hero.badge}
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: SECTION_MOTION_TOKENS.hero.headingDuration, delay: SECTION_MOTION_TOKENS.hero.headingDelay, ease: SECTION_MOTION_TOKENS.revealLine.ease }}
            className="type-h1 max-w-4xl"
          >
            {homeContent.landing.hero.titleLines.map((line, index) => (
              <React.Fragment key={line}>
                {line}
                {index < homeContent.landing.hero.titleLines.length - 1 && <br className="hidden md:block" />}
              </React.Fragment>
            ))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: SECTION_MOTION_TOKENS.hero.bodyDuration, delay: SECTION_MOTION_TOKENS.hero.bodyDelay, ease: SECTION_MOTION_TOKENS.revealLine.ease }}
            className="type-body mt-8 max-w-2xl text-current"
          >
            {homeContent.landing.hero.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: SECTION_MOTION_TOKENS.hero.ctaDuration, delay: SECTION_MOTION_TOKENS.hero.ctaDelay, ease: SECTION_MOTION_TOKENS.revealLine.ease }}
            className="mt-12 flex flex-wrap items-center gap-3"
          >
            <UiButton to={ROUTES.support} variant="outline" size="lg">
              {homeContent.landing.heroActions.embedded}
              <ChevronDown className="h-4 w-4" />
            </UiButton>
            <UiButton to={ROUTES.dashboard} variant="solid" size="lg">
              {homeContent.landing.heroActions.dashboard}
              <Bot className="h-4 w-4" />
            </UiButton>
            <UiButton to={ROUTES.inApp} variant="outline" size="lg">
              {homeContent.landing.heroActions.viewStructure}
              <ChevronDown className="h-4 w-4" />
            </UiButton>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};



