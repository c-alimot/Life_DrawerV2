import type { EntryStatus } from "@types";

export interface EntryRequirementValidation {
  drawerError: string | null;
  statusError: string | null;
  summary: string | null;
}

export function validateEntryRequirements(
  drawerIds: string[],
  status: EntryStatus | null,
): EntryRequirementValidation {
  const hasDrawer = drawerIds.length > 0;
  const hasStatus = Boolean(status);

  if (hasDrawer && hasStatus) {
    return { drawerError: null, statusError: null, summary: null };
  }

  if (!hasDrawer && !hasStatus) {
    return {
      drawerError: "Choose a Drawer so you can find this Entry again.",
      statusError: "Choose where this stands for you right now.",
      summary: "Before saving, choose a Drawer and set a Status.",
    };
  }

  return hasDrawer
    ? {
        drawerError: null,
        statusError: "Choose where this stands for you right now.",
        summary: "Choose where this stands for you right now.",
      }
    : {
        drawerError: "Choose a Drawer so you can find this Entry again.",
        statusError: null,
        summary: "Choose a Drawer so you can find this Entry again.",
      };
}
