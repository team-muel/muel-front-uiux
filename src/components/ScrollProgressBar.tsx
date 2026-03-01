import React from 'react';
import { UI_PRESETS } from '../config/uiPresets';

interface ScrollProgressBarProps {
  progress: number;
}

export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({ progress }) => {
  return (
    <div className="fixed left-0 right-0 top-0 z-40 h-[2px] bg-zinc-900/70">
      <div className={`h-full ${UI_PRESETS.accentLineStrong} transition-[width] duration-200 ease-out`} style={{ width: `${progress}%` }} />
    </div>
  );
};
