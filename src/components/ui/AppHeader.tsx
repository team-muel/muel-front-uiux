import React, { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { UI_PRESETS } from '../../config/uiPresets';

interface AppHeaderProps {
  title: string;
  actions?: ReactNode;
  fixed?: boolean;
  animated?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  actions,
  fixed = false,
  animated = true,
}) => {
  const headerClass = fixed
    ? `fixed left-0 right-0 top-0 z-30 ${UI_PRESETS.borderBottom} bg-zinc-900/50 backdrop-blur`
    : `${UI_PRESETS.borderBottom} bg-zinc-900/35 backdrop-blur`;

  return (
    <motion.header
      initial={animated ? { opacity: 0, y: -12 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={animated ? { duration: 0.45, ease: 'easeOut' } : undefined}
      className={headerClass}
    >
      <div className="section-wrap flex h-16 items-center justify-between gap-4">
        <div className={`mono-data text-xs tracking-[0.24em] ${UI_PRESETS.inkText}`}>{title}</div>
        {actions}
      </div>
    </motion.header>
  );
};
