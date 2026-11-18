# Coupons module (الكوبونات)

Pages: `/ar/coupons` (list), `/ar/coupons/new` (new coupon), `/ar/coupons/<id>` (edit). API: tag "Coupons" (8 endpoints).

## Structure

```
modules/coupons/
  clients/CouponsClient.ts     one method per endpoint (list, selectable list, generate code, create, show, update, status, delete)
  clients/qa-coupons.ts        creates / deletes the QA coupons through the API (createCouponsClient, addQaCoupon, deleteQaCoupons)
  pages/CouponsPage.ts         the list: search, filters, rows, row buttons, confirm popups
  pages/CouponFormPage.ts      the new / edit form, the calendar helper (pickDate)
  ui/coupons.spec.ts           the list: view, count, search, filters, page size, copy, access
  ui/coupon-form.spec.ts       new coupon (valid / invalid) and edit coupon
  ui/coupon-actions.spec.ts    stop / activate popup and delete popup
  api/coupons.api.spec.ts      list + filters, generate code, create (valid / invalid), show, update, status, delete, token
```

All data (bodies, invalid bodies, texts, API keys and messages) is in section 12 of `test-data/test-data.ts`.
The login token is fetched once per worker (`modules/shared/merchant-token.ts`): the server answers 429 when every test logs in again.

## How the tests work

- Coupons are created on the REAL store (Salla). Every test creates its own coupon with a name that starts with `QA-` (through the API) and deletes it afterwards.
- The cleanup deletes only coupons whose name starts with `QA-`. The real coupons of the account, and `TFY-K5ZZDFNA4N` (used by the coupon tools), are never touched.
- The date fields are calendars: `pickDate()` goes to the next month and clicks a day, so the date is always in the future (a new coupon starts as "مجدول").

## Run

```
npm run test:coupons            all (UI + API)
npm run test:coupons:headed     UI with the browser visible
npx playwright test modules/coupons/api --project=api
npx playwright test modules/coupons/ui --project=ui-merchant
```

## Defects found (tests that fail on purpose)

| Test | What is wrong | Side |
|---|---|---|
| list › status filter options are not repeated | The status filter shows "مكتمل الاستخدام" twice (7 options, 6 different). | Front-end |
| API › status filter rejects an unknown value | `filter[status]=zzz` returns 200 and ignores the filter, although the OpenAPI lists the allowed values (scheduling answers 422 for the same case). | Back-end |
| API › coupons endpoints with empty / fake token return 401 | All 8 endpoints answer 500 instead of 401 when the request has no `Accept: application/json` header (with the header they answer 401). Same defect as the tools catalog and my-tools. | Back-end |

## Observations (not tests)

- A new coupon starts with `1` in the number fields (users, uses per customer, minimum purchase, maximum discount). A 15% coupon saved with the defaults is therefore capped at a maximum discount of 1.
- Many validation messages of the API come in English although `Accept-Language: ar` is sent ("The name field must be at least 2 characters.", "The selected type is invalid.").
- The copy button works only when the browser allows the clipboard; otherwise the page shows "تعذر نسخ رمز الكوبون، حاول مرة أخرى."
- A coupon that has not started yet is `مجدول` and the API refuses to activate it ("لا يمكن تفعيل كوبون مجدول او منتهي الصلاحية أو مكتمل الاستخدام.").
- A code sent without `TFY-` is saved with the prefix.
