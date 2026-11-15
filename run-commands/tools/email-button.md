# الأداة: البريد الإلكتروني (email-button)

> **إزاي تستخدميه:** افتحي الملف ده في الـ Preview (اضغطي `Ctrl+Shift+V`)، وبعدين `Ctrl+Click` على أي أمر، فبيتكتب لوحده في الترمنال المفتوح. اضغطي `Enter` عشان يشتغل.
> تحت كل أمر أمر تاني بنفس الشكل وفي آخره `--headed`، عشان تشوفي المتصفح وهو شغّال.
> لو الترمنال مش مفتوح افتحيه الأول (`` Ctrl+` ``) وشغّلي الأوامر من فولدر المشروع.

تنبيه: تستات add و edit و delete و store بتعمل أداة اسمها بيبدأ بـ `QA-` على الحساب الحقيقي وبتحذفها بعد كل تست (الأدوات الحقيقية مبتتلمسش). ملف store بياخد حوالي 5 دقايق.

## الفولدر كله (الـ 6 ملفات)
- [`npx playwright test modules/tools/email-button --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/email-button --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

## كل ملف لوحده

**العرض** (view.spec.ts)
- [`npx playwright test modules/tools/email-button/view.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fview.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/email-button/view.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fview.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**البحث** (search.spec.ts)
- [`npx playwright test modules/tools/email-button/search.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fsearch.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/email-button/search.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fsearch.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**الإضافة** (add.spec.ts)
- [`npx playwright test modules/tools/email-button/add.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fadd.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/email-button/add.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fadd.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**التعديل** (edit.spec.ts)
- [`npx playwright test modules/tools/email-button/edit.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fedit.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/email-button/edit.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fedit.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**الحذف** (delete.spec.ts)
- [`npx playwright test modules/tools/email-button/delete.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fdelete.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/email-button/delete.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fdelete.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**الاستور** (store.spec.ts)
- [`npx playwright test modules/tools/email-button/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/email-button/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

