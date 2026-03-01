import React from 'react';
import { ArrowUp } from 'lucide-react';
import { commonText } from '../content/commonText';
import { UiButton } from './ui/UiButton';

export const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 480);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <UiButton
      variant="ghost"
      size="sm"
      ariaLabel={commonText.helper.backToTopAria}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-5 right-5 z-40 bg-zinc-950/90 !text-xs !font-medium text-current backdrop-blur"
    >
      <ArrowUp className="h-4 w-4" />
      {commonText.helper.backToTop}
    </UiButton>
  );
};
