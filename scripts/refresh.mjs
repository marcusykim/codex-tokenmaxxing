import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildReport } from './report.mjs';

const root = new URL('../', import.meta.url);
const config = JSON.parse(readFileSync(new URL('site.config.json', root)));
const reference = JSON.parse(readFileSync(new URL('public/reference.json', root)));
const index = process.argv.indexOf('--input');
const raw = index >= 0 ? readFileSync(process.argv[index + 1], 'utf8') : execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['--yes', `ccusage@${config.pricingToolVersion}`, 'codex', 'daily', '--json', '--timezone', config.timezone], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 240000 });
const report = buildReport(JSON.parse(raw), reference, config);
const target = fileURLToPath(new URL('public/data.json', root));
writeFileSync(`${target}.tmp`, JSON.stringify(report, null, 2) + '\n');
renameSync(`${target}.tmp`, target);
console.log(JSON.stringify({ capturedAt: report.capturedAt, tokens: report.measurement.totals.totalTokens, model: report.model }));
