# Dashboard module (لوحة التحكم)

Page: `/ar/dashboard` (and `/en/dashboard`). API: tag "Tool Statistics" (`GET /merchant/statistics`, `GET /merchant/tools/my/{id}/statistics`, `POST /tracking/events`).

## Structure

```
modules/dashboard/
  clients/StatisticsClient.ts          dashboard, one tool, track (waits for a free slot, retries on 429)
  clients/rate-limit.ts                the 10-requests-per-minute limit shared by the UI and API tests
  pages/DashboardPage.ts               banner, 3 cards, active tools, top tools, chart, sidebar / header buttons
  ui/dashboard.spec.ts                 title, subscription banner, 3 cards, active tools, top tools, chart, "عرض الكل"
  ui/dashboard-controls.spec.ts        sidebar links, theme, language, collapse, visitor without login
  ui/dashboard-data.spec.ts            a QA tool with tracked clicks / visits shows up in the API and on the page (slow, see below)
  api/statistics.api.spec.ts           dashboard + one tool: shape, consistency, date filters (valid / invalid), 404 / 403, token
  api/tracking.api.spec.ts             POST /tracking/events: valid, unknown tool, 12 invalid bodies
```

All data (texts, date filters, tracking bodies, API keys) is in section 14 of `test-data/test-data.ts`.

## How the tests work

- The page tests open the dashboard ONCE per test and compare what is on the screen with what the server sent to the page itself (statistics + subscription), so they do not spend extra requests.
- The statistics endpoints answer **429 after 10 requests in a minute** (the page uses one request for every open). `rate-limit.ts` keeps all tests under 9 per minute, so the module takes a few minutes to run (the API spec alone is about 2 minutes). Do not run other statistics calls at the same time.
- The data test (`dashboard-data.spec.ts`) adds a QA tool (name starts with `QA-`) through the API, sends 3 clicks and 5 visits with `POST /tracking/events` (no token needed, like the store does) and deletes the tool afterwards. Real tools are never touched.
  The totals and the one-tool statistics update after a few seconds, but the tool cards and the "top tools" list of the dashboard can stay on 0 for up to about **5 minutes** (the server caches the numbers of the tools), so this test waits up to 6 minutes. Skip it with `--grep-invert "tracked"` when you are in a hurry.

## Run

```
npm run test:dashboard            all (UI + API)
npm run test:dashboard:headed     UI with the browser visible
npx playwright test modules/dashboard/api --project=api
npx playwright test modules/dashboard/ui --project=ui-merchant
```

## Defects found (tests that fail on purpose)

| Test | What is wrong | Side |
|---|---|---|
| activity chart shows every day returned by the API | The API returns the whole week so far (today: Saturday, Sunday, Monday, Tuesday) but the chart draws only the last 3 days: the first day (السبت) has no label and no point | Front-end |
| statistics endpoints without token return 401 | 500 (HTML page) instead of 401 when the request has no `Accept: application/json` header (same as the other modules) | Back-end |
| statistics endpoints with a fake token return 401 | Same: 500 instead of 401 | Back-end |

## Observations (not failed)

- The tool cards and the "top tools" list lag behind the totals (see above): the totals say 3 clicks / 5 visits while the card of the tool says 0 / 0 for several minutes.
- The y axis of the chart is fixed (200 … 1000) even when all values are 0 or small.
- The text "N تفاعل" in the "top tools" list is cut off on a normal screen width.
- Validation messages of `POST /tracking/events` mix Arabic and English words ("عداد clicks مطلوب").
- A tool created today has 100% change (the previous week had no data), and the "active tools" card shows the change as a percentage of tools (33.33% for 3 → 4 tools).
