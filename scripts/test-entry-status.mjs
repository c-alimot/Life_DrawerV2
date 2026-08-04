import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
async function loadTypeScriptModule(relativePath) {
  const sourcePath = fileURLToPath(new URL(relativePath, import.meta.url));
  const source = await readFile(sourcePath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const module = { exports: {} };

  vm.runInNewContext(compiled.outputText, { module, exports: module.exports, require });
  return module.exports;
}

const statusModule = await loadTypeScriptModule("../src/constants/entryStatus.ts");
const requirementsModule = await loadTypeScriptModule("../src/features/entries/entryRequirements.ts");
const entryOptionsModule = await loadTypeScriptModule("../src/features/entries/entryOptions.ts");
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
