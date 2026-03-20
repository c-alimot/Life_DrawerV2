export const MINIMUM_TAP_TARGET = 44; // iOS/Android standard
export const MINIMUM_CONTRAST_RATIO = 4.5; // WCAG AA

export const a11y = {
  // Minimum touch target sizes (44x44 is standard)
  minTouchTarget: MINIMUM_TAP_TARGET,

  // Text sizes for readability
  minFontSize: 12,
  bodyFontSize: 16,

  // Focus indicators
  focusWidth: 2,
  focusBorderRadius: 4,

  // Animation durations (reduced motion aware)
  motionDurationMs: {
    instant: 0,
    quick: 150,
    base: 250,
    slow: 350,
  },
};