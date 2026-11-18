# Storefront module (المتجر)

What the visitors of the merchant's store use: the public store file, the Tooliify script inside the store page, and the public API calls the script sends.
Store: a Salla demo store (`store` in `test-data/test-data.ts`). Public file: `files.tooliify.com/newtoolify_<merchant id>.js`.
API (public, no token): `POST /tracking/tools/{id}`, `POST /customer-reviews`, `POST /automatic-coupons` (and `POST /tracking/events`, tested in the dashboard module).

What the module does NOT test: "العملاء" (customers) is out of scope, so `POST /customers` is skipped. A successful `POST /automatic-coupons` creates a real coupon on the Salla store, so only its error cases are tested.
The "tool reaches the store after add / edit / delete" checks already live in `modules/tools/<tool>/store.spec.ts`.

## Structure

```
modules/storefront/
  clients/StorefrontClient.ts       track one event, submit a review, issue an automatic coupon (sends Accept: application/json like the store script)
  clients/qa-store-tools.ts         QA tools through the API: cookies tool with a marker in its title, reviews tool, clients bundle
  ui/store-journey.spec.ts          the merchant works in the Tooliify UI (add / stop / delete a cookies tool), then the real store is checked
  ui/store-page.spec.ts             the store page: script loads, loaded once, no script errors
  ui/store-tracking.spec.ts         hover / click in the store reach the server and the tool statistics
  ui/store-states.spec.ts           stopped / scheduled tool and the store file (slow)
  api/store-file.api.spec.ts        the public file: public, JavaScript, content, unknown merchant
  api/storefront.api.spec.ts        tracking events, stopped tool, reviews (valid / invalid / image / HTML), automatic coupon errors
```

All data (events, reviews, bodies, texts) is in section 15 of `test-data/test-data.ts`.

## How the tests work

- Every tool is a QA tool (name starts with `QA-`) added through the API and deleted after the tests. Real tools are never touched.
- The cookies tool gets a unique marker in its title (`config.title`), so the tests can find it in the public store file. The store file is rewritten a few seconds after every change.
- Tools like cookies and customer reviews do NOT allow a second copy: adding them again returns the same tool. So tests that stop a tool create their own tool and delete it afterwards.
- The store sends visits to the server after about 10 seconds, only when the visitor hovers over or clicks the tool (opening the page alone sends nothing).
- `toolFresh()` asks the tool statistics with a different date range every time, because the server keeps the answer of a range for a few minutes.

## Run

```
npm run test:storefront            all (UI + API)
npm run test:storefront:headed     UI with the browser visible
npx playwright test modules/storefront/api --project=api
npx playwright test modules/storefront/ui --project=ui-merchant
```

`store-states.spec.ts` waits for the store file (about 20 seconds per change, 4 minutes for the schedule test). Skip it with `--grep-invert "reaches the store file"`.

## Defects found (tests that fail on purpose)

| Test | What is wrong | Side |
|---|---|---|
| store page includes the Tooliify script only once | The store page has 3 `<script>` tags for the same file (`newtoolify_….js`), so the script runs 3 times | Back-end / integration |
| store page runs the Tooliify script without errors | JavaScript errors in the store page: `Identifier 'a0i7' has already been declared` and `Cannot read properties of undefined (reading 'hIEtZ')` | Front-end (script) |
| a review comment with HTML code is not stored as it is | `comment: <img src=x onerror="alert(1)"> QA` is stored and returned exactly as sent (no cleaning). It is shown to store visitors, so the widget must escape it; not confirmed in the store | Back-end (security) |
| a tool whose schedule has started is in the store file | The API says the schedule is "active" (`schedule_status`), but the tool does not reach the store file: in 5 of 6 runs it was still missing 4–5 minutes after the start (even after another change rewrote the file); it appeared in one run only. The file seems to be refreshed by a periodic job, not at the start time. A tool scheduled for the future is correctly absent | Back-end |

## Observations (not failed)

- Only hover and click are tracked: a visit alone sends nothing, so "إجمالي المرور" is really "hovers".
- Validation messages of the public endpoints are in English ("The rating field must be at least 1."), while other messages are Arabic. `POST /automatic-coupons` answers "coupon reward is not available" in a different shape (`message` / `errors`, no `key`).
- Without `Accept: application/json` that error comes back as an HTML page with status 200 (the same missing-header problem that makes the merchant endpoints answer 500 instead of 401). The tests send the header, like the store script does.
- Uploading a review image takes about 30 seconds (external storage).
- The demo store itself shows a "المتجر قيد الصيانة" banner. It is Salla's own component (`salla-maintenance-alert`), not Tooliify.
