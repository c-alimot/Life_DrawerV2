import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const sourcePath = fileURLToPath(new URL("../src/constants/entryStatus.ts", import.meta.url));
const source = await readFile(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});
const module = { exports: {} };

vm.runInNewContext(compiled.outputText, { module, exports: module.exports, require });

const {
  ENTRY_STATUS_VALUES,
  entryStatusSchema,
  getEntryStatusDescription,
  getEntryStatusLabel,
  hasEntryStatus,
  isLegacyEntryWithoutStatus,
} = module.exports;

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

console.log("Entry Status runtime validation passed.");
