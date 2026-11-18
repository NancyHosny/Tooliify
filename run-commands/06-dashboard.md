# موديول Dashboard (لوحة التحكم)

> **إزاي تستخدميه:** افتحي الملف ده في الـ Preview (اضغطي `Ctrl+Shift+V`)، وبعدين `Ctrl+Click` على أي أمر، فبيتكتب لوحده في الترمنال المفتوح. اضغطي `Enter` عشان يشتغل.
> تحت كل أمر أمر تاني بنفس الشكل وفي آخره `--headed`، عشان تشوفي المتصفح وهو شغّال.
> لو الترمنال مش مفتوح افتحيه الأول (`` Ctrl+` ``) وشغّلي الأوامر من فولدر المشروع.

تنبيه 1: إحصائيات لوحة التحكم الـ API بتاعها بيسمح بـ 10 طلبات بس في الدقيقة، فالتستات بتستنى بين الطلبات (الموديول كله بياخد حوالي 12 دقيقة). متشغّليش حاجة تانية بتفتح لوحة التحكم في نفس الوقت.

تنبيه 2: تست `dashboard-data.spec.ts` بيضيف أداة QA بالـ API (اسمها بيبدأ بـ `QA-`) ويسجّل عليها نقرات ومرور ويحذفها بعد كده، وأدواتك الحقيقية مبتتلمسش. هو بيستنى لحد 6 دقايق لأن كروت الأدوات في لوحة التحكم بتتأخر.

## الفولدر كله (UI + API)
- [`npx playwright test modules/dashboard`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%22%7D)
- [`npx playwright test modules/dashboard --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%20--headed%22%7D)  ← مع فتح المتصفح (headed)

من غير التست البطيء (تفاعلات الأداة):
- [`npx playwright test modules/dashboard --grep-invert "tracked"`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%20--grep-invert%20%5C%22tracked%5C%22%22%7D)

UI بس:
- [`npx playwright test modules/dashboard/ui --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%2Fui%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/dashboard/ui --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%2Fui%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

API بس:
- [`npx playwright test modules/dashboard/api --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%2Fapi%20--project%3Dapi%22%7D)

## كل ملف لوحده

**dashboard-controls.spec.ts**
- [`npx playwright test modules/dashboard/ui/dashboard-controls.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%2Fui%2Fdashboard-controls.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/dashboard/ui/dashboard-controls.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%2Fui%2Fdashboard-controls.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**dashboard-data.spec.ts**
- [`npx playwright test modules/dashboard/ui/dashboard-data.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%2Fui%2Fdashboard-data.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/dashboard/ui/dashboard-data.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%2Fui%2Fdashboard-data.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**dashboard.spec.ts**
- [`npx playwright test modules/dashboard/ui/dashboard.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%2Fui%2Fdashboard.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/dashboard/ui/dashboard.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%2Fui%2Fdashboard.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**statistics.api.spec.ts**
- [`npx playwright test modules/dashboard/api/statistics.api.spec.ts --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%2Fapi%2Fstatistics.api.spec.ts%20--project%3Dapi%22%7D)

**tracking.api.spec.ts**
- [`npx playwright test modules/dashboard/api/tracking.api.spec.ts --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fdashboard%2Fapi%2Ftracking.api.spec.ts%20--project%3Dapi%22%7D)
