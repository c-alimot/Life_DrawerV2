import { z } from "zod";

export const ENTRY_STATUS_VALUES = [
  "in_the_moment",
  "still_unfolding",
  "something_changed",
  "settled",
  "looking_back",
] as const;

export type EntryStatus = (typeof ENTRY_STATUS_VALUES)[number];

export const entryStatusSchema = z.enum(ENTRY_STATUS_VALUES);
export const ENTRY_STATUS_NOTE_MAX_LENGTH = 2_000;

export const updateEntryStatusSchema = z
  .object({
    entryId: z.string().uuid(),
    status: entryStatusSchema,
    note: z.string().trim().max(ENTRY_STATUS_NOTE_MAX_LENGTH).nullable().optional(),
    connectedReflectionEntryId: z.string().uuid().nullable().optional(),
  })
  .strict();

export const ENTRY_STATUS_DETAILS: Record<
  EntryStatus,
  { label: string; description: string }
> = {
  in_the_moment: {
    label: "In the moment",
    description: "This is where things are right now.",
  },
  still_unfolding: {
    label: "Still unfolding",
    description: "There is more to understand or experience.",
  },
  something_changed: {
    label: "Something changed",
    description: "The situation or your perspective has changed.",
  },
  settled: {
    label: "Settled",
    description: "This feels more settled or stable now.",
  },
  looking_back: {
    label: "Looking back",
    description: "This is something you want to remember or revisit.",
  },
};

type EntryStatusCarrier = {
  currentStatus?: EntryStatus | null;
};

export function hasEntryStatus(entry: EntryStatusCarrier): entry is EntryStatusCarrier & {
  currentStatus: EntryStatus;
} {
  return entryStatusSchema.safeParse(entry.currentStatus).success;
}

export function isLegacyEntryWithoutStatus(entry: EntryStatusCarrier): boolean {
  return entry.currentStatus == null;
}

export function getEntryStatusLabel(status: EntryStatus): string {
  return ENTRY_STATUS_DETAILS[status].label;
}

export function getEntryStatusDescription(status: EntryStatus): string {
  return ENTRY_STATUS_DETAILS[status].description;
}
