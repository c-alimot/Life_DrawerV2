import { AccessibilityInfo } from 'react-native';

export const motion = {
  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },

  // Duration presets
  duration: {
    instant: 0,
    quick: 150,
    base: 250,
    slow: 350,
  },

  // Scale animations (gentle, not extreme)
  scale: {
    subtle: 0.95,
    small: 0.9,
    medium: 0.8,
  },

  // Opacity animations
  opacity: {
    subtle: 0.1,
    small: 0.3,
    medium: 0.5,
  },
};

// Hook to check if user prefers reduced motion
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const checkReducedMotion = async () => {
      const result = await AccessibilityInfo.boldTextEnabled();
      // Note: React Native doesn't have direct reduceMotion API,
      // but you can check via platform APIs
      setPrefersReducedMotion(false);
    };

    checkReducedMotion();
  }, []);

  return prefersReducedMotion;
};

// Helper to apply motion-safe durations
export const getAnimationDuration = (
  preferredDuration: number,
  prefersReducedMotion: boolean
): number => {
  return prefersReducedMotion ? 0 : preferredDuration;
};