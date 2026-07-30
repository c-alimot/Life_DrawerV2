import type {
  EntryWithRelations,
  HomeReturnCandidate,
  HomeReturnCandidateReason,
  ReturnPreferences,
} from "@types";
import { isEntryEligibleForReturn } from "./isEntryEligibleForReturn";

export const HOME_RETURN_MINIMUM_AGE_DAYS = 30;
export const HOME_RETURN_RECENT_VIEW_WINDOW_DAYS = 7;
export const HOME_RETURN_NOT_VIEWED_WINDOW_DAYS = 90;
export const HOME_RETURN_RESURFACE_COOLDOWN_DAYS = 21;
export const HOME_RETURN_MINIMUM_PREVIEW_LENGTH = 24;
export const HOME_RETURN_AROUND_THIS_TIME_WINDOW_DAYS = 7;
export const HOME_RETURN_CANDIDATE_LIMIT = 60;

interface HomeReturnCandidateSelectionInput {
  entries: EntryWithRelations[];
  userId: string;
  preferences: Pick<
    ReturnPreferences,
    "returnFeaturesEnabled" | "showReturnContentOnHome" | "showOnThisDay"
  >;
  newestEntryId?: string;
  childReflectionEntryIds?: Set<string>;
  excludedEntryIds?: Set<string>;
  now?: Date;
}

interface ReturnEntryEligibilityInput {
  entries: EntryWithRelations[];
  userId: string;
  preferences: Pick<ReturnPreferences, "returnFeaturesEnabled">;
  excludedEntryIds?: Set<string>;
  now?: Date;
}

