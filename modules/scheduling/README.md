# Scheduling module (الجدولة)

Page: `/ar/scheduling`. API: tag "Tool Scheduling" (3 endpoints).

## Structure

```
modules/scheduling/
  clients/SchedulingClient.ts   one method per endpoint (list, set one, set group)
  clients/qa-tools.ts           adds / deletes the QA tools through the API (login, addQaTool, deleteQaTools)
  pages/SchedulingPage.ts       the page: rows, search, group panel, calendar helper
  pages/ScheduleModal.ts        the "اعدادات الجدولة" popup of one tool
  ui/scheduling.spec.ts         the list: view, count, search, scheduled status, empty state, access
  ui/schedule-popup.spec.ts     the popup of one tool: open, switch, calendar, save, clear
  ui/schedule-group.spec.ts     the group panel: select tools, calendar, valid schedule
  api/scheduling.api.spec.ts    list + filters, set / clear one, group, invalid bodies, no token
```

All data (dates, invalid bodies, texts, API messages) is in section 11 of `test-data/test-data.ts`.

## How the tests work

- The scheduling page only lists tools that support scheduling. The 4 real tools of the account (شارات الثقة, منتجات مقترحة معًا, منتجات مشابهة) are **not** shown there.
- Every test adds a QA tool (the cookies tool, name starts with `QA-`) through the API and deletes it afterwards, so the real tools are never touched.
- The date fields are calendars: `pickDate()` opens the calendar, goes to the next month and clicks a day (so the date is always in the future).

## Run

```
npm run test:scheduling            all (UI + API)
npm run test:scheduling:headed     UI with the browser visible
npx playwright test modules/scheduling/api --project=api
npx playwright test modules/scheduling/ui --project=ui-merchant
```

## Defects found (tests that fail on purpose)

| Test | What is wrong | Side |
|---|---|---|
| popup › start date field opens a calendar | The date fields in the "اعدادات الجدولة" popup of a single tool do not open the calendar, so a schedule cannot be set from there. The same field works in the group panel. | Front-end |
| group › valid group schedule saves | "جدولة المحدد" sends `start_at` as `2026-11-28T08:00:00.000000Z`; the API refuses it with 422 "يجب إدخال التاريخ والوقت بالتنسيق YYYY-MM-DD HH:mm", so the UI cannot schedule anything. | Front-end (the date format it sends) |
| API › clearing the schedule makes the tool not scheduled again | After clearing, the API answers `is_schedule: false` but keeps the old `start_at` / `end_at` in `schedule`. The popup itself says that clearing "يتم الغاء الاعدادات الخاصة بها". | Back-end |
| popup › turning the switch off and confirming clears the schedule | Because the old dates are kept, the page (even after a reload) still shows `مجدولة (غير نشطة) 2030-1-10 إلى 2030-1-20` for a tool the API calls "غير مجدولة". | Back-end data, shown wrongly by the Front-end |
| list › scheduled status in the page matches the API status | A tool scheduled to start in 2030 is shown as `مجدولة (نشطة)`; the API says `schedule_status: pending` / "غير نشطة". | Front-end |
| API › endpoints without token / with a fake token return 401 | An empty or fake token returns 500 instead of 401 when `Accept: application/json` is missing (the same defect as the tools catalog, my-tools and coupons). | Back-end |

## Observations (not tests)

- Some validation messages come in English although `Accept-Language: ar` is sent ("The is schedule field is required.", "The selected filter.schedule status is invalid.").
- The popup times are shown 3 hours later than the time sent to the API (the API reads `10:00` as UTC, the browser shows Riyadh time).
- Turning the switch off in the popup asks for a confirmation ("هل انت متاكد من الغاء تفعيل الجدولة") before anything is sent.
