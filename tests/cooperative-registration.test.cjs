const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const { test } = require("node:test");
const ts = require("typescript");

const filename = path.resolve(__dirname, "../src/features/dairy/cooperative-registration.ts");
const source = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loaded = new Module(filename, module);
loaded._compile(source, filename);
const { registrationNumberError, registrationNumberUpdate } = loaded.exports;

test("location edits allow the saved slash-format number and omit it from the PATCH", () => {
  const original = "MCU/REG/2026/001";
  assert.equal(registrationNumberError(original, original), undefined);
  const payload = { region_id: 2, ...registrationNumberUpdate(original, original) };
  assert.deepEqual(payload, { region_id: 2 });
});

test("unchanged legacy spelling is preserved, including after reverting a field edit", () => {
  const original = "old-registration";
  assert.ok(registrationNumberError("invalid replacement", original));
  assert.equal(registrationNumberError(original, original), undefined);
  assert.deepEqual(registrationNumberUpdate(` ${original} `, original), {});
});

test("new and changed numbers still require the current format", () => {
  assert.ok(registrationNumberError("invalid"));
  assert.ok(registrationNumberError("MCU/REG/2026/002", "MCU/REG/2026/001"));
  const replacement = " cop-ars-mru-dc-2021-0458 ";
  assert.equal(registrationNumberError(replacement, "MCU/REG/2026/001"), undefined);
  assert.deepEqual(registrationNumberUpdate(replacement, "MCU/REG/2026/001"), {
    registration_number: "COP-ARS-MRU-DC-2021-0458",
  });
});

test("optional numbers can be empty or explicitly cleared", () => {
  assert.equal(registrationNumberError(""), undefined);
  assert.deepEqual(registrationNumberUpdate("", null), {});
  assert.deepEqual(registrationNumberUpdate("", "MCU/REG/2026/001"), { registration_number: null });
});