function getTimestamp(value?: string): number | null {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function hasMeaningfulPreview(entry: EntryWithRelations): boolean {
  return entry.content.trim().replace(/\s+/g, " ").length >= HOME_RETURN_MINIMUM_PREVIEW_LENGTH;
}

function isWithinCalendarWindow(entryDate: Date, now: Date): boolean {
  const referenceYear = 2000;
  const entryDay = new Date(referenceYear, entryDate.getMonth(), entryDate.getDate()).getTime();
  const currentDay = new Date(referenceYear, now.getMonth(), now.getDate()).getTime();
  const yearDuration = 366 * 24 * 60 * 60 * 1000;
  const difference = Math.abs(entryDay - currentDay);
  const circularDifference = Math.min(difference, yearDuration - difference);

  return circularDifference <= HOME_RETURN_AROUND_THIS_TIME_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

function isAroundThisTime(entry: EntryWithRelations, now: Date): boolean {
  const createdAt = new Date(entry.createdAt);
  return !Number.isNaN(createdAt.getTime()) && createdAt < now && isWithinCalendarWindow(createdAt, now);
}

function getContext(candidate: EntryWithRelations, reason: HomeReturnCandidateReason, now: Date) {
  if (reason === "saved_for_later") {
    return {
      contextLabel: "Saved for later",
      contextDescription: "You kept this entry to return to when you were ready.",
    };
  }

  if (reason === "around_this_time") {
    const createdAt = new Date(candidate.createdAt);
    const isLastYear = createdAt.getFullYear() === now.getFullYear() - 1;

    return {
      contextLabel: isLastYear ? "From this time last year" : "From around this time",
      contextDescription: "A thought you wrote around this date.",
    };
  }

  if (reason === "continuing_reflection") {
    return {
      contextLabel: "A continuing reflection",
      contextDescription: "You have returned to this thought before.",
    };
  }

  if (reason === "not_viewed_recently") {
    return {
      contextLabel: "Something to revisit",
      contextDescription: "A thought that has been resting in your collection.",
    };
  }

  return {
    contextLabel: "From your collection",
    contextDescription: "Something you may want to revisit.",
  };
}

function getCandidateReason(
  entry: EntryWithRelations,
  preferences: HomeReturnCandidateSelectionInput["preferences"],
  childReflectionEntryIds: Set<string>,
  now: Date,
): HomeReturnCandidateReason {
  if (entry.savedForLater) {
    return "saved_for_later";
  }

  if (preferences.showOnThisDay && isAroundThisTime(entry, now)) {
    return "around_this_time";
  }

  if (entry.parentEntryId || childReflectionEntryIds.has(entry.id)) {
    return "continuing_reflection";
  }

  const lastViewedAt = getTimestamp(entry.lastViewedAt);
  const notViewedSince = now.getTime() - HOME_RETURN_NOT_VIEWED_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  if (lastViewedAt === null || lastViewedAt < notViewedSince) {
    return "not_viewed_recently";
  }

  return "collection";
}

export function selectHomeReturnCandidate({
  entries,
  userId,
  preferences,
  newestEntryId,
  childReflectionEntryIds = new Set<string>(),
  excludedEntryIds = new Set<string>(),
  now = new Date(),
}: HomeReturnCandidateSelectionInput): HomeReturnCandidate | null {
  if (!preferences.returnFeaturesEnabled || !preferences.showReturnContentOnHome) {
    return null;
  }

  const effectiveExcludedEntryIds = new Set(excludedEntryIds);
  if (newestEntryId) {
    effectiveExcludedEntryIds.add(newestEntryId);
  }

  const eligibleEntries = getEligibleReturnEntries({
    entries,
    userId,
    preferences,
    excludedEntryIds: effectiveExcludedEntryIds,
    now,
  });

  const priorities: HomeReturnCandidateReason[] = [
    "saved_for_later",
    "around_this_time",
    "continuing_reflection",
    "not_viewed_recently",
    "collection",
  ];

  for (const reason of priorities) {
    const entry = eligibleEntries
      .filter(
        (candidate) =>
          getCandidateReason(candidate, preferences, childReflectionEntryIds, now) === reason,
      )
      .sort((left, right) => {
        const leftLastViewedAt = getTimestamp(left.lastViewedAt) || 0;
        const rightLastViewedAt = getTimestamp(right.lastViewedAt) || 0;

        return (
          leftLastViewedAt - rightLastViewedAt ||
          (getTimestamp(left.createdAt) || 0) - (getTimestamp(right.createdAt) || 0)
        );
      })[0];

    if (entry) {
      return {
        entry,
        reason,
        ...getContext(entry, reason, now),
      };
    }
  }

  return null;
}

export function getEligibleReturnEntries({
  entries,
  userId,
  preferences,
  excludedEntryIds = new Set<string>(),
  now = new Date(),
}: ReturnEntryEligibilityInput): EntryWithRelations[] {
  const minimumAge = now.getTime() - HOME_RETURN_MINIMUM_AGE_DAYS * 24 * 60 * 60 * 1000;
  const recentViewCutoff = now.getTime() - HOME_RETURN_RECENT_VIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const resurfaceCooldownCutoff =
    now.getTime() - HOME_RETURN_RESURFACE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

  return entries.filter((entry) => {
    const createdAt = getTimestamp(entry.createdAt);
    const lastViewedAt = getTimestamp(entry.lastViewedAt);
    const lastResurfacedAt = getTimestamp(entry.lastResurfacedAt);
    const dismissedUntil = getTimestamp(entry.returnDismissedUntil);

    return (
      entry.userId === userId &&
      !excludedEntryIds.has(entry.id) &&
      createdAt !== null &&
      createdAt <= minimumAge &&
      (lastViewedAt === null || lastViewedAt < recentViewCutoff) &&
      (lastResurfacedAt === null || lastResurfacedAt < resurfaceCooldownCutoff) &&
      (dismissedUntil === null || dismissedUntil <= now.getTime()) &&
      hasMeaningfulPreview(entry) &&
      entry.drawers.every((drawer) => isEntryEligibleForReturn({ entry, drawer, preferences })) &&
      isEntryEligibleForReturn({ entry, preferences })
    );
  });
}
