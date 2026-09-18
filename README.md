# Codex Tokenmaxxing

A black, monochrome personal Codex usage dashboard with a transparent, assumption-based world-rank calculator. Live example: [Marcus Kim's dashboard](https://marcus-codex-tokenmaxxing.web.app).

The counts are measured from local logs; the global ranking is speculative. Read [the methodology and sources](docs/METHODOLOGY.md) before interpreting any rank. The initial report is Marcus's public aggregate snapshot; replace it before publishing your own copy.

## Run your own

Requires Node.js 22 or newer and local Codex usage logs.

1. Fork or clone this repository.
2. Edit `site.config.json` with your name, repository, website, timezone, and model assumptions. Edit the page title and owner copy in `public/index.html` to match. No account or secret is needed to run locally.
3. Run `npm run refresh`. This runs pinned `ccusage@20.0.22 codex daily` locally. It never uploads raw sessions. Only normalized dated aggregate usage is written to `public/data.json`.
4. Run `npm test` and `npm run check`, then `npm run dev`. Open `http://127.0.0.1:4173`.

To import an existing ccusage daily JSON export: `node scripts/refresh.mjs --input /path/to/your-report.json`.

## Free Firebase Hosting

Install the Firebase CLI following [Firebase's official guide](https://firebase.google.com/docs/cli), sign in with `firebase login`, and create/select your own Firebase project on the no-cost Spark plan. No billing, database, server function, or private API key is required by this static site.

```
firebase projects:create YOUR-UNIQUE-PROJECT-ID
firebase deploy --only hosting --project YOUR-UNIQUE-PROJECT-ID
```

Firebase provides `YOUR-UNIQUE-PROJECT-ID.web.app`. Stay within its no-cost quotas; this repository does not enable billing or promise unlimited traffic. Authentication is managed by the CLI on your machine. Never commit credentials, raw session files, or CLI debug logs. `.firebaserc` is ignored to keep your account target local. The `public/` directory is the only deployable artifact.

## Architecture

Static HTML, CSS, and native JavaScript modules; no application dependencies or build step. The UI fetches `data.json`, shows the fixed sample date, and lets readers explore selection-bias assumptions. The mascot is original AI-generated artwork. Fonts are Barlow Condensed, IBM Plex Mono, and Inter from Google Fonts.

`public/reference.json` contains a dated complete numeric Tokscale reference sample. It is not continuously synchronized, Codex-only, or representative of the population. A fork must preserve source attribution and limitations if it uses this dataset or model.

The example owner's hourly refresh/deploy/X posting is private operational configuration and is not installed by this repository. Deploying a fork does not transmit usage to Marcus or automatically publish posts. The [community leaderboard](TODO.md) remains a planned feature. An optional Buy Me a Coffee profile link is supported.

To enable the optional tip button, set `tipUrl` in `site.config.json` to your actual `https://buymeacoffee.com/YOUR_HANDLE` profile and run `npm run refresh` before deploying. The button stays hidden until a valid profile URL is configured. Verify that the profile belongs to you. Complete Buy Me a Coffee payout setup before expecting paid support.

## License

Code and original project assets: MIT. Referenced leaderboard data is attributed to its originating service; this repository cannot grant rights to third-party material beyond those held by its providers.
