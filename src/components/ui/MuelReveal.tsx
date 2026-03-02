import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { useMuelMotion } from '../../hooks/useMuelMotion';

type MotionKind = 'component' | 'feature';
type RevealTag = 'div' | 'section' | 'article' | 'span' | 'h1' | 'p' | 'nav' | 'aside';

const TAG_COMPONENTS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  span: motion.span,
  h1: motion.h1,
  p: motion.p,
  nav: motion.nav,
  aside: motion.aside,
} as const;

type MuelRevealProps = HTMLMotionProps<'div'> & {
  as?: RevealTag;
  delayMultiplier?: number;
  motionKind?: MotionKind;
};

export const MuelReveal: React.FC<MuelRevealProps> = ({
  as = 'div',
  delayMultiplier = 0,
  motionKind = 'component',
  ...rest
}) => {
  const { getRevealProps } = useMuelMotion();
  const Component = TAG_COMPONENTS[as];
  const resolvedMotionKind: MotionKind = motionKind === 'feature' ? 'feature' : 'component';

  return <Component {...getRevealProps(delayMultiplier, resolvedMotionKind)} {...rest} />;
};
