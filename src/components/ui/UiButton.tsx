import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { UI_PRESETS } from '../../config/uiPresets';

type Variant = 'outline' | 'accent' | 'solid' | 'ghost' | 'tab';
type Size = 'sm' | 'md' | 'lg';

interface UiButtonProps {
  children: ReactNode;
  to?: string;
  href?: string;
  variant?: Variant;
  size?: Size;
  active?: boolean;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  title?: string;
  target?: string;
  rel?: string;
  benchmarkEvent?: string;
  benchmarkId?: string;
  benchmarkLabel?: string;
  benchmarkArea?: string;
}

const baseClasses = 'cta-subtle inline-flex items-center gap-2 rounded-full transition';

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-sm font-medium',
};

const getVariantClasses = (variant: Variant, active: boolean) => {
  switch (variant) {
    case 'accent':
      return `${UI_PRESETS.accentBorderSoft} ${UI_PRESETS.accentText} ${UI_PRESETS.accentBgHoverSoft12} ${UI_PRESETS.accentBorderHoverSoft}`;
    case 'solid':
      return `${UI_PRESETS.accentBg} text-current hover:brightness-95`;
    case 'ghost':
      return `${UI_PRESETS.borderMuted} text-current ${UI_PRESETS.accentBorderHover} ${UI_PRESETS.accentTextHover}`;
    case 'tab':
      return active
        ? `${UI_PRESETS.accentBg} text-current border ${UI_PRESETS.accentBorder}`
        : `${UI_PRESETS.borderMuted} text-current ${UI_PRESETS.accentBorderHover} ${UI_PRESETS.accentTextHover}`;
    case 'outline':
    default:
      return `${UI_PRESETS.borderMuted} text-current ${UI_PRESETS.accentBorderHover} ${UI_PRESETS.accentTextHover}`;
  }
};

export const UiButton: React.FC<UiButtonProps> = ({
  children,
  to,
  href,
  variant = 'outline' as Variant,
  size = 'md' as Size,
  active = false,
  className = '',
  ariaLabel,
  disabled = false,
  type = 'button',
  onClick,
  title,
  target,
  rel,
  benchmarkEvent,
  benchmarkId,
  benchmarkLabel,
  benchmarkArea,
}) => {
  const disabledClasses = disabled ? 'cursor-not-allowed opacity-50 pointer-events-none' : '';
  const classes = `${baseClasses} ${sizeClasses[size]} ${getVariantClasses(variant, active)} ${disabledClasses} ${className}`.trim();

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
        title={title}
        data-benchmark-event={benchmarkEvent}
        data-benchmark-id={benchmarkId}
        data-benchmark-label={benchmarkLabel}
        data-benchmark-area={benchmarkArea}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    const isExternal = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
        title={title}
        target={target ?? (isExternal ? '_blank' : undefined)}
        rel={rel ?? (isExternal ? 'noopener noreferrer' : undefined)}
        data-benchmark-event={benchmarkEvent}
        data-benchmark-id={benchmarkId}
        data-benchmark-label={benchmarkLabel}
        data-benchmark-area={benchmarkArea}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
      title={title}
      data-benchmark-event={benchmarkEvent}
      data-benchmark-id={benchmarkId}
      data-benchmark-label={benchmarkLabel}
      data-benchmark-area={benchmarkArea}
    >
      {children}
    </button>
  );
};
