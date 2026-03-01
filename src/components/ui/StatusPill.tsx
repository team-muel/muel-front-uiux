import React from 'react';
import { UI_PRESETS } from '../../config/uiPresets';

type StatusTone = 'success' | 'neutral' | 'error' | 'auto';

interface StatusPillProps {
  text: string;
  tone?: StatusTone;
  className?: string;
}

const toneClasses: Record<Exclude<StatusTone, 'auto'>, string> = {
  success: `${UI_PRESETS.accentBorderLight} ${UI_PRESETS.accentBgSoft10} ${UI_PRESETS.accentText}`,
  neutral: 'border-zinc-700 bg-zinc-950/70 text-current',
  error: 'border-zinc-700 bg-zinc-950/70 text-current',
};

const inferTone = (text: string): Exclude<StatusTone, 'auto'> => {
  const lower = text.toLowerCase();
  if (lower.includes('?깃났') || lower.includes('success')) return 'success';
  if (lower.includes('?ㅻ쪟') || lower.includes('?ㅽ뙣') || lower.includes('error')) return 'error';
  return 'neutral';
};

export const StatusPill: React.FC<StatusPillProps> = ({ text, tone = 'auto', className = '' }) => {
  const resolvedTone = tone === 'auto' ? inferTone(text) : tone;
  return <p className={`rounded-full border px-3 py-2 text-sm ${toneClasses[resolvedTone]} ${className}`.trim()}>{text}</p>;
};
