const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.resolve(__dirname, '../src/lib/report-print.ts');
const loaded = new Module(filename, module);
loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { reportDate } = loaded.exports;

test('report dates use deterministic punctuation across ICU implementations', () => {
  const original = Intl.DateTimeFormat.prototype.formatToParts;
  try {
    for (const literal of [', ', ' at ', '\u202f']) {
      Intl.DateTimeFormat.prototype.formatToParts = function (value) {
        return original.call(this, value).map(part => part.type === 'literal' ? { ...part, value: literal } : part);
      };
      assert.equal(reportDate('2025-12-18T13:02:00Z', true), '18 Dec 2025, 16:02 EAT');
    }
  } finally { Intl.DateTimeFormat.prototype.formatToParts = original; }
});

test('dates retain EAT rollover and date-only formatting', () => {
  assert.equal(reportDate('2026-11-11T21:00:00Z', true), '12 Nov 2026, 00:00 EAT');
  assert.equal(reportDate('2026-11-12', true), '12 Nov 2026');
  assert.equal(reportDate('2026-09-01'), '01 Sep 2026');
  assert.equal(reportDate(null), '—');
  assert.equal(reportDate('invalid'), '—');
});
