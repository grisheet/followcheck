# FollowCheck

**Your circle, a little clearer.** A private Instagram follower checker that runs entirely in your browser.

Upload your Instagram followers and following JSON exports to see who doesn't follow you back, who you don't follow back, and your mutual connections. No Instagram login, API, scraping, backend, database, analytics, or API keys.

## Features

- Multiple follower files, merged and deduplicated case-insensitively.
- Drag-and-drop and keyboard-accessible file selection, individual removal, parsing feedback, and helpful errors.
- Five summary counts and searchable account lists with A–Z / Z–A sorting.
- Copy usernames, safely open Instagram profiles, and start over to discard results.
- Dark responsive design, reduced-motion support, keyboard-operated tabs, and 100-row pagination for large lists.
- Resilient parsing of common arrays, relationship wrappers, and nested JSON exports.
- Automated parser, comparison, and full UI journey tests; GitHub Actions deployment.

## Privacy

Files are read with the browser's File API and kept only in React memory. No file contents or usernames are sent to a server. No browser storage, cookies, remote fonts, third-party scripts, or telemetry are used. Refreshing, closing the tab, or clicking **Start Over** discards the application's in-memory data. This does not delete the original files on your device.

The production Content Security Policy blocks fetch/XHR/WebSocket connections (`connect-src 'none'`). The static hosting provider still receives ordinary page and asset requests. Opening a profile intentionally navigates to Instagram in a new tab, and the copy button intentionally writes the selected username to your clipboard.

## Run locally

Use Node.js **22.12+** (Node 22 LTS recommended) and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, including `/followcheck/`. No `.env` file or service account is needed.

```bash
npm test          # parser, set operations, and UI interaction tests
npm run check    # strict TypeScript check
npm run build    # TypeScript check + production assets in dist/
npm run preview  # serve the production build locally
```

The committed lockfile makes CI reproducible with `npm ci`.

## GitHub Pages

Deployment is gated to public repositories; private repositories still run the build and tests. After explicitly choosing public visibility and configuring Pages, run the workflow manually.

1. Create a GitHub repository named **followcheck** and push this project's source to its `main` branch.
2. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the publishing source.
3. Push to `main` or run **Verify and deploy FollowCheck** manually from the Actions tab. The workflow installs dependencies, runs tests, builds, and publishes **only `dist/`**.
4. Open the deployment URL reported by GitHub Pages.

### Vite base path

In `vite.config.ts`, `base` is set to **`'/followcheck/'`**, matching a project deployment at `https://USERNAME.github.io/followcheck/`.

If you rename the repository, change it to **`'/YOUR-REPOSITORY-NAME/'`** before rebuilding. For a custom domain or a `USERNAME.github.io` repository, use **`'/'`**. A wrong base path causes missing JavaScript/CSS or a blank page. Do not publish the source root or mix compiled assets into it.

Reference: [Vite's official static deployment guide](https://vite.dev/guide/static-deploy#github-pages).

## Get your Instagram files

Instagram's menu labels and export layouts may change:

1. Open Instagram settings or Accounts Center and find the option to export/download your information.
2. Select the correct Instagram profile and its **followers and following** information. Choose **JSON**, not HTML, and **All time** for the most complete snapshot.
3. Download the archive when Instagram makes it available and extract the ZIP on your device.
4. Look for `followers_1.json`, additional numbered follower files, and `following.json`. They are often in `connections/followers_and_following/`.
5. Add **all** follower parts to Followers and the following file to Following. Use files from the same export, then compare.

Each file must be JSON and no larger than 25 MB. Following also accepts multiple files. Files are added to the selection; remove an old file before replacing it. Errors block comparison until the problem file is removed or replaced.

## What the comparison means

| Result | Operation |
| --- | --- |
| Don't Follow Back | following − followers |
| You Don't Follow Back | followers − following |
| Mutuals | following ∩ followers |

Usernames are trimmed, stripped of a leading `@`, and lowercased for comparison. A clean display name is retained. Parsing prioritizes `string_list_data[].value`, then a valid record title, then a verified Instagram profile URL. Arbitrary metadata strings are not treated as usernames. Unsupported relationship categories are skipped. Malformed records are ignored with a visible warning when identifiable.

A known empty relationship wrapper is accepted; an ambiguous bare `[]` is rejected because it contains no evidence of an account export. Unknown layouts with no likely usernames show an error instead of quietly returning zero. Filenames are hints, not proof: unwrapped arrays cannot always be distinguished as followers versus following.

## Limitations

This compares **export snapshots**, not Instagram's current state. Partial exports, missing follower parts, different export dates, renamed accounts, or a limited date range can change the results. It cannot identify blocked, private, deleted, deactivated, or previously-following accounts, and does not perform any follow/unfollow actions. Extremely large files may briefly pause parsing; file size is capped to bound resource use. No app can infer the missing records from an incomplete export.

## Project structure

```text
src/
  components/       Upload cards, results, tabs, account lists, and page sections
  hooks/            Local file-selection and parsing state
  lib/              Instagram parser and set comparison utilities
  types/            Typed accounts, uploads, and comparison results
  App.tsx           Upload-to-results flow
  index.css         Responsive design and accessibility states
  main.tsx          React entry
samples/            Synthetic example exports (no real user data)
tests/              Parser and user-journey tests
.github/workflows/  Build, test, and GitHub Pages deployment
```

Built with React, TypeScript, Vite, Tailwind CSS, and Lucide React. Not affiliated with Instagram or Meta.
