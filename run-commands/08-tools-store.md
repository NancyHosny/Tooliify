# الاستور: كل أداة لوحدها (الـ 33 أداة)

> **إزاي تستخدميه:** افتحي الملف ده في الـ Preview (اضغطي `Ctrl+Shift+V`)، وبعدين `Ctrl+Click` على أي أمر، فبيتكتب لوحده في الترمنال المفتوح. اضغطي `Enter` عشان يشتغل.
> تحت كل أمر أمر تاني بنفس الشكل وفي آخره `--headed`، عشان تشوفي المتصفح وهو شغّال.
> لو الترمنال مش مفتوح افتحيه الأول (`` Ctrl+` ``) وشغّلي الأوامر من فولدر المشروع.

كل أمر بيشغّل `store.spec.ts` بتاع الأداة: بيضيف أداة اسمها بيبدأ بـ `QA-` من الواجهة، وبيشوفها في "أدواتي" (الداشبورد) وبعدين يفتح المتجر الحقيقي ويشوفها، وبعدين يعدّلها ويشوف القيمة الجديدة في الداشبورد والمتجر، وبعدين يحذفها ويشوفها اختفت من الداشبورد والمتجر. وبعد كل تست بتتحذف أدوات QA، وأدواتك الحقيقية مبتتلمسش.
الأداة الواحدة بتاخد من دقيقة ونص لدقيقتين تقريبًا.

## كل الـ 33 أداة ورا بعض (بياخد حوالي ساعة)
- [`npx playwright test store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20store.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20store.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

## كل أداة لوحدها

**آراء العملاء** (customer-reviews)
- [`npx playwright test modules/tools/customer-reviews/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fcustomer-reviews%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/customer-reviews/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fcustomer-reviews%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**عدد المشتريات** (purchase-counter)
- [`npx playwright test modules/tools/purchase-counter/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fpurchase-counter%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/purchase-counter/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fpurchase-counter%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**زائر نشط** (active-visitors)
- [`npx playwright test modules/tools/active-visitors/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Factive-visitors%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/active-visitors/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Factive-visitors%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**عدد المشاهدات** (product-views)
- [`npx playwright test modules/tools/product-views/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fproduct-views%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/product-views/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fproduct-views%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**اشتري منتج** (social-proof-purchase)
- [`npx playwright test modules/tools/social-proof-purchase/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fsocial-proof-purchase%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/social-proof-purchase/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fsocial-proof-purchase%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**عدد القطع** (stock-counter)
- [`npx playwright test modules/tools/stock-counter/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fstock-counter%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/stock-counter/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fstock-counter%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**عداد خصم** (discount-countdown)
- [`npx playwright test modules/tools/discount-countdown/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fdiscount-countdown%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/discount-countdown/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fdiscount-countdown%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**كوبونات الخصم** (discount-coupons)
- [`npx playwright test modules/tools/discount-coupons/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fdiscount-coupons%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/discount-coupons/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fdiscount-coupons%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**الخصومات** (discounts-popup)
- [`npx playwright test modules/tools/discounts-popup/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fdiscounts-popup%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/discounts-popup/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fdiscounts-popup%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**عجلة الحظ** (wheel-of-fortune)
- [`npx playwright test modules/tools/wheel-of-fortune/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fwheel-of-fortune%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/wheel-of-fortune/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fwheel-of-fortune%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**سيلز بلس** (sales-plus)
- [`npx playwright test modules/tools/sales-plus/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fsales-plus%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/sales-plus/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fsales-plus%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**التواصل** (social-links)
- [`npx playwright test modules/tools/social-links/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fsocial-links%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/social-links/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fsocial-links%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**واتساب** (whatsapp)
- [`npx playwright test modules/tools/whatsapp/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fwhatsapp%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/whatsapp/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fwhatsapp%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**فيسبوك** (facebook)
- [`npx playwright test modules/tools/facebook/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Ffacebook%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/facebook/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Ffacebook%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**ماسنجر** (messenger)
- [`npx playwright test modules/tools/messenger/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fmessenger%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/messenger/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fmessenger%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**سناب شات** (snapchat)
- [`npx playwright test modules/tools/snapchat/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fsnapchat%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/snapchat/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fsnapchat%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**رقم الهاتف** (phone-number)
- [`npx playwright test modules/tools/phone-number/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fphone-number%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/phone-number/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fphone-number%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**البريد الإلكتروني** (email-button)
- [`npx playwright test modules/tools/email-button/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/email-button/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Femail-button%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**تيك توك** (tiktok)
- [`npx playwright test modules/tools/tiktok/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Ftiktok%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/tiktok/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Ftiktok%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**انستجرام** (instagram)
- [`npx playwright test modules/tools/instagram/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Finstagram%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/instagram/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Finstagram%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**يوتيوب** (youtube)
- [`npx playwright test modules/tools/youtube/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fyoutube%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/youtube/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fyoutube%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**تيليجرام** (telegram)
- [`npx playwright test modules/tools/telegram/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Ftelegram%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/telegram/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Ftelegram%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**مشاركة** (share)
- [`npx playwright test modules/tools/share/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fshare%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/share/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fshare%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**الشريط** (announcement-bar)
- [`npx playwright test modules/tools/announcement-bar/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fannouncement-bar%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/announcement-bar/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fannouncement-bar%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**إعلانات** (advertisements)
- [`npx playwright test modules/tools/advertisements/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fadvertisements%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/advertisements/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fadvertisements%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**القصص** (stories)
- [`npx playwright test modules/tools/stories/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fstories%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/stories/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fstories%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**الأسئلة الشائعة** (faq)
- [`npx playwright test modules/tools/faq/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Ffaq%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/faq/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Ffaq%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**مغلق للصيانة** (maintenance-mode)
- [`npx playwright test modules/tools/maintenance-mode/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fmaintenance-mode%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/maintenance-mode/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fmaintenance-mode%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**إخفاء من الإضافات** (hide-extensions)
- [`npx playwright test modules/tools/hide-extensions/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fhide-extensions%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/hide-extensions/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fhide-extensions%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**الكوكيز** (cookies-consent)
- [`npx playwright test modules/tools/cookies-consent/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fcookies-consent%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/cookies-consent/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fcookies-consent%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**شارات الثقة** (trust-badges)
- [`npx playwright test modules/tools/trust-badges/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Ftrust-badges%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/trust-badges/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Ftrust-badges%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**منتجات مشابهة** (similar-products)
- [`npx playwright test modules/tools/similar-products/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fsimilar-products%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/similar-products/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Fsimilar-products%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

**منتجات مقترحة معًا** (frequently-bought-together)
- [`npx playwright test modules/tools/frequently-bought-together/store.spec.ts --project=ui-merchant`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Ffrequently-bought-together%2Fstore.spec.ts%20--project%3Dui-merchant%22%7D)
- [`npx playwright test modules/tools/frequently-bought-together/store.spec.ts --project=ui-merchant --headed`](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22npx%20playwright%20test%20modules%2Ftools%2Ffrequently-bought-together%2Fstore.spec.ts%20--project%3Dui-merchant%20--headed%22%7D)  ← مع فتح المتصفح (headed)

