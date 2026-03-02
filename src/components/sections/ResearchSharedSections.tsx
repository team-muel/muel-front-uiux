import React from 'react';
import { Link } from 'react-router-dom';
import { researchContent, type ResolvedResearchPreset } from '../../content/researchContent';
import { PremiumResearchCard, RadarResearchCard, TrendResearchCard } from '../ResearchVisuals';
import { MuelReveal } from '../ui/MuelReveal';
import { SurfaceCard } from '../ui/SurfaceCard';
import { UiButton } from '../ui/UiButton';

interface ResearchStepNavProps {
  preset: ResolvedResearchPreset;
  className?: string;
}

export const ResearchStepNav = ({
  preset,
  className = '',
}: ResearchStepNavProps) => {
  const researchSteps = Object.values(researchContent.sections);
  const { ariaLabel, showLabels, showSeparators } = preset.stepNav;

  return (
    <nav className={`research-step-line ${className}`.trim()} aria-label={ariaLabel}>
      {researchSteps.map((section, index) => (
        <span key={section.overline} className="research-step-item mono-data" aria-label={section.title}>
          <span className="research-step-number">{index + 1}</span>
          {showLabels ? <span className="studio-step-label">{section.title}</span> : null}
          {showSeparators && index < researchSteps.length - 1 ? (
            <span className="research-step-separator" aria-hidden="true">
              -
            </span>
          ) : null}
        </span>
      ))}
    </nav>
  );
};

interface ResearchPresetHeroProps {
  preset: ResolvedResearchPreset;
}

export const ResearchPresetHero = ({ preset }: ResearchPresetHeroProps) => {
  const hero = preset.hero;
  const connectors = preset.data.connectors;

  if (hero.layout === 'embedded') {
    return (
      <section className="io-reveal research-hero-shell research-hero-divider">
        <ResearchStepNav preset={preset} />
        <p className="chapter-overline">{hero.overline}</p>
        <h1 className="type-h1 research-hero-title">{hero.title}</h1>
        <p className="type-body research-hero-desc">{hero.description}</p>
      </section>
    );
  }

  const studioHero = hero.studio;
  if (!studioHero) {
    return null;
  }

  return (
    <section className="io-reveal research-hero-shell research-hero-divider studio-hero-shell">
      <div className="studio-hero-grid">
        <div>
          <ResearchStepNav preset={preset} className="studio-step-line" />

          <p className="chapter-overline">{hero.overline}</p>
          <h1 className="type-h1 research-hero-title">{hero.title}</h1>
          <p className="type-body research-hero-desc">{hero.description}</p>

          <div className="hero-cta-stack studio-hero-cta">
            {studioHero.ctas.map((cta) => (
              <UiButton key={cta.label} to={cta.to} variant={cta.variant} size={cta.size} className={cta.className}>
                {cta.label}
              </UiButton>
            ))}
          </div>
        </div>

        <SurfaceCard hoverable className="hero-reboot-panel studio-kpi-panel muel-interact">
          <p className="hero-reboot-panel-kicker">{studioHero.kpi.kicker}</p>

          <div className="studio-kpi-list" role="list" aria-label={studioHero.kpi.listAriaLabel}>
            {connectors.map((connector) => (
              <div key={connector.id} role="listitem" className="studio-kpi-item">
                <span className="studio-kpi-item-title">{connector.title}</span>
                <span className="mono-data studio-kpi-pill">{connector.status}</span>
              </div>
            ))}
          </div>

          <div className="studio-kpi-footnote">
            <span className="mono-data">{studioHero.kpi.footnoteLabel}</span>
            <Link to={studioHero.kpi.footnoteLinkTo} className="hero-secondary-link muel-interact">
              {studioHero.kpi.footnoteLinkLabel}
            </Link>
          </div>
        </SurfaceCard>
      </div>
    </section>
  );
};

interface ResearchCoreSectionsProps {
  preset: ResolvedResearchPreset;
}

