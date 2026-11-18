# موديول Scheduling (الجدولة)

> **إزاي تستخدميه:** افتحي الملف ده في الـ Preview (اضغطي `Ctrl+Shift+V`)، وبعدين `Ctrl+Click` على أي أمر، فبيتكتب لوحده في الترمنال المفتوح. اضغطي `Enter` عشان يشتغل.
> تحت كل أمر أمر تاني بنفس الشكل وفي آخره `--headed`، عشان تشوفي المتصفح وهو شغّال.
> لو الترمنال مش مفتوح افتحيه الأول (`` Ctrl+` ``) وشغّلي الأوامر من فولدر المشروع.

تنبيه: كل تست بيضيف أداة اسمها بيبدأ بـ `QA-` على الحساب الحقيقي بالـ API ويحذفها بعد كده (الأدوات الحقيقية مبتتلمسش).

## الفولدر كله (UI + API)
- [`npx playwright test modules/scheduling`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fscheduling%22%7D)
- [`npx playwright test modules/scheduling --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fscheduling%20--headed%22%7D)  ← مع فتح المتصفح (headed)

UI بس:
- [`npx playwright test modules/scheduling/ui --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fscheduling%2Fui%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/scheduling/ui --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fscheduling%2Fui%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

API بس:
- [`npx playwright test modules/scheduling/api --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fscheduling%2Fapi%20--project%3Dapi%22%7D)

## كل ملف لوحده

**schedule-group.spec.ts**
- [`npx playwright test modules/scheduling/ui/schedule-group.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fscheduling%2Fui%2Fschedule-group.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/scheduling/ui/schedule-group.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fscheduling%2Fui%2Fschedule-group.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**schedule-popup.spec.ts**
- [`npx playwright test modules/scheduling/ui/schedule-popup.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fscheduling%2Fui%2Fschedule-popup.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/scheduling/ui/schedule-popup.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fscheduling%2Fui%2Fschedule-popup.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**scheduling.spec.ts**
- [`npx playwright test modules/scheduling/ui/scheduling.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fscheduling%2Fui%2Fscheduling.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/scheduling/ui/scheduling.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fscheduling%2Fui%2Fscheduling.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**scheduling.api.spec.ts**
- [`npx playwright test modules/scheduling/api/scheduling.api.spec.ts --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fscheduling%2Fapi%2Fscheduling.api.spec.ts%20--project%3Dapi%22%7D)

