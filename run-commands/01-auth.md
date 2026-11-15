# موديول Auth (تسجيل الدخول)

> **إزاي تستخدميه:** افتحي الملف ده في الـ Preview (اضغطي `Ctrl+Shift+V`)، وبعدين `Ctrl+Click` على أي أمر، فبيتكتب لوحده في الترمنال المفتوح. اضغطي `Enter` عشان يشتغل.
> تحت كل أمر أمر تاني بنفس الشكل وفي آخره `--headed`، عشان تشوفي المتصفح وهو شغّال.
> لو الترمنال مش مفتوح افتحيه الأول (`` Ctrl+` ``) وشغّلي الأوامر من فولدر المشروع.

تنبيه: تستات نسيت كلمة المرور فيها حد 3 رموز كل 30 دقيقة، وتست كلمة المرور الغلط بيحسب محاولة فاشلة على الحساب الحقيقي، فمتشغّليش الموديول كله مرتين ورا بعض.

## الفولدر كله
- [`npx playwright test modules/auth`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%22%7D)
- [`npx playwright test modules/auth --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%20--headed%22%7D)  ← مع فتح المتصفح (headed)

UI بس:
- [`npx playwright test modules/auth/ui --project=ui-chromium`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%2Fui%20--project%3Dui-chromium%22%7D)
- [`npx playwright test modules/auth/ui --project=ui-chromium --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%2Fui%20--project%3Dui-chromium%20--headed%22%7D)  ← مع فتح المتصفح (headed)

API بس:
- [`npx playwright test modules/auth/api --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%2Fapi%20--project%3Dapi%22%7D)

## كل ملف لوحده

**first-login.spec.ts**
- [`npx playwright test modules/auth/ui/first-login.spec.ts --project=ui-chromium`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%2Fui%2Ffirst-login.spec.ts%20--project%3Dui-chromium%22%7D)
- [`npx playwright test modules/auth/ui/first-login.spec.ts --project=ui-chromium --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%2Fui%2Ffirst-login.spec.ts%20--project%3Dui-chromium%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**forgot-password.spec.ts**
- [`npx playwright test modules/auth/ui/forgot-password.spec.ts --project=ui-chromium`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%2Fui%2Fforgot-password.spec.ts%20--project%3Dui-chromium%22%7D)
- [`npx playwright test modules/auth/ui/forgot-password.spec.ts --project=ui-chromium --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%2Fui%2Fforgot-password.spec.ts%20--project%3Dui-chromium%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**login.spec.ts**
- [`npx playwright test modules/auth/ui/login.spec.ts --project=ui-chromium`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%2Fui%2Flogin.spec.ts%20--project%3Dui-chromium%22%7D)
- [`npx playwright test modules/auth/ui/login.spec.ts --project=ui-chromium --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%2Fui%2Flogin.spec.ts%20--project%3Dui-chromium%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**session.spec.ts**
- [`npx playwright test modules/auth/ui/session.spec.ts --project=ui-chromium`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%2Fui%2Fsession.spec.ts%20--project%3Dui-chromium%22%7D)
- [`npx playwright test modules/auth/ui/session.spec.ts --project=ui-chromium --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%2Fui%2Fsession.spec.ts%20--project%3Dui-chromium%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**auth.api.spec.ts**
- [`npx playwright test modules/auth/api/auth.api.spec.ts --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fauth%2Fapi%2Fauth.api.spec.ts%20--project%3Dapi%22%7D)

