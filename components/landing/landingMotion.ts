export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' }
  }
};

export const staggerGroup = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 }
  }
};

export const displayFont = {
  fontFamily: "'Bricolage Grotesque Variable', 'Bricolage Grotesque', sans-serif",
  fontWeight: 700
} as const;
