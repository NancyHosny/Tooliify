# موديول Coupons (الكوبونات)

> **إزاي تستخدميه:** افتحي الملف ده في الـ Preview (اضغطي `Ctrl+Shift+V`)، وبعدين `Ctrl+Click` على أي أمر، فبيتكتب لوحده في الترمنال المفتوح. اضغطي `Enter` عشان يشتغل.
> تحت كل أمر أمر تاني بنفس الشكل وفي آخره `--headed`، عشان تشوفي المتصفح وهو شغّال.
> لو الترمنال مش مفتوح افتحيه الأول (`` Ctrl+` ``) وشغّلي الأوامر من فولدر المشروع.

تنبيه: الكوبونات بتتعمل على متجرك الحقيقي (سلة). كل تست بيعمل كوبون اسمه بيبدأ بـ `QA-` بالـ API ويحذفه بعد كده، وكوبوناتك الحقيقية (وكوبون `TFY-K5ZZDFNA4N` اللي أدوات الكوبونات بتستخدمه) مبتتلمسش.

## الفولدر كله (UI + API)
- [`npx playwright test modules/coupons`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fcoupons%22%7D)
- [`npx playwright test modules/coupons --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fcoupons%20--headed%22%7D)  ← مع فتح المتصفح (headed)

UI بس:
- [`npx playwright test modules/coupons/ui --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fcoupons%2Fui%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/coupons/ui --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fcoupons%2Fui%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

API بس:
- [`npx playwright test modules/coupons/api --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fcoupons%2Fapi%20--project%3Dapi%22%7D)

## كل ملف لوحده

**coupon-actions.spec.ts**
- [`npx playwright test modules/coupons/ui/coupon-actions.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fcoupons%2Fui%2Fcoupon-actions.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/coupons/ui/coupon-actions.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fcoupons%2Fui%2Fcoupon-actions.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**coupon-form.spec.ts**
- [`npx playwright test modules/coupons/ui/coupon-form.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fcoupons%2Fui%2Fcoupon-form.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/coupons/ui/coupon-form.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fcoupons%2Fui%2Fcoupon-form.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**coupons.spec.ts**
- [`npx playwright test modules/coupons/ui/coupons.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fcoupons%2Fui%2Fcoupons.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/coupons/ui/coupons.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fcoupons%2Fui%2Fcoupons.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**coupons.api.spec.ts**
- [`npx playwright test modules/coupons/api/coupons.api.spec.ts --project=api`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Fcoupons%2Fapi%2Fcoupons.api.spec.ts%20--project%3Dapi%22%7D)

