import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  forwardRef,
  type ComponentRef,
  type ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import type { EntryOptionKey } from "@features/entries/entryOptions";

const HINT_STORAGE_KEY = "life-drawer:entry-options-hint-dismissed";

export interface EntryOptionsCarouselButton {
  key: EntryOptionKey;
  content: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  disabled?: boolean;
  required?: boolean;
  selected?: boolean;
  borderColor: string;
  backgroundColor?: string;
}

export interface EntryOptionsCarouselHandle {
  revealOption: (key: EntryOptionKey, focus?: boolean) => void;
}

interface EntryOptionsCarouselProps {
  buttons: EntryOptionsCarouselButton[];
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  surfaceColor?: string;
}

const webStorage = {
  async getItem(key: string) {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
};

const hintStorage = Platform.OS === "web" ? webStorage : AsyncStorage;

function EdgeFade({
  direction,
  surfaceColor,
}: {
  direction: "left" | "right";
  surfaceColor: string;
}) {
  const opacities = direction === "left"
    ? [0.78, 0.52, 0.26, 0]
    : [0, 0.26, 0.52, 0.78];

  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={[styles.fade, direction === "left" ? styles.leftFade : styles.rightFade]}
    >
      {opacities.map((opacity, index) => (
        <View
          key={`${direction}-${opacity}-${index}`}
          style={[styles.fadeStep, { backgroundColor: surfaceColor, opacity }]}
        />
      ))}
    </View>
  );
}

export const EntryOptionsCarousel = forwardRef<
  EntryOptionsCarouselHandle,
  EntryOptionsCarouselProps
>(function EntryOptionsCarousel(
  { buttons, containerStyle, buttonStyle, surfaceColor = "#EDEAE4" },
  ref,
) {
  const scrollRef = useRef<ScrollView>(null);
  const buttonLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const buttonRefs = useRef<Record<string, ComponentRef<typeof TouchableOpacity> | null>>({});
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const hasOverflow = contentWidth > viewportWidth + 1;
  const maxScroll = Math.max(contentWidth - viewportWidth, 0);
  const showLeftFade = hasOverflow && scrollX > 2;
  const showRightFade = hasOverflow && scrollX < maxScroll - 2;
  const progress = maxScroll ? Math.min(Math.max(scrollX / maxScroll, 0), 1) : 0;

  useEffect(() => {
    let isMounted = true;
    void hintStorage.getItem(HINT_STORAGE_KEY).then((value) => {
      if (isMounted && value !== "true") {
        setShowHint(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );

    return () => subscription.remove();
  }, []);

  const dismissHint = useCallback(() => {
    if (!showHint) return;
    setShowHint(false);
    void hintStorage.setItem(HINT_STORAGE_KEY, "true");
  }, [showHint]);

  const revealOption = useCallback((key: EntryOptionKey, focus = false) => {
    const layout = buttonLayouts.current[key];
    if (!layout || !viewportWidth) return;

    const left = Math.max(layout.x - 8, 0);
    const right = layout.x + layout.width + 8;
    const nextScrollX = left < scrollX
      ? left
      : right > scrollX + viewportWidth
        ? Math.min(right - viewportWidth, maxScroll)
        : scrollX;

    scrollRef.current?.scrollTo({ x: nextScrollX, animated: !reduceMotion });
    if (focus) {
      requestAnimationFrame(() => buttonRefs.current[key]?.focus?.());
    }
  }, [maxScroll, reduceMotion, scrollX, viewportWidth]);

  useImperativeHandle(ref, () => ({ revealOption }), [revealOption]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(event.nativeEvent.contentOffset.x);
    dismissHint();
  }, [dismissHint]);

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    setViewportWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <View style={[styles.wrapper, containerStyle]} accessible={false}>
      <Text accessibilityRole="header" style={styles.accessibilityLabel}>
        Entry options
      </Text>
      <View style={styles.viewport} onLayout={handleViewportLayout}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={(width) => setContentWidth(width)}
          contentContainerStyle={styles.scrollContent}
          directionalLockEnabled
          keyboardShouldPersistTaps="handled"
        >
          {buttons.map((button) => (
            <TouchableOpacity
              key={button.key}
              ref={(node) => {
                buttonRefs.current[button.key] = node;
              }}
              onLayout={(event) => {
                buttonLayouts.current[button.key] = {
                  x: event.nativeEvent.layout.x,
                  width: event.nativeEvent.layout.width,
                };
              }}
              style={[
                styles.option,
                buttonStyle,
                {
                  borderColor: button.borderColor,
                  backgroundColor: button.backgroundColor || "#ECE6DB",
                },
              ]}
              onPress={button.onPress}
              onFocus={() => revealOption(button.key)}
              disabled={button.disabled}
              accessible
              accessibilityRole="button"
              accessibilityState={{ disabled: button.disabled, selected: button.selected }}
              accessibilityLabel={button.required ? `${button.accessibilityLabel}, required` : button.accessibilityLabel}
              accessibilityHint={button.accessibilityHint}
            >
              {button.required ? <Text style={styles.requiredMarker}>*</Text> : null}
              {button.content}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {showLeftFade ? <EdgeFade direction="left" surfaceColor={surfaceColor} /> : null}
        {showRightFade ? <EdgeFade direction="right" surfaceColor={surfaceColor} /> : null}
      </View>

      {hasOverflow && showHint ? (
        <Text accessible={false} style={styles.hint}>
          {Platform.OS === "web" ? "Scroll to see more options" : "Swipe to see more options"}
        </Text>
      ) : null}

      {hasOverflow ? (
        <View accessible={false} style={styles.progressTrack}>
          <View style={[styles.progressThumb, { left: `${progress * 72}%` }]} />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
    marginTop: 4,
  },
  accessibilityLabel: {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    color: "transparent",
    fontSize: 1,
  },
  viewport: {
    position: "relative",
  },
  scrollContent: {
    gap: 8,
    paddingRight: 14,
  },
  option: {
    width: 78,
    minHeight: 82,
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  requiredMarker: {
    position: "absolute",
    top: 6,
    right: 8,
    color: "#8B2D2A",
    fontSize: 15,
    fontWeight: "700",
  },
  fade: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 20,
    flexDirection: "row",
  },
  leftFade: {
    left: 0,
  },
  rightFade: {
    right: 0,
  },
  fadeStep: {
    flex: 1,
  },
  hint: {
    color: "#6F6860",
    fontSize: 12,
    marginTop: 7,
  },
  progressTrack: {
    height: 3,
    width: 82,
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: "#DAC8B1",
    overflow: "hidden",
  },
  progressThumb: {
    position: "absolute",
    width: "28%",
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: "#8C9A7F",
  },
});
