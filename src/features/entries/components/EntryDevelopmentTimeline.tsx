import { getEntryStatusLabel } from "@constants/entryStatus";
import { MaterialCommunityIcons } from "@components/ui/icons";
import { useTheme } from "@styles/theme";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ApiError } from "@types";
import type { EntryTimelineEvent } from "../entryDevelopmentTimeline";

const INITIAL_VISIBLE_EVENTS = 6;
const COLLAPSED_TEXT_LENGTH = 160;

interface EntryDevelopmentTimelineProps {
  events: EntryTimelineEvent[];
  isLoading: boolean;
  error: ApiError | null;
  onRetry: () => void;
  onOpenReflection: (entryId: string) => void;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatReflectionType(reflectionType: string | null): string {
  if (!reflectionType) {
    return "Connected reflection";
  }

  return `${reflectionType.charAt(0).toUpperCase()}${reflectionType.slice(1)}`;
}

function TimelineText({ text }: { text: string }) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = text.length > COLLAPSED_TEXT_LENGTH;
  const visibleText = isLong && !isExpanded ? `${text.slice(0, COLLAPSED_TEXT_LENGTH)}...` : text;

  return (
    <View style={styles.previewBlock}>
      <Text style={[theme.typography.bodySm, styles.previewText, { color: theme.colors.textSecondary }]}>“{visibleText}”</Text>
      {isLong ? (
        <TouchableOpacity
          onPress={() => setIsExpanded((current) => !current)}
          accessible
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          accessibilityLabel={isExpanded ? "Collapse timeline text" : "Expand timeline text"}
        >
          <Text style={[theme.typography.bodySm, styles.expandText, { color: theme.colors.primary }]}>
            {isExpanded ? "Show less" : "Read more"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function EntryDevelopmentTimeline({
  events,
  isLoading,
  error,
  onRetry,
  onOpenReflection,
}: EntryDevelopmentTimelineProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMeaningfulHistory = events.length > 1 || events[0]?.type !== "entry_created" || events[0]?.status !== null;
  const visibleEvents = useMemo(() => {
    if (isExpanded || events.length <= INITIAL_VISIBLE_EVENTS) {
      return events;
    }

    return events.slice(0, INITIAL_VISIBLE_EVENTS);
  }, [events, isExpanded]);

  if (!hasMeaningfulHistory && !isLoading && !error) {
    return null;
  }

  return (
    <View style={[styles.section, { borderColor: theme.colors.border }]}>
      <Text accessibilityRole="header" style={[theme.typography.h3, { color: theme.colors.text }]}>How this Entry developed</Text>

      {isLoading ? (
        <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Loading Entry history...</Text>
      ) : null}
      {error ? (
        <View style={styles.errorState} accessibilityLiveRegion="polite">
          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Entry history is unavailable right now.</Text>
          <TouchableOpacity onPress={onRetry} accessible accessibilityRole="button" accessibilityLabel="Retry loading Entry history">
            <Text style={[theme.typography.bodySm, styles.retryText, { color: theme.colors.primary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {hasMeaningfulHistory ? (
        <View accessibilityRole="list" style={styles.eventList}>
          {visibleEvents.map((event) => {
            const isReflection = event.type === "reflection_added" || event.type === "status_and_reflection";
            const reflectionId = isReflection ? event.reflectionEntryId : null;
            const reflectionType = isReflection ? event.reflectionType : null;
            const reflectionUnavailable = event.type === "status_and_reflection" && event.reflectionUnavailable;
            const status = event.type === "entry_created" || event.type === "status_updated" || event.type === "status_and_reflection"
              ? event.status
              : event.status;
            const note = event.type === "status_updated" || event.type === "status_and_reflection" ? event.note : null;
            const preview = event.type === "reflection_added" || event.type === "status_and_reflection" ? event.preview : null;
            const eventTitle = event.type === "entry_created"
              ? "Entry created"
              : event.type === "status_updated"
                ? "Status updated"
                : event.type === "reflection_added"
                  ? formatReflectionType(event.reflectionType)
                  : `${formatReflectionType(event.reflectionType)} and Status updated`;

            return (
              <View
                key={event.id}
                accessibilityState={{ selected: event.isCurrent }}
                style={[
                  styles.event,
                  { borderColor: event.isCurrent ? theme.colors.primary : theme.colors.border },
                  event.isCurrent && { backgroundColor: "#F1F3ED" },
                ]}
              >
                <View style={styles.eventHeader}>
                  <View style={styles.eventHeaderCopy}>
                    <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>{formatDate(event.date)}</Text>
                    <Text style={[theme.typography.body, styles.eventTitle, { color: theme.colors.text }]}>{eventTitle}</Text>
                  </View>
                  {event.isCurrent ? (
                    <View style={styles.currentLabel} accessibilityLabel="Current event">
                      <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.primary} />
                      <Text style={[theme.typography.labelSm, { color: theme.colors.primary }]}>Current</Text>
                    </View>
                  ) : null}
                </View>

                {status ? (
                  <Text style={[theme.typography.bodySm, styles.statusText, { color: theme.colors.secondary }]}>{getEntryStatusLabel(status)}</Text>
                ) : null}
                {note ? <TimelineText text={note} /> : null}
                {preview ? <TimelineText text={preview} /> : null}
                {reflectionUnavailable ? (
                  <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Connected reflection unavailable.</Text>
                ) : null}
                {reflectionId && !reflectionUnavailable ? (
                  <TouchableOpacity
                    onPress={() => onOpenReflection(reflectionId)}
                    accessible
                    accessibilityRole="link"
                    accessibilityLabel={`View ${formatReflectionType(reflectionType)}`}
                  >
                    <Text style={[theme.typography.bodySm, styles.openReflectionText, { color: theme.colors.primary }]}>View reflection</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {events.length > INITIAL_VISIBLE_EVENTS ? (
        <TouchableOpacity
          onPress={() => setIsExpanded((current) => !current)}
          accessible
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          accessibilityLabel={isExpanded ? "Show fewer history events" : "View full Entry history"}
        >
          <Text style={[theme.typography.bodySm, styles.expandText, { color: theme.colors.primary }]}>
            {isExpanded ? "Show fewer events" : "View full history"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    gap: 12,
  },
  errorState: {
    gap: 6,
  },
  retryText: {
    fontWeight: "700",
  },
  eventList: {
    gap: 10,
  },
  event: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  eventHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    fontWeight: "700",
  },
  currentLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontWeight: "700",
  },
  previewBlock: {
    gap: 4,
  },
  previewText: {
    lineHeight: 20,
  },
  expandText: {
    fontWeight: "700",
  },
  openReflectionText: {
    marginTop: 2,
    fontWeight: "700",
  },
});
