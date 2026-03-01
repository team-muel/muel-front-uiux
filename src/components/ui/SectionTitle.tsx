import React from 'react';
import { motion } from 'motion/react';
import { UI_PRESETS } from '../../config/uiPresets';

interface SectionTitleProps {
  title: string;
  label: string;
  accentLineClass?: string;
  wrapperClassName?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  label,
  accentLineClass = UI_PRESETS.accentLine,
  wrapperClassName = `mb-8 flex items-end justify-between ${UI_PRESETS.borderBottom} pb-6`,
}) => {
  return (
    <>
      <div className={wrapperClassName}>
        <h2 className="type-h2">{title}</h2>
        <span className="mono-data text-xs tracking-[0.18em] text-current">{label}</span>
      </div>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`mb-3 h-px origin-left ${accentLineClass}`}
      />
    </>
  );
};