export const ResearchCoreSections = ({ preset }: ResearchCoreSectionsProps) => {
  const connectors = preset.data.connectors;
  const workbench = preset.data.workbench;
  const radarMetrics = preset.data.radar.metrics;
  const trendLabels = preset.data.trend.labels;
  const trendValues = preset.data.trend.values;
  const premiumRows = preset.data.premium.rows;
  const radar = preset.charts.radar;
  const trend = preset.charts.trend;
  const premium = preset.charts.premium;

  return (
    <>
      <MuelReveal as="section" className="io-reveal section-emphasis-shell" delayMultiplier={0}>
        <header className="muel-section-head">
          <p className="chapter-overline">{researchContent.sections.connectors.overline}</p>
          <h2 className="chapter-title">{researchContent.sections.connectors.title}</h2>
          <p className="chapter-desc">{researchContent.sections.connectors.description}</p>
        </header>

        <div className="feature-reboot-grid research-triple-grid">
          {connectors.map((connector) => (
            <SurfaceCard key={connector.id} hoverable className="feature-reboot-card research-feature-card muel-interact">
              <p className="feature-reboot-kicker">{connector.status}</p>
              <h3 className="feature-reboot-title">{connector.title}</h3>
              <p className="feature-reboot-desc">{connector.description}</p>
            </SurfaceCard>
          ))}
        </div>
      </MuelReveal>

      <div className="kpay-divider" aria-hidden="true" />

      <MuelReveal as="section" className="io-reveal section-emphasis-shell" delayMultiplier={0}>
        <header className="muel-section-head">
          <p className="chapter-overline">{researchContent.sections.workbench.overline}</p>
          <h2 className="chapter-title">{researchContent.sections.workbench.title}</h2>
          <p className="chapter-desc">{researchContent.sections.workbench.description}</p>
        </header>

        <div className="feature-reboot-grid research-triple-grid">
          <SurfaceCard hoverable className="feature-reboot-card research-feature-card muel-interact">
            <p className="feature-reboot-kicker">{preset.core.feedsLabel}</p>
            <ul className="research-bullet-list">
              {workbench.feeds.map((feed) => (
                <li key={feed}>{feed}</li>
              ))}
            </ul>
          </SurfaceCard>

          <SurfaceCard hoverable className="feature-reboot-card research-feature-card muel-interact">
            <p className="feature-reboot-kicker">{preset.core.viewsLabel}</p>
            <ul className="research-bullet-list">
              {workbench.views.map((view) => (
                <li key={view}>{view}</li>
              ))}
            </ul>
          </SurfaceCard>

          <SurfaceCard hoverable className="feature-reboot-card research-feature-card muel-interact">
            <p className="feature-reboot-kicker">{preset.core.libraryLabel}</p>
            <ul className="research-bullet-list">
              {workbench.library.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </SurfaceCard>
        </div>
      </MuelReveal>

      <div className="kpay-divider" aria-hidden="true" />

      <MuelReveal as="section" className="io-reveal section-emphasis-shell" delayMultiplier={0}>
        <header className="muel-section-head">
          <p className="chapter-overline">{researchContent.sections.charts.overline}</p>
          <h2 className="chapter-title">{researchContent.sections.charts.title}</h2>
          <p className="chapter-desc">{researchContent.sections.charts.description}</p>
        </header>

        <div className="research-charts-grid">
          <RadarResearchCard
            title={radar.title}
            subtitle={radar.subtitle}
            metrics={radarMetrics}
          />
          <TrendResearchCard
            title={trend.title}
            subtitle={trend.subtitle}
            labels={trendLabels}
            values={trendValues}
          />
        </div>

        <div className="research-premium-wrap">
          <PremiumResearchCard
            title={premium.title}
            subtitle={premium.subtitle}
            lockLabel={premium.lockLabel}
            rows={premiumRows}
          />
        </div>
      </MuelReveal>
    </>
  );
};