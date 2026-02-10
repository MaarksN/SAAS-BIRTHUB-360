import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export const scaleUp: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};

export const listItem: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 }
};
