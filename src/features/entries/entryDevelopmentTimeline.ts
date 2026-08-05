import type {
  EntryStatus,
  EntryStatusHistory,
  ReflectionChainEntry,
  ReflectionType,
} from "@types";

const REFLECTION_PREVIEW_LENGTH = 220;

interface EntryTimelineEventBase {
  id: string;
  date: string;
  isCurrent: boolean;
}

export interface EntryCreatedTimelineEvent extends EntryTimelineEventBase {
  type: "entry_created";
  entryId: string;
  status: EntryStatus | null;
}

export interface StatusUpdatedTimelineEvent extends EntryTimelineEventBase {
  type: "status_updated";
  status: EntryStatus;
  note: string | null;
}

export interface ReflectionAddedTimelineEvent extends EntryTimelineEventBase {
  type: "reflection_added";
  reflectionEntryId: string;
  reflectionType: ReflectionType | null;
  preview: string;
  status: EntryStatus | null;
}

export interface StatusAndReflectionTimelineEvent extends EntryTimelineEventBase {
  type: "status_and_reflection";
  status: EntryStatus;
  note: string | null;
  reflectionEntryId: string;
  reflectionType: ReflectionType | null;
  preview: string | null;
  reflectionUnavailable: boolean;
}

export type EntryTimelineEvent =
  | EntryCreatedTimelineEvent
  | StatusUpdatedTimelineEvent
  | ReflectionAddedTimelineEvent
  | StatusAndReflectionTimelineEvent;

export interface EntryDevelopmentTimeline {
  rootEntry: ReflectionChainEntry;
  reflectionChain: ReflectionChainEntry[];
  events: EntryTimelineEvent[];
}

function getEntryPreview(entry: ReflectionChainEntry): string {
  const content = entry.content.trim().replace(/\s+/g, " ");
  return content.length > REFLECTION_PREVIEW_LENGTH
    ? `${content.slice(0, REFLECTION_PREVIEW_LENGTH)}...`
    : content;
}

function sortTimelineEvents(events: EntryTimelineEvent[]): EntryTimelineEvent[] {
  const orderedEvents = [...events].sort((left, right) => {
    const dateDifference = new Date(left.date).getTime() - new Date(right.date).getTime();
    return dateDifference || left.id.localeCompare(right.id);
  });

  return orderedEvents.map((event, index) => ({
    ...event,
    isCurrent: index === orderedEvents.length - 1,
  }));
}

export function buildEntryDevelopmentTimeline(
  reflectionChain: ReflectionChainEntry[],
  statusHistory: EntryStatusHistory[],
): EntryDevelopmentTimeline | null {
  const rootEntry = reflectionChain.find((entry) => !entry.parentEntryId) || reflectionChain[0];
  if (!rootEntry) {
    return null;
  }

  const reflections = reflectionChain.filter((entry) => entry.id !== rootEntry.id);
  const reflectionsById = new Map(reflections.map((entry) => [entry.id, entry]));
  const combinedReflectionIds = new Set<string>();
  const initialStatus = statusHistory.find((event) => event.source === "initial")?.status || null;
  const events: EntryTimelineEvent[] = [{
    type: "entry_created",
    id: `entry-created:${rootEntry.id}`,
    date: rootEntry.createdAt,
    entryId: rootEntry.id,
    status: initialStatus,
    isCurrent: false,
  }];

  for (const statusEvent of statusHistory) {
    if (statusEvent.source === "initial") {
      continue;
    }

    const linkedReflectionId = statusEvent.connectedReflectionEntryId;
    if (linkedReflectionId) {
      combinedReflectionIds.add(linkedReflectionId);
      const reflection = reflectionsById.get(linkedReflectionId);
      events.push({
        type: "status_and_reflection",
        id: `status-reflection:${statusEvent.id}`,
        date: statusEvent.createdAt,
        status: statusEvent.status,
        note: statusEvent.note ?? null,
        reflectionEntryId: linkedReflectionId,
        reflectionType: reflection?.reflectionType ?? null,
        preview: reflection ? getEntryPreview(reflection) : null,
        reflectionUnavailable: !reflection,
        isCurrent: false,
      });
      continue;
    }

    events.push({
      type: "status_updated",
      id: `status:${statusEvent.id}`,
      date: statusEvent.createdAt,
      status: statusEvent.status,
      note: statusEvent.note ?? null,
      isCurrent: false,
    });
  }

  for (const reflection of reflections) {
    if (combinedReflectionIds.has(reflection.id)) {
      continue;
    }

    events.push({
      type: "reflection_added",
      id: `reflection:${reflection.id}`,
      date: reflection.createdAt,
      reflectionEntryId: reflection.id,
      reflectionType: reflection.reflectionType ?? null,
      preview: getEntryPreview(reflection),
      status: reflection.currentStatus,
      isCurrent: false,
    });
  }

  return {
    rootEntry,
    reflectionChain,
    events: sortTimelineEvents(events),
  };
}
