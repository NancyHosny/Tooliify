# Module tools

SRS: 10.8 Tools catalog · 10.9 Add a tool · 10.10 Delete a tool (and edit / switch on-off)
UI: `/ar/tools` (catalog) · `/ar/tools/<slug>` (builder) · `/ar/my-tools` ("أدواتي") · `/ar/my-tools/<slug>/<id>` (edit)
API: `/api/v1/merchant/tools…` (catalog, categories, my tools, configurations)

## Structure: one folder per tool

Each of the 33 tools has its own folder named by its slug, with the same 6 files:

```
modules/tools/<slug>/view.spec.ts     card, category tab, preview popup, builder page
                    /search.spec.ts   full / part of the name, spaces, inside the tab, wrong name
                    /add.spec.ts      save, shown as added, "رجوع", invalid name, invalid link
                    /edit.spec.ts     saved name, rename, invalid name, "رجوع", switch on/off popup
                    /delete.spec.ts   popup, "إغلاق", confirm, gone after reload
                    /store.spec.ts    the tool reaches the real store after add / edit / delete
```

The test cases are written ONCE in `tool-tests/*-tests.ts`; every spec file is 3 lines that call them with the data of its tool
(`test-data/test-data.ts`, list `toolList`). To change a test case for all tools, change it in `tool-tests/`.

Other folders: `catalog/` (whole catalog: tabs, badges, search, access, UI vs API) · `my-tools/` ("أدواتي" page) · `api/` (API tests)
· `pages/` and `clients/` (page objects and API clients).

## Run

```
npx playwright test modules/tools/cookies-consent --project=ui-merchant          one tool, all 5 parts
npx playwright test modules/tools/cookies-consent/add.spec.ts --project=ui-merchant   one part of one tool
npx playwright test modules/tools/cookies-consent/store.spec.ts --project=ui-merchant the store check of one tool
npx playwright test modules/tools --project=ui-merchant                          every tool (about 1000 tests, very long)
npx playwright test modules/tools/catalog                                        the catalog only (nothing is saved)
npm run test:tools:api                                                           the API tests
```

Add `--headed` to see the browser.

## Store check (store.spec.ts)

The store (a Salla demo store, see `store` in test-data.ts) loads a public file `files.tooliify.com/newtoolify_<merchant id>.js` and draws the active tools from it.
The file is rewritten a few seconds after every add / edit / delete.

Each store test types a unique value in one field of the builder (`storeField` of the tool in test-data.ts) and looks for it:

| Test | What it checks |
|---|---|
| added tool reaches the store file | the value is in the public file after add |
| added tool is shown on the store page | the store page itself contains the value (only tools drawn on page load: `shownOnLoad`) |
| edited tool updates the store file | the new value is in the file and the old one is gone |
| deleted tool is removed from the store file | the value is gone after delete |

Every tool now has a mapped field. Two tools use a number field (`storeKind: 'number'`): customer-reviews (`config.ratings_count`) and purchase-counter (`config.purchaseCount`). اشتري منتج keeps its message in a folded section ("الرسالة 1"), so its tool data has `storeSection` and the builder opens that section first.
The name of the tool is not written in the file, so the unique value is the way to find it.

## Coupon tools

كوبونات الخصم, الخصومات, عجلة الحظ and سيلز بلس need a discount coupon. The tests choose the real coupon of the account (`coupon` in test-data.ts, code TFY-K5ZZDFNA4N, active until 2027-01-31) in every "اختر كوبون الخصم" list. If the coupon expires or is deleted these four tools fail on save. Later the coupons module should create a coupon in the test instead.

## Tools with a real copy on the account

شارات الثقة, منتجات مشابهة and منتجات مقترحة معًا are already added (active) on the real account, and the API refuses a second ACTIVE copy in the same place.
So the QA copy is moved to another place (`position` in test-data.ts) and the real copies are never touched.
Because the card always says "مضافة بالفعل" for them, the two tests that look at that card are skipped (`realInstance`).
The two product tools also need one product group: the tests choose the first main product and the first free related product of the store.

## Tools that need extra data (all handled by the tests)

| Tool | What the test fills |
|---|---|
| اشتري منتج, إعلانات, القصص | the test image `test-data/qa-image.png` in every upload box (`image`); القصص also moves to the left side (`position`) because the right side is used by a real tool |
| التواصل | a link in every link field of the "الروابط" tab, the email one as `mailto:` (`socialLinks: 'all'`) |
| مغلق للصيانة | one social link ticked, with its link (`socialLinks: 'one'`) |
| كوبونات الخصم, الخصومات, عجلة الحظ, سيلز بلس | the real coupon (see "Coupon tools") |
| منتجات مشابهة, منتجات مقترحة معًا, شارات الثقة | another place in the store (see "Tools with a real copy") |

No tool is skipped for add / edit / delete any more, and every tool has a store check.

## How the real pages work (found while exploring)

- Save in the builder → `POST /tools/{id}/configurations` → redirect to `/ar/my-tools/<slug>/<id>`. Saving is slow on staging (8–25 s).
- Save in the edit page → `PATCH /tools/my/{id}/configurations` → toast "تم حفظ إعدادات الأداة بنجاح" → redirect to `/ar/my-tools`.
- Name rule: at least 2 characters. Link rule: "أدخل رابطًا صالحًا." Both are checked in the browser (no request is sent).
- Two ACTIVE tools cannot sit in the same place of the store: the API answers 422 `الأداة "<name>" مفعّلة بالفعل في نفس المكان`.
  So a tool left behind by a failed test can break the next test. The cleanup deletes every `QA-` tool after each test.
- The status switch in "أدواتي" opens a popup "الغاء تفعيل الاداة من المتجر" with "تأكيد" and "إغلاق".
- `GET /tools/my` returns only 2 tools per page. Use `per_page=100` to read the whole list (the API client does).
- Tabs filter on the client. The badge dropdown writes `?filter=` and the search writes `?search=` in the URL.

## Safety

- Every tool created by a test is named `QA-<slug>-<time>` and deleted after the test. Only names that start with `QA-` are deleted; real tools are never touched.
- Tools like "مغلق للصيانة" and "إخفاء من الإضافات" change the store while they are active. They live only a few seconds, but this is staging data.

## Defects found (tests left failing on purpose)

- Tab "كوبونات" shows "مغلق للصيانة / إخفاء من الإضافات / الكوكيز": it is really the API category 5 "أدوات عامة". The tab label is wrong (front-end).
- "إضافة الأداة" inside the preview popup does nothing (front-end). The same button on the card works.
- API without token: the catalog endpoints AND the my-tools endpoints return 500 (HTML page) instead of 401 when `Accept: application/json` is missing (back-end).
- `POST /tools/{id}/configurations` needs the full real config of the tool (for example `target_devices`, colours, margins); a short body gets 422 messages like "حقل لون النص مطلوب". The API test sends the full body copied from the browser.
- `GET /tools/my` returns 2 tools per page by default (UI shows all). Not a defect by itself, but easy to miss in API tests.

## Observations (not failed)

- Staging sometimes takes more than 30 s to open a page or to save a tool.
- In "أدواتي" the label next to the switch says "تفعيل" for an active tool and "إيقاف" for an inactive one (probably the action, not the state).
- Without a session the catalog HTML is rendered first and the redirect to login happens on the client (a visitor briefly sees the page).
- Searching with the English name (for example "whatsapp") returns nothing. Not asserted: the SRS does not say it must work.
