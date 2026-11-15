# Tooliify – Playwright Automation

Playwright + TypeScript automation for the Tooliify merchant dashboard (staging: `https://stg.tooliify.com`).

## 1. Requirements

- Node.js **20.12 or newer** (needed to read `.env` files without extra packages)
- Access to the staging site from your network

## 2. First-time setup

Explanation: install the project packages listed in `package.json`.

```bash
npm install
```

Explanation: download the Chromium browser that Playwright controls.

```bash
npx playwright install chromium
```

Explanation: create your private settings file from the template, then open `.env` and put the real email and password in it. `.env` is git-ignored and must never be committed.

```bash
cp .env.example .env
```

## 3. Running the tests

Explanation: **watch the browser live** while the UI tests run (opens a real Chrome window).

```bash
npm run test:headed
```

Explanation: open Playwright **UI Mode**. You can pick a test, run it, and replay every step with screenshots. This is the best option for reviewing the tests.

```bash
npm run test:ui-mode
```

Explanation: run only the smoke tests (`@smoke` tag).

```bash
npm run test:smoke
```

Explanation: run everything (UI + API) in the background.

```bash
npm test
```

Explanation: open the HTML report. Every UI test has a video recording in it.

```bash
npm run report
```

Explanation: if a locator fails, record the real elements by clicking through the page. Copy the generated locators into `modules/auth/pages/LoginPage.ts`.

```bash
npx playwright codegen https://stg.tooliify.com/ar/auth
```

## 4. Structure

```text
modules/
  auth/                              Authentication module (login, forgot password, logout, access control)
  profile/                           Profile module (view data, phone, change password)
  tools/                             Tools module: one folder per tool (view, search, add, edit, delete) + catalog/ my-tools/ api/
  shared/                            Bug capture fixture, terminal reporter, global setup
  <next-module>/                     Same layout: pages/ clients/ ui/ api/
test-data/test-data.ts               ALL test data, paths and credentials (read from .env)
playwright.config.ts                 Configuration (1 worker, video on, Asia/Riyadh time zone)
```

Adding a module: create `modules/<name>/` with `ui/*.spec.ts` and/or `api/*.spec.ts`. The config picks them up automatically.
Run one module: `npm run test:auth`, `npm run test:profile`, `npm run test:tools` (add `:headed` to watch the browser).
Every run command (a whole folder, then each file alone, for every module and every tool) is in [run-commands/](run-commands/README.md).
Run one tool: `npx playwright test modules/tools/<tool-folder> --project=ui-merchant --headed` (see modules/tools/README.md).

## 5. Safety notes

- SRS 10.2 locks an account after **5 failed logins in 15 minutes**. Only the "wrong password" login test uses the real email with a wrong password, which is 1 failed attempt per run. Do not run the suite more than 3 times within 15 minutes.
- The lockout test itself is **not automated** because it would lock the only test account. A dedicated account is needed for it.

## 6. Coverage

See `modules/auth/README.md`.

