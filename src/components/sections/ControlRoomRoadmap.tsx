import React from 'react';
import { Link } from 'react-router-dom';
import { controlRoomMainFlow, controlRoomPlan, type PlanStatus } from '../../content/controlRoomPlan';
import { SurfaceCard } from '../ui/SurfaceCard';

interface ControlRoomRoadmapProps {
  compact?: boolean;
}

const statusLabelMap: Record<PlanStatus, string> = {
  completed: '완료',
  'in-progress': '진행 중',
  pending: '대기',
};

export const ControlRoomRoadmap: React.FC<ControlRoomRoadmapProps> = ({ compact = false }) => {
  return (
    <section className={`control-room-roadmap ${compact ? 'is-compact' : ''}`}>
      <header className="muel-section-head">
        <p className="chapter-overline">CONTROL ROOM PLAN</p>
        <h2 className="chapter-title">기획 기반 운영 로드맵</h2>
        <p className="chapter-desc">화면 구조와 기능 우선순위를 Track/Phase 단위로 동기화합니다.</p>
      </header>

      <div className="control-room-flow" aria-label="main operation flow">
        {controlRoomMainFlow.map((step, index) => (
          <React.Fragment key={step.id}>
            {step.to ? (
              <Link to={step.to} className="control-room-flow-chip muel-interact" aria-label={`${step.label} 이동`}>
                <span className="control-room-flow-label">{step.label}</span>
                <span className="control-room-flow-desc">{step.description}</span>
              </Link>
            ) : (
              <div className="control-room-flow-chip">
                <span className="control-room-flow-label">{step.label}</span>
                <span className="control-room-flow-desc">{step.description}</span>
              </div>
            )}
            {index < controlRoomMainFlow.length - 1 ? <span className="control-room-flow-arrow">→</span> : null}
          </React.Fragment>
        ))}
      </div>

      <div className="control-room-track-grid">
        {controlRoomPlan.map((track) => (
          <SurfaceCard key={track.id} hoverable className="feature-reboot-card control-room-track-card muel-interact">
            <p className="feature-reboot-kicker">{track.title}</p>
            <h3 className="feature-reboot-title">{track.subtitle}</h3>
            <p className="feature-reboot-desc">{track.goal}</p>

            <div className="control-room-phase-list" role="list" aria-label={`${track.title} phases`}>
              {track.phases.map((phase) => (
                <div key={phase.id} role="listitem" className="control-room-phase-item">
                  <div className="control-room-phase-head">
                    <p className="control-room-phase-title">{phase.title}</p>
                    <span className={`control-room-status status-${phase.status}`}>{statusLabelMap[phase.status]}</span>
                  </div>
                  {!compact ? <p className="control-room-phase-desc">{phase.description}</p> : null}
                </div>
              ))}
            </div>
          </SurfaceCard>
        ))}
      </div>
    </section>
  );
};
