# موديول Profile (البروفايل)

> **إزاي تستخدميه:** افتحي الملف ده في الـ Preview (اضغطي `Ctrl+Shift+V`)، وبعدين `Ctrl+Click` على أي أمر، فبيتكتب لوحده في الترمنال المفتوح. اضغطي `Enter` عشان يشتغل.
> تحت كل أمر أمر تاني بنفس الشكل وفي آخره `--headed`، عشان تشوفي المتصفح وهو شغّال.
> لو الترمنال مش مفتوح افتحيه الأول (`` Ctrl+` ``) وشغّلي الأوامر من فولدر المشروع.

## الفولدر كله
- [`npx playwright test modules/profile`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fprofile%22%7D)
- [`npx playwright test modules/profile --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fprofile%20--headed%22%7D)  ← مع فتح المتصفح (headed)

UI بس:
- [`npx playwright test modules/profile/ui --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fprofile%2Fui%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/profile/ui --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fprofile%2Fui%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

API بس:
- [`npx playwright test modules/profile/api --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fprofile%2Fapi%20--project%3Dapi%22%7D)

## كل ملف لوحده

**change-password.spec.ts**
- [`npx playwright test modules/profile/ui/change-password.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fprofile%2Fui%2Fchange-password.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/profile/ui/change-password.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fprofile%2Fui%2Fchange-password.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**profile.spec.ts**
- [`npx playwright test modules/profile/ui/profile.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fprofile%2Fui%2Fprofile.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/profile/ui/profile.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fprofile%2Fui%2Fprofile.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**profile.api.spec.ts**
- [`npx playwright test modules/profile/api/profile.api.spec.ts --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fprofile%2Fapi%2Fprofile.api.spec.ts%20--project%3Dapi%22%7D)

