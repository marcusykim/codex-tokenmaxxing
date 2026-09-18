import test from 'node:test';
import assert from 'node:assert/strict';
import { scenarioRank, estimate, roundedRank } from '../public/model.js';
import { buildReport } from '../scripts/report.mjs';

test('selection formula inverts a known sampling process', () => {
  const populationShare = 0.01, bias = 100;
  const sampleShare = bias * populationShare / (bias * populationShare + 1 - populationShare);
  assert.equal(scenarioRank(sampleShare, 100001, bias), 1001);
});
test('scenario order and finite endpoints', () => {
  const result = estimate(706 / 2185, { population: 25000000, biasLow: 100, biasMedian: 1000, biasHigh: 10000 });
  assert.deepEqual(result, { optimistic: 1194, median: 11929, conservative: 118771 });
  assert.equal(scenarioRank(0, 25000000, 1000), 1);
  assert.equal(scenarioRank(1, 25000000, 1000), 25000000);
  assert.throws(() => scenarioRank(0.5, 25000000, 0));
  assert.throws(() => scenarioRank(NaN, 25000000, 1000));
  assert.equal(roundedRank(result.median), 11900);
});
test('report counts cached input once and uses calendar window', () => {
  const old = { date: '2026-09-10', inputTokens: 10, outputTokens: 2, cacheReadTokens: 100, cacheCreationTokens: 0, totalTokens: 112, costUSD: 1 };
  const current = { ...old, date: '2026-09-17' };
  const totals = Object.fromEntries(Object.entries(old).filter(([k]) => k !== 'date').map(([k, v]) => [k, v * 2]));
  const source = { daily: [old, current], totals };
  const reference = { tokens: [225, 224, 223], capturedAt: '2026-09-17T01:00:00Z' };
  const config = { timezone: 'America/Los_Angeles', population: 25000000, biasLow: 100, biasMedian: 1000, biasHigh: 10000 };
  const report = buildReport(source, reference, config, new Date('2026-09-18T03:00:00Z'));
  assert.equal(report.measurement.totals.totalTokens, 224);
  assert.equal(report.measurement.lastSevenDaysTokens, 112);
  assert.equal(report.reference.aboveCount, 1);
  assert.equal(report.measurement.today, '2026-09-17');
  assert.throws(() => buildReport({ ...source, daily: [old, old] }, reference, config));
  assert.throws(() => buildReport({ ...source, totals: { ...totals, totalTokens: 1 } }, reference, config));
});
