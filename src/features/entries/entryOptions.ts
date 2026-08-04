export const ENTRY_OPTION_ORDER = [
  "drawer",
  "tags",
  "status",
  "image",
  "voice-memo",
  "location",
] as const;

export type EntryOptionKey = (typeof ENTRY_OPTION_ORDER)[number];

export function hasEntryOptionOrder(keys: readonly EntryOptionKey[]) {
  return keys.length === ENTRY_OPTION_ORDER.length && keys.every(
    (key, index) => key === ENTRY_OPTION_ORDER[index],
  );
}
