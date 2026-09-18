import { estimate } from '../public/model.js';

export function buildReport(source, reference, config, now = new Date()) {
  if (!source.daily?.length || !reference.tokens?.length) throw new Error('Usage and reference data are required.');
  const seen = new Set();
  const fields = ['inputTokens', 'outputTokens', 'cacheReadTokens', 'cacheCreationTokens', 'totalTokens', 'costUSD'];
  const daily = source.daily.map(row => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || seen.has(row.date)) throw new Error('Invalid or duplicate date.');
    seen.add(row.date);
    const clean = { date: row.date };
    for (const field of fields) {
      if (!Number.isFinite(row[field]) || row[field] < 0) throw new Error(`Invalid ${field}.`);
      clean[field] = row[field];
    }
    if (clean.totalTokens !== clean.inputTokens + clean.outputTokens + clean.cacheReadTokens + clean.cacheCreationTokens) throw new Error('Token components do not sum.');
    return clean;
  }).sort((a, b) => a.date.localeCompare(b.date));
  const totals = Object.fromEntries(fields.map(field => [field, daily.reduce((sum, day) => sum + day[field], 0)]));
  for (const field of fields) if (!Number.isFinite(source.totals?.[field]) || Math.abs(totals[field] - source.totals[field]) > 0.0001) throw new Error(`Source total mismatch: ${field}.`);
  if (reference.tokens.some(n => !Number.isSafeInteger(n) || n < 0)) throw new Error('Invalid sample tokens.');
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: config.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const cutoff = new Date(`${today}T12:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - 6);
  const since = cutoff.toISOString().slice(0, 10);
  const best = daily.reduce((a, b) => a.totalTokens >= b.totalTokens ? a : b);
  const aboveCount = reference.tokens.filter(n => n > totals.totalTokens).length;
  const share = aboveCount / reference.tokens.length;
  return {
    schemaVersion: 1, capturedAt: now.toISOString(), timezone: config.timezone,
    owner: { name: config.name, repository: config.repository, website: config.website, tipUrl: config.tipUrl || null },
    measurement: { source: `ccusage@${config.pricingToolVersion} codex daily`, scope: 'Local recorded Codex usage; cached input included; reasoning included in output.', firstDate: daily[0].date, lastDate: daily.at(-1).date, activeDays: daily.filter(d => d.totalTokens > 0).length, totals, today, todayTokens: daily.find(d => d.date === today)?.totalTokens ?? 0, lastSevenDaysTokens: daily.filter(d => d.date >= since && d.date <= today).reduce((s, d) => s + d.totalTokens, 0), bestDay: best.date, bestDayTokens: best.totalTokens, daily },
    reference: { source: reference.source, api: reference.api, capturedAt: reference.capturedAt, scope: reference.scope, sampleSize: reference.tokens.length, aboveCount, shareAbove: share },
    model: { population: config.population, biasLow: config.biasLow, biasMedian: config.biasMedian, biasHigh: config.biasHigh, prior: 'Subjective log-uniform selection ratio; endpoints are a scenario envelope, not a confidence interval.', formula: 'q = p / (B * (1 - p) + p); rank = 1 + floor((N - 1) * q)', assumptions: 'Population size, selection ratios, and comparability of the volunteer all-tool sample are unvalidated. This is not an official rank or an empirical probability forecast.', ...estimate(share, config) }
  };
}
