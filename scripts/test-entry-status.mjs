import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
async function loadTypeScriptModule(relativePath, dependencies = {}) {
  const sourcePath = fileURLToPath(new URL(relativePath, import.meta.url));
  const source = await readFile(sourcePath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const module = { exports: {} };

  const moduleRequire = (specifier) => dependencies[specifier] || require(specifier);
  vm.runInNewContext(compiled.outputText, { module, exports: module.exports, require: moduleRequire });
  return module.exports;
}

const statusModule = await loadTypeScriptModule("../src/constants/entryStatus.ts");
const requirementsModule = await loadTypeScriptModule("../src/features/entries/entryRequirements.ts");
const entryOptionsModule = await loadTypeScriptModule("../src/features/entries/entryOptions.ts");
const statusUpdateModule = await loadTypeScriptModule(
  "../src/features/entries/statusUpdate.ts",
  { "@constants/entryStatus": statusModule },
);
const timelineModule = await loadTypeScriptModule("../src/features/entries/entryDevelopmentTimeline.ts");
const {
  ENTRY_STATUS_VALUES,
  entryStatusSchema,
  getEntryStatusDescription,
  getEntryStatusLabel,
  hasEntryStatus,
  isLegacyEntryWithoutStatus,
} = statusModule;
const { validateEntryRequirements } = requirementsModule;
const { ENTRY_OPTION_ORDER, hasEntryOptionOrder } = entryOptionsModule;
const {
  canSaveStatusUpdate,
  getStatusUpdateHelperText,
  normalizeStatusNote,
} = statusUpdateModule;
const { buildEntryDevelopmentTimeline } = timelineModule;

assert.deepEqual(Array.from(ENTRY_OPTION_ORDER), [
  "drawer",
  "tags",
  "status",
  "image",
  "voice-memo",
  "location",
]);
assert.equal(ENTRY_OPTION_ORDER[0], "drawer");
assert.equal(ENTRY_OPTION_ORDER.at(-1), "location");
assert.equal(ENTRY_OPTION_ORDER.includes("mood"), false);
assert.equal(hasEntryOptionOrder(ENTRY_OPTION_ORDER), true);
assert.equal(hasEntryOptionOrder(["drawer", "tags", "status", "image", "location", "voice-memo"]), false);

assert.equal(normalizeStatusNote("  A little more context  "), "A little more context");
assert.equal(normalizeStatusNote("   "), null);
assert.equal(canSaveStatusUpdate("settled", "settled", ""), false);
assert.equal(canSaveStatusUpdate("settled", "settled", "More settled than before."), true);
assert.equal(canSaveStatusUpdate("settled", "still_unfolding", ""), true);
assert.equal(canSaveStatusUpdate(null, "in_the_moment", ""), true);
assert.equal(canSaveStatusUpdate(null, null, "A note"), false);
assert.equal(
  getStatusUpdateHelperText("settled", "settled", ""),
  "Choose a different Status or add a note.",
);

const rootEntry = {
  id: "root-entry",
  parentEntryId: undefined,
  reflectionType: undefined,
  content: "The original thought remains intact.",
  currentStatus: "in_the_moment",
  createdAt: "2026-01-01T00:00:00.000Z",
};
const updateReflection = {
  id: "update-reflection",
  parentEntryId: "root-entry",
  reflectionType: "update",
  content: "A connected update with more context.",
  currentStatus: "something_changed",
  createdAt: "2026-02-01T00:00:00.000Z",
};
const responseReflection = {
  id: "response-reflection",
  parentEntryId: "root-entry",
  reflectionType: "response",
  content: "A sibling response is still visible.",
  currentStatus: null,
  createdAt: "2026-03-01T00:00:00.000Z",
};
const continuationReflection = {
  id: "continuation-reflection",
  parentEntryId: "update-reflection",
  reflectionType: "continuation",
  content: "A later continuation remains part of the history.",
  currentStatus: "looking_back",
  createdAt: "2026-04-01T00:00:00.000Z",
};
const timeline = buildEntryDevelopmentTimeline(
  [rootEntry, updateReflection, responseReflection, continuationReflection],
  [
    { id: "initial-status", status: "in_the_moment", source: "initial", createdAt: "2026-01-01T00:01:00.000Z" },
    { id: "linked-status", status: "something_changed", source: "update", note: "The context changed.", connectedReflectionEntryId: "update-reflection", createdAt: "2026-02-01T00:00:00.000Z" },
    { id: "later-status", status: "settled", source: "update", note: null, connectedReflectionEntryId: null, createdAt: "2026-05-01T00:00:00.000Z" },
  ],
);

assert.ok(timeline);
assert.deepEqual(Array.from(timeline.events, (event) => event.type), [
  "entry_created",
  "status_and_reflection",
  "reflection_added",
  "reflection_added",
  "status_updated",
]);
assert.equal(timeline.events.filter((event) => event.type === "status_and_reflection").length, 1);
assert.equal(timeline.events.filter((event) => event.type === "reflection_added").length, 2);
assert.equal(timeline.events.at(-1).isCurrent, true);
assert.equal(timeline.events[0].status, "in_the_moment");

const missingReflectionTimeline = buildEntryDevelopmentTimeline(
  [rootEntry],
  [{ id: "missing-linked-status", status: "settled", source: "update", note: null, connectedReflectionEntryId: "deleted-reflection", createdAt: "2026-02-01T00:00:00.000Z" }],
);
assert.equal(missingReflectionTimeline.events[1].type, "status_and_reflection");
assert.equal(missingReflectionTimeline.events[1].reflectionUnavailable, true);

assert.deepEqual(Array.from(ENTRY_STATUS_VALUES), [
  "in_the_moment",
  "still_unfolding",
  "something_changed",
  "settled",
  "looking_back",
]);

for (const status of ENTRY_STATUS_VALUES) {
  assert.equal(entryStatusSchema.safeParse(status).success, true);
  assert.ok(getEntryStatusLabel(status));
  assert.ok(getEntryStatusDescription(status));
}

assert.equal(entryStatusSchema.safeParse("happy").success, false);
assert.equal(entryStatusSchema.safeParse("arbitrary_status").success, false);
assert.equal(hasEntryStatus({ currentStatus: "settled" }), true);
assert.equal(hasEntryStatus({ currentStatus: "happy" }), false);
assert.equal(isLegacyEntryWithoutStatus({ currentStatus: null }), true);
assert.equal(isLegacyEntryWithoutStatus({}), true);
assert.equal(isLegacyEntryWithoutStatus({ currentStatus: "looking_back" }), false);
assert.equal(
  isLegacyEntryWithoutStatus({ mood: "happy", currentStatus: null }),
  true,
  "Legacy Mood-only Entries remain valid without a Status.",
);

assert.equal(
  JSON.stringify(validateEntryRequirements([], null)),
  JSON.stringify({
    drawerError: "Choose a Drawer so you can find this Entry again.",
    statusError: "Choose where this stands for you right now.",
    summary: "Before saving, choose a Drawer and set a Status.",
  }),
);
assert.equal(
  validateEntryRequirements([], "settled").summary,
  "Choose a Drawer so you can find this Entry again.",
);
assert.equal(
  validateEntryRequirements(["drawer-id"], null).summary,
  "Choose where this stands for you right now.",
);
assert.equal(validateEntryRequirements(["drawer-id"], "settled").summary, null);

console.log("Entry Status runtime validation passed.");
