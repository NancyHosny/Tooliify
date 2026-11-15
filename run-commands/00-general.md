# تشغيل كل حاجة

> **إزاي تستخدميه:** افتحي الملف ده في الـ Preview (اضغطي `Ctrl+Shift+V`)، وبعدين `Ctrl+Click` على أي أمر، فبيتكتب لوحده في الترمنال المفتوح. اضغطي `Enter` عشان يشتغل.
> تحت كل أمر أمر تاني بنفس الشكل وفي آخره `--headed`، عشان تشوفي المتصفح وهو شغّال.
> لو الترمنال مش مفتوح افتحيه الأول (`` Ctrl+` ``) وشغّلي الأوامر من فولدر المشروع.

كل التستات (أكتر من ألف تست، بتاخد ساعات):
- [`npx playwright test`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%22%7D)
- [`npx playwright test --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20--headed%22%7D)  ← مع فتح المتصفح (headed)

كل تستات الـ UI بتاعة التاجر المسجّل دخول (البروفايل + الأدوات):
- [`npx playwright test --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20--project%3Dui-merchant%22%7D)
- [`npx playwright test --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

كل تستات الـ API:
- [`npx playwright test --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20--project%3Dapi%22%7D)

تستات الـ smoke بس (الأهم):
- [`npx playwright test --grep @smoke`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20--grep%20%40smoke%22%7D)
- [`npx playwright test --grep @smoke --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20--grep%20%40smoke%20--headed%22%7D)  ← مع فتح المتصفح (headed)

فتح تقرير HTML بعد التشغيل:
- [`npx playwright show-report`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20show-report%22%7D)

ملحوظة: لو عايزة تشوفي المتصفح ضيفي `--headed` في آخر الأمر بعد ما يتكتب، ولو عايزة تست واحد بالاسم ضيفي `-g "جزء من اسم التست"`.

الـ projects: `ui-chromium` (auth من غير تسجيل دخول)، `ui-merchant` (أي موديول تاني وهو مسجّل دخول)، `api` (تستات الـ API).
