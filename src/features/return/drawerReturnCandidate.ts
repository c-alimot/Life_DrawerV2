import { getEligibleReturnEntries } from "./basicReturnEntry";
import type {
  DrawerReturnCandidate,
  DrawerReturnCandidateReason,
  EntryWithRelations,
  ReturnPreferences,
} from "@types";

interface DrawerReturnCandidateSelectionInput {
  entries: EntryWithRelations[];
  userId: string;
  preferences: Pick<ReturnPreferences, "returnFeaturesEnabled">;
  childReflectionEntryIds?: Set<string>;
  excludedEntryIds?: Set<string>;
  now?: Date;
}

function getTimestamp(value?: string): number {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortByOldestCreatedAt(left: EntryWithRelations, right: EntryWithRelations): number {
  return getTimestamp(left.createdAt) - getTimestamp(right.createdAt);
}

function sortByLeastRecentlyViewed(left: EntryWithRelations, right: EntryWithRelations): number {
  return getTimestamp(left.lastViewedAt) - getTimestamp(right.lastViewedAt) || sortByOldestCreatedAt(left, right);
}

function getContext(reason: DrawerReturnCandidateReason) {
  if (reason === "saved_for_later") {
    return {
      contextLabel: "Saved for later",
      contextDescription: "You kept this entry to return to when you were ready.",
    };
  }

  if (reason === "continuing_reflection") {
    return {
      contextLabel: "Part of a continuing reflection",
      contextDescription: "This thought is connected to another reflection.",
    };
  }

  return {
    contextLabel: "From earlier in this drawer",
    contextDescription: "Something you may want to revisit here.",
  };
}

export function selectDrawerReturnCandidate({
  entries,
  userId,
  preferences,
  childReflectionEntryIds = new Set<string>(),
  excludedEntryIds,
  now,
}: DrawerReturnCandidateSelectionInput): DrawerReturnCandidate | null {
  const eligibleEntries = getEligibleReturnEntries({
    entries,
    userId,
    preferences,
    excludedEntryIds,
    now,
  });

  const prioritizedGroups: {
    reason: DrawerReturnCandidateReason;
    entries: EntryWithRelations[];
    sort: (left: EntryWithRelations, right: EntryWithRelations) => number;
  }[] = [
    {
      reason: "saved_for_later",
      entries: eligibleEntries.filter((entry) => entry.savedForLater),
      sort: sortByOldestCreatedAt,
    },
    {
      reason: "continuing_reflection",
      entries: eligibleEntries.filter(
        (entry) => entry.parentEntryId || childReflectionEntryIds.has(entry.id),
      ),
      sort: sortByLeastRecentlyViewed,
    },
    {
      reason: "least_recently_viewed",
      entries: eligibleEntries.filter((entry) => Boolean(entry.lastViewedAt)),
      sort: sortByLeastRecentlyViewed,
    },
    {
      reason: "collection",
      entries: eligibleEntries,
      sort: sortByOldestCreatedAt,
    },
  ];

  for (const group of prioritizedGroups) {
    const entry = [...group.entries].sort(group.sort)[0];
    if (entry) {
      return {
        entry,
        reason: group.reason,
        ...getContext(group.reason),
      };
    }
  }

  return null;
}
