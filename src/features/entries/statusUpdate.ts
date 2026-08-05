import { ENTRY_STATUS_NOTE_MAX_LENGTH } from "@constants/entryStatus";
import type { EntryStatus } from "@types";

export function normalizeStatusNote(note: string): string | null {
  const trimmedNote = note.trim();
  return trimmedNote || null;
}

export function canSaveStatusUpdate(
  currentStatus: EntryStatus | null,
  selectedStatus: EntryStatus | null,
  note: string,
): boolean {
  if (!selectedStatus || note.length > ENTRY_STATUS_NOTE_MAX_LENGTH) {
    return false;
  }

  return selectedStatus !== currentStatus || normalizeStatusNote(note) !== null;
}

export function getStatusUpdateHelperText(
  currentStatus: EntryStatus | null,
  selectedStatus: EntryStatus | null,
  note: string,
): string | null {
  if (!selectedStatus) {
    return "Choose a Status to continue.";
  }

  if (!canSaveStatusUpdate(currentStatus, selectedStatus, note)) {
    return "Choose a different Status or add a note.";
  }

  return null;
}
