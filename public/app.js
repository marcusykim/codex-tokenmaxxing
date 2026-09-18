import { scenarioRank, roundedRank } from './model.js';
const byId = id => document.getElementById(id);
const number = value => new Intl.NumberFormat('en-US').format(value);
const compact = value => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value);
const rank = value => '#' + number(roundedRank(value));
let report;
function sandbox() {
  if (!report) return;
  const bias = 10 ** Number(byId('bias').value);
  const result = scenarioRank(report.reference.shareAbove, report.model.population, bias);
  byId('bias-value').textContent = number(Math.round(bias)) + '×';
  byId('sandbox-rank').textContent = rank(result);
  byId('sandbox-top').textContent = 'SCENARIO TOP ' + (100 * result / report.model.population).toFixed(3) + '% · ASSUMED POPULATION';
}
function render(data) {
  report = data;
  const m = data.measurement;
  const formattedTime = new Intl.DateTimeFormat('en-US', { timeZone: data.timezone, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(data.capturedAt));
  byId('updated').textContent = (Date.now() - Date.parse(data.capturedAt) > 7200000 ? 'OLDER SNAPSHOT / ' : 'SNAPSHOT / ') + formattedTime;
  byId('median-rank').textContent = number(roundedRank(data.model.median));
  byId('rank-low').textContent = rank(data.model.optimistic);
  byId('rank-high').textContent = rank(data.model.conservative);
  byId('population').textContent = number(data.model.population / 1000000) + ' million';
  for (const [id, val] of Object.entries({ 'total-tokens': m.totals.totalTokens, 'week-tokens': m.lastSevenDaysTokens, 'today-tokens': m.todayTokens, 'best-tokens': m.bestDayTokens })) {
    byId(id).textContent = compact(val);
    byId(id).title = number(val) + ' tokens';
  }
  byId('active-days').textContent = number(m.activeDays) + ' active days · since ' + m.firstDate;
  byId('today-date').textContent = m.today + ' · Pacific time';
  byId('best-date').textContent = m.bestDay;
  byId('cache-share').textContent = (m.totals.totalTokens ? 100 * m.totals.cacheReadTokens / m.totals.totalTokens : 0).toFixed(1) + '%';
  byId('cost').textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m.totals.costUSD) + ' API equivalent · not a bill';
  byId('above-count').textContent = number(data.reference.aboveCount);
  byId('sample-count').textContent = number(data.reference.sampleSize);
  byId('sample-date').textContent = 'REFERENCE SNAPSHOT / ' + new Date(data.reference.capturedAt).toISOString().replace('T', ' ').slice(0, 16) + ' UTC. Usage snapshot / ' + formattedTime + '.';
  for (const id of ['repo-top', 'repo-bottom']) byId(id).href = data.owner.repository;
  const tip = byId('tip-button');
  if (tip && data.owner.tipUrl) { tip.href = data.owner.tipUrl; tip.removeAttribute('aria-disabled'); }
  const daily = new Map(m.daily.map(d => [d.date, d]));
  const days = [];
  for (let ago = 29; ago >= 0; ago--) {
    const date = new Date(m.today + 'T12:00:00Z'); date.setUTCDate(date.getUTCDate() - ago);
    const key = date.toISOString().slice(0, 10);
    days.push(daily.get(key) || { date: key, totalTokens: 0, cacheReadTokens: 0 });
  }
  const max = Math.max(...days.map(d => d.totalTokens), 1);
  byId('chart-max').textContent = 'SCALE: 0–' + compact(max) + ' TOKENS / DAY';
  byId('chart').replaceChildren(...days.map(day => {
    const bar = document.createElement('span'); bar.className = 'bar'; bar.tabIndex = 0; bar.setAttribute('role', 'img');
    const label = day.date + ': ' + number(day.totalTokens) + ' tokens; ' + number(day.cacheReadTokens) + ' cached input.';
    bar.setAttribute('aria-label', label);
    bar.style.setProperty('--height', (100 * day.totalTokens / max) + '%');
    const fresh = document.createElement('span'); fresh.className = 'bar-fresh';
    fresh.style.setProperty('--fresh', (day.totalTokens ? 100 * (day.totalTokens - day.cacheReadTokens) / day.totalTokens : 0) + '%');
    bar.append(fresh);
    const tooltip = document.createElement('span'); tooltip.className = 'bar-tip'; tooltip.textContent = day.date + ' / ' + compact(day.totalTokens) + ' tokens';
    bar.append(tooltip); return bar;
  }));
  byId('chart-start').textContent = days[0].date;
  byId('chart-end').textContent = days.at(-1).date;
  sandbox();
}
async function load() {
  try {
    const response = await fetch('/data.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Data unavailable');
    const data = await response.json();
    if (data.schemaVersion !== 1 || !Number.isFinite(data.model?.median)) throw new Error('Invalid report');
    render(data); byId('load-error').hidden = true;
  } catch { byId('load-error').hidden = false; }
}
byId('bias').addEventListener('input', sandbox);
byId('reset').addEventListener('click', () => { byId('bias').value = 3; sandbox(); });
byId('retry').addEventListener('click', load);
load();
setInterval(load, 60000);
