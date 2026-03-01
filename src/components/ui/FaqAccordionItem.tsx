import React from 'react';
import { ChevronDown } from 'lucide-react';
import { UI_PRESETS } from '../../config/uiPresets';
import { SurfaceCard } from './SurfaceCard';

interface FaqAccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  index: number;
  onToggle: () => void;
}

export const FaqAccordionItem: React.FC<FaqAccordionItemProps> = ({
  question,
  answer,
  isOpen,
  index,
  onToggle,
}) => {
  const faqAnswerId = `faq-answer-${index}`;
  const faqButtonId = `faq-button-${index}`;

  return (
    <SurfaceCard className={`${UI_PRESETS.borderBase} bg-zinc-900/35`}>
      <button
        id={faqButtonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={faqAnswerId}
        className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm transition ${isOpen ? 'text-current' : 'text-current hover:text-current'}`}
      >
        <span className="font-medium">{question}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${isOpen ? `rotate-180 ${UI_PRESETS.accentText}` : 'text-current'}`} />
      </button>
      {isOpen && (
        <div id={faqAnswerId} role="region" aria-labelledby={faqButtonId} className={`${UI_PRESETS.borderTop} px-5 py-4 text-sm leading-relaxed text-current`}>
          {answer}
        </div>
      )}
    </SurfaceCard>
  );
};
