# موديول Storefront (المتجر)

> **إزاي تستخدميه:** افتحي الملف ده في الـ Preview (اضغطي `Ctrl+Shift+V`)، وبعدين `Ctrl+Click` على أي أمر، فبيتكتب لوحده في الترمنال المفتوح. اضغطي `Enter` عشان يشتغل.
> تحت كل أمر أمر تاني بنفس الشكل وفي آخره `--headed`، عشان تشوفي المتصفح وهو شغّال.
> لو الترمنال مش مفتوح افتحيه الأول (`` Ctrl+` ``) وشغّلي الأوامر من فولدر المشروع.

تنبيه: كل التستات بتضيف أدوات QA (اسمها بيبدأ بـ `QA-`) بالـ API وتحذفها بعد كده، وأدواتك الحقيقية مبتتلمسش. تست `store-states.spec.ts` بطيء (دقايق) لأنه بيستنى ملف المتجر يتحدّث. الكوبون التلقائي بيتجرّب بالحالات الغلط بس (الإصدار الناجح بيعمل كوبون حقيقي على سلة).

## الفولدر كله (UI + API)
- [`npx playwright test modules/storefront`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%22%7D)
- [`npx playwright test modules/storefront --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%20--headed%22%7D)  ← مع فتح المتصفح (headed)

من غير التست البطيء (حالة الأداة في ملف المتجر):
- [`npx playwright test modules/storefront --grep-invert "reaches the store file"`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%20--grep-invert%20%5C%22reaches%20the%20store%20file%5C%22%22%7D)

UI بس:
- [`npx playwright test modules/storefront/ui --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fui%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/storefront/ui --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fui%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

API بس:
- [`npx playwright test modules/storefront/api --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fapi%20--project%3Dapi%22%7D)

## كل ملف لوحده

**store-journey.spec.ts** (الاسكريبت بيفتح Tooliify ويضيف أداة من الواجهة ويشوفها في المتجر، وبعدين يوقفها ويحذفها ويشوفها اختفت)
- [`npx playwright test modules/storefront/ui/store-journey.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fui%2Fstore-journey.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/storefront/ui/store-journey.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fui%2Fstore-journey.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**store-page.spec.ts**
- [`npx playwright test modules/storefront/ui/store-page.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fui%2Fstore-page.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/storefront/ui/store-page.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fui%2Fstore-page.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**store-states.spec.ts**
- [`npx playwright test modules/storefront/ui/store-states.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fui%2Fstore-states.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/storefront/ui/store-states.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fui%2Fstore-states.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**store-tracking.spec.ts**
- [`npx playwright test modules/storefront/ui/store-tracking.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fui%2Fstore-tracking.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/storefront/ui/store-tracking.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fui%2Fstore-tracking.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**store-file.api.spec.ts**
- [`npx playwright test modules/storefront/api/store-file.api.spec.ts --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fapi%2Fstore-file.api.spec.ts%20--project%3Dapi%22%7D)

**storefront.api.spec.ts**
- [`npx playwright test modules/storefront/api/storefront.api.spec.ts --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fstorefront%2Fapi%2Fstorefront.api.spec.ts%20--project%3Dapi%22%7D)
