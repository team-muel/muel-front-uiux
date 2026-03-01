import React from 'react';
import { UI_PRESETS } from '../../config/uiPresets';

interface PanelHeaderProps {
  title: string;
  label?: string;
  leading?: React.ReactNode;
  className?: string;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  label,
  leading,
  className = '',
}) => {
  return (
    <div className={`mb-5 flex items-center justify-between ${UI_PRESETS.borderBottom} pb-4 ${className}`.trim()}>
      <div className="flex items-center gap-2">
        {leading}
        <h2 className="type-h2">{title}</h2>
      </div>
      {label ? <span className="mono-data text-xs tracking-[0.18em] text-current">{label}</span> : null}
    </div>
  );
};
