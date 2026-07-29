import type { Drawer, Entry, ReturnPreferences } from "@types";

interface EntryReturnEligibilityInput {
  entry: Pick<Entry, "resurfacingEnabled">;
  drawer?: Pick<Drawer, "resurfacingEnabled"> | null;
  preferences: Pick<ReturnPreferences, "returnFeaturesEnabled">;
}

export function isEntryEligibleForReturn({
  entry,
  drawer,
  preferences,
}: EntryReturnEligibilityInput): boolean {
  if (!preferences.returnFeaturesEnabled) {
    return false;
  }

  if (!entry.resurfacingEnabled) {
    return false;
  }

  return drawer?.resurfacingEnabled !== false;
}
