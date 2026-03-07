import React from 'react';
import { Link } from 'react-router-dom';
import { researchContent, type ResolvedResearchPreset } from '../../content/researchContent';
import { useQuantPanelSnapshot } from '../../hooks/useQuantPanelSnapshot';
import { ROUTES } from '../../config/routes';
import { BOT_INVITE_URL } from '../../config/sectionNavigation';
import { PremiumResearchCard, RadarResearchCard, TrendResearchCard } from '../ResearchVisuals';
import { MuelReveal } from '../ui/MuelReveal';
import { SurfaceCard } from '../ui/SurfaceCard';
import { UiButton } from '../ui/UiButton';

interface ResearchPresetHeroProps {
  preset: ResolvedResearchPreset;
}

export const ResearchPresetHero = ({ preset }: ResearchPresetHeroProps) => {
  const hero = preset.hero;
  const connectors = preset.data.connectors;

  if (hero.layout === 'embedded') {
    return (
      <section className="io-reveal research-hero-shell research-hero-divider">
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
  const quantState = useQuantPanelSnapshot();
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

      <div className="kpay-divider" aria-hidden="true" />

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
        <section className="quant-panel-shell" aria-label="quant panel placeholder">
          <header className="muel-section-head">
            <p className="chapter-overline">{researchContent.quantPreview.overline}</p>
            <h3 className="chapter-title">{researchContent.quantPreview.title}</h3>
            <p className="chapter-desc">{researchContent.quantPreview.description}</p>
          </header>

          <div className="research-binding-strip" aria-label="quant source status">
            <span className={`control-room-status ${quantState.source === 'backend' ? 'status-completed' : 'status-in-progress'}`}>
              Quant Source: {quantState.source === 'backend' ? 'Backend' : 'Fallback'}
            </span>
            {quantState.error ? <p className="research-binding-note">{quantState.error}</p> : null}
          </div>

          <div className="feature-reboot-grid research-triple-grid">
            {quantState.snapshot.metrics.map((metric) => (
              <SurfaceCard key={metric.id} hoverable className="feature-reboot-card research-feature-card muel-interact">
                <p className="feature-reboot-kicker">{metric.id.toUpperCase()}</p>
                <h4 className="feature-reboot-title">{metric.label}</h4>
                <p className="feature-reboot-desc">
                  {metric.value.toFixed(2)} {metric.unit} · change {metric.change >= 0 ? '+' : ''}
                  {metric.change.toFixed(2)}
                </p>
              </SurfaceCard>
            ))}
          </div>

          {!quantState.snapshot.metrics.length ? (
            <p className="research-binding-note">{researchContent.quantPreview.noDataMessage}</p>
          ) : null}
        </section>

        <div className="kpay-divider" aria-hidden="true" />

        <section className="quant-panel-shell" aria-label="contact support section">
          <header className="muel-section-head">
            <p className="chapter-overline">{researchContent.contact.overline}</p>
            <h3 className="chapter-title">{researchContent.contact.title}</h3>
            <p className="chapter-desc">{researchContent.contact.description}</p>
          </header>

          <div className="feature-reboot-grid research-triple-grid">
            {researchContent.contact.channels.map((channel) => (
              <SurfaceCard key={channel.id} hoverable className="feature-reboot-card research-feature-card muel-interact">
                <p className="feature-reboot-kicker">CHANNEL</p>
                <h4 className="feature-reboot-title">{channel.label}</h4>
                <p className="feature-reboot-desc">{channel.detail}</p>
              </SurfaceCard>
            ))}
          </div>

          <div className="research-contact-notes">
            <p className="research-binding-note">{researchContent.contact.responsePolicy}</p>
            <p className="research-binding-note">{researchContent.contact.escalationNote}</p>
          </div>

          <div className="hero-cta-stack">
            <UiButton to={ROUTES.support} variant="solid" size="lg">{researchContent.contact.supportCta}</UiButton>
            <UiButton href={BOT_INVITE_URL} variant="outline" size="md">{researchContent.contact.discordCta}</UiButton>
          </div>
        </section>
      </MuelReveal>
    </>
  );
};