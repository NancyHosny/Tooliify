# موديول Tools: الكتالوج وأدواتي والـ API

> **إزاي تستخدميه:** افتحي الملف ده في الـ Preview (اضغطي `Ctrl+Shift+V`)، وبعدين `Ctrl+Click` على أي أمر، فبيتكتب لوحده في الترمنال المفتوح. اضغطي `Enter` عشان يشتغل.
> تحت كل أمر أمر تاني بنفس الشكل وفي آخره `--headed`، عشان تشوفي المتصفح وهو شغّال.
> لو الترمنال مش مفتوح افتحيه الأول (`` Ctrl+` ``) وشغّلي الأوامر من فولدر المشروع.

## موديول الأدوات كله (الكتالوج + أدواتي + الـ 33 أداة، بياخد ساعات)
- [`npx playwright test modules/tools --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

## كتالوج الأدوات (catalog)
الفولدر كله:
- [`npx playwright test modules/tools/catalog --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fcatalog%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/catalog --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fcatalog%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

كل ملف لوحده:

**search.spec.ts**
- [`npx playwright test modules/tools/catalog/search.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fcatalog%2Fsearch.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/catalog/search.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fcatalog%2Fsearch.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**view.spec.ts**
- [`npx playwright test modules/tools/catalog/view.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fcatalog%2Fview.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/catalog/view.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fcatalog%2Fview.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

## صفحة أدواتي (my-tools)
الفولدر كله:
- [`npx playwright test modules/tools/my-tools --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fmy-tools%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/my-tools --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fmy-tools%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

كل ملف لوحده:

**view.spec.ts**
- [`npx playwright test modules/tools/my-tools/view.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fmy-tools%2Fview.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/my-tools/view.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fmy-tools%2Fview.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

## API الأدوات
الفولدر كله:
- [`npx playwright test modules/tools/api --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fapi%20--project%3Dapi%22%7D)

كل ملف لوحده:

**my-tools.api.spec.ts**
- [`npx playwright test modules/tools/api/my-tools.api.spec.ts --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fapi%2Fmy-tools.api.spec.ts%20--project%3Dapi%22%7D)

**tools-catalog.api.spec.ts**
- [`npx playwright test modules/tools/api/tools-catalog.api.spec.ts --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fapi%2Ftools-catalog.api.spec.ts%20--project%3Dapi%22%7D)

