// ملف واحد لكل بيانات التست وبيانات الدخول. التستات بتستورد منه اللي محتاجاه،
// ومفيش إيميل أو باسورد أو توكن أو رقم هاتف أو مسار أو رسالة بتتكتب جوه كود التست نفسه.

// بيانات الدخول الحقيقية "مش" مكتوبة هنا (الملف ده ممكن يتشارك). بتتقرا من ملف .env.

// ───── 1. العناوين والمسارات ─────

// عنوان الـ API بتاع الباك إند (لو فاضي تستات الـ API بتتخطى).
export const apiUrl = process.env.API_URL ?? '';

// مسارات الصفحات (عنوان الموقع نفسه هو BASE_URL في ملف .env).
export const paths = {
  login: process.env.LOGIN_PATH ?? '/ar/auth',
  // الصفحة الرئيسية للوحة التحكم (افتراض مننا – غيّريها لو المسار الحقيقي مختلف).
  home: '/ar',
  profile: process.env.PROFILE_PATH ?? '/ar/profile',
  tools: '/ar/tools',
  myTools: '/ar/my-tools',
  scheduling: '/ar/scheduling',
  // صفحة الكوبونات ("الكوبونات") وصفحة إضافة كوبون جديد.
  coupons: '/ar/coupons',
  newCoupon: '/ar/coupons/new',
  // صفحة لوحة التحكم (الرئيسية) بالعربي وبالإنجليزي.
  dashboard: '/ar/dashboard',
  dashboardEn: '/en/dashboard',
};

// ───── 2. الحسابات (بيانات الدخول بتيجي من .env) ─────

// حساب التاجر الفعّال اللي أغلب التستات بتستخدمه.
export const validMerchant = {
  // الإيميل من .env (نص فاضي لو مش موجود، فالتست يفشل برسالة واضحة).
  email: process.env.MERCHANT_EMAIL ?? '',
  password: process.env.MERCHANT_PASSWORD ?? '',
};

// حسابات إضافية لسيناريوهات متعطّلة. التستات اللي بتستخدمهم بتتخطى لحد ما نضيفهم في .env.
export const specialAccounts = {
  // حساب عمره ما سجّل دخول (كلمة المرور المؤقتة لسه شغّالة) – SRS 10.3.
  firstLogin: { email: process.env.FIRST_LOGIN_EMAIL ?? '', password: process.env.FIRST_LOGIN_PASSWORD ?? '' },
  // حساب اشتراكه منتهي – SRS 10.2 Alt 3.
  expired: { email: process.env.EXPIRED_EMAIL ?? '', password: process.env.EXPIRED_PASSWORD ?? '' },
  // حساب موقوف – SRS 10.2 Alt 4.
  suspended: { email: process.env.SUSPENDED_EMAIL ?? '', password: process.env.SUSPENDED_PASSWORD ?? '' },
};

// ───── 3. الإيميلات ─────

// إيميل "مش" مسجّل في Tooliify (SRS 10.2 Alt 2). مبيحسبش محاولات فاشلة على الحساب الحقيقي.
export const unregisteredEmail = 'qa.not.registered.tooliify@example.com';

// إيميلات شكلها غلط (SRS 10.2: لازم تبقى بشكل name@domain.com).
export const invalidEmails = ['merchant', 'merchant@', '@tooliify.com', 'merchant tooliify@mail.com'];

// ───── 4. كلمات المرور ─────

// كلمة مرور طولها كفاية (8 حروف أو أكتر) بس مش هي الحقيقية.
export const wrongPassword = 'WrongPass#2026';

// كلمة مرور أقل من الحد الأدنى (8) بحرف واحد (حد أدنى - 1).
export const shortPassword = 'Abc1234';

// "كلمة مرور حالية" غلط لتستات تغيير كلمة المرور (الحقيقية عمرها ما بتتكتب هناك).
export const wrongCurrentPassword = 'WrongCurrent#2026';

// كلمة مرور بتحقق كل القواعد (بتتستخدم بس في الأماكن اللي مفيش فيها حفظ فعلي).
export const strongPassword = 'QaTooliify2026';

// تأكيد مختلف عن strongPassword.
export const mismatchedConfirmation = strongPassword + 'x';

// كلمة مرور تانية بنستخدمها كتأكيد مختلف في تستات الـ API.
export const otherPassword = 'Other#2026a';

// كلمات مرور بتكسر قواعد الـ SRS (من 8 لـ 64 حرف، ورقم + حرف كبير + حرف صغير).
export const weakPasswords = [
  { rule: '7 chars (Min-1)', value: 'Abcde12' },
  { rule: 'no digit', value: 'Abcdefgh' },
  { rule: 'no uppercase', value: 'abcdefg1' },
  { rule: 'no lowercase', value: 'ABCDEFG1' },
  { rule: '65 chars (Max+1)', value: 'Aa1' + 'x'.repeat(62) },
];

// كلمات المرور الضعيفة اللي بتتستخدم في نافذة البروفايل (أول أربعة).
export const weakNewPasswords = weakPasswords.slice(0, 4);

// ───── 5. رموز OTP وتوكنز مزيّفة ─────

// رمز من 6 أرقام (غالبًا) غلط – بيتستخدم في تست واجهة الرمز الغلط.
export const wrongOtp = '000000';

// توكن مش موجود (لازم يرجّع 401).
export const fakeJwt = 'invalid.jwt.token';

// reset token مش موجود (لازم يترفض).
export const fakeResetToken = 'fake-reset-token';

// ───── 6. أرقام الهاتف (البروفايل) ─────

// أرقام هاتف بتتبع قاعدة الـ SRS: "+" وبعدها أرقام بس، من 8 لـ 15 رقم.
// "countryCode" و "phone" هما نفس الرقم متقسّم نصين، لأن الـ API (PUT /profile) بيطلب الاتنين.
export const validPhones = [
  // الحد الأدنى: 8 أرقام بعد "+".
  { name: '8 digits (Min)', full: '+96655421', countryCode: '+966', phone: '55421' },
  // رقم موبايل سعودي عادي: 12 رقم.
  { name: '12 digits (normal)', full: '+966554210055', countryCode: '+966', phone: '554210055' },
  // الحد الأقصى: 15 رقم.
  { name: '15 digits (Max)', full: '+966554210055123', countryCode: '+966', phone: '554210055123' },
];

// أرقام هاتف بتكسر قاعدة الـ SRS ← "من فضلك ادخل رقم صحيح".
export const invalidPhones = [
  { name: 'no plus sign', full: '966554210055' },
  { name: '7 digits (Min-1)', full: '+9665542' },
  { name: '16 digits (Max+1)', full: '+9665542100551234' },
  { name: 'letters', full: '+96655abc0055' },
  { name: 'spaces', full: '+966 55 421 0055' },
];

// ───── 7. أجسام طلبات الـ API ─────

// أجسام دخول غلط (الـ OpenAPI: شكل الإيميل، وكلمة المرور 8 على الأقل) – كل واحد لازم يرجّع 422.
export const invalidLoginBodies = [
  {},
  { email: unregisteredEmail },
  { password: wrongPassword },
  { email: invalidEmails[0], password: wrongPassword },
  { email: unregisteredEmail, password: shortPassword },
  { email: null, password: null },
  { email: 12345, password: true },
];

// أجسام "التحقق من OTP" الغلط – كل واحد لازم يرجّع 422.
export const invalidOtpBodies = [
  { email: unregisteredEmail },
  { code: '123456' },
  { email: unregisteredEmail, code: '12345' },
  { email: unregisteredEmail, code: '1234567' },
  { email: unregisteredEmail, code: 'abcdef' },
  { email: unregisteredEmail, code: '123456' },
];

// جسم إعادة تعيين كلمة المرور بتوكن مزيّف (الإيميل بيضيفه التست).
export const fakeResetBody = {
  reset_token: fakeResetToken,
  password: strongPassword,
  password_confirmation: strongPassword,
};

// جسم إعادة تعيين أول دخول (بيتبعت من غير توكن، فلازم يرجّع 401).
export const firstLoginResetBody = { password: strongPassword, password_confirmation: strongPassword };

// تغييرات غلط على البروفايل. التست بيضيف كل واحد فوق بيانات البروفايل الحالية.
export const invalidProfileChanges = [
  { name: 'missing phone', change: { phone: undefined } },
  { name: 'phone with letters', change: { phone: '55abc0055' } },
  { name: 'phone too short', change: { country_code: '+966', phone: '5542' } },
  { name: 'phone too long', change: { country_code: '+966', phone: '5542100551234' } },
  { name: 'country code without +', change: { country_code: '966' } },
  { name: 'phone null', change: { phone: null } },
];

// أجسام تغيير كلمة المرور الغلط – كل واحد لازم يرجّع 422 (كلمة المرور الحالية الحقيقية عمرها ما بتتبعت).
export const invalidPasswordBodies = [
  { current_password: wrongCurrentPassword, password: strongPassword, password_confirmation: strongPassword },
  { password: strongPassword, password_confirmation: strongPassword },
  { current_password: wrongCurrentPassword, password: weakPasswords[0].value, password_confirmation: weakPasswords[0].value },
  { current_password: wrongCurrentPassword, password: strongPassword, password_confirmation: otherPassword },
  {},
];

// ───── 8. كتالوج الأدوات (SRS 10.8) ─────

// التاب اللي بيعرض كل الأدوات.
export const allToolsTab = 'الكل';

// تابات التصنيفات في صفحة الكتالوج. "tool" هي أداة لازم تظهر جوه التاب.
// "categoryId" هو تصنيف الـ API اللي التاب بيعرضه (أسماء التابات اسماء قصيرة مكتوبة في الواجهة،
// وأسماء الـ API مختلفة: 1 الإثبات الاجتماعي، 2 العروض والخصومات، 3 التواصل والتفاعل، 4 الإعلانات والمحتوى، 5 أدوات عامة).
export const catalogTabs = [
  { tab: 'نشاط العملاء', tool: 'آراء العملاء', categoryId: 1 },
  { tab: 'عروض وتحفيز', tool: 'عداد خصم', categoryId: 2 },
  { tab: 'تواصل', tool: 'واتساب', categoryId: 3 },
  { tab: 'ترقية', tool: 'الأسئلة الشائعة', categoryId: 4 },
  // عيب: التاب ده في الحقيقة هو تصنيف الـ API "أدوات عامة" (مغلق للصيانة / إخفاء من الإضافات / الكوكيز)، مش أدوات الكوبونات.
  { tab: 'كوبونات', tool: 'كوبونات الخصم', categoryId: 5 },
];

// الاختيار الافتراضي للقايمة المنسدلة للشارات.
export const allBadgesOption = 'جميع الوسوم';

// اختيارات قايمة الشارات. كل اختيار هو نفسه النص المكتوب على الكروت.
export const catalogBadges = ['جديد', 'الأكثر استخداماً', 'مقترح لعملائك'];

// الصورة اللي التستات بترفعها في الـ builders اللي محتاجة صورة (صورة صغيرة بنفسجي).
export const qaImagePath = 'test-data/qa-image.png';

// أداة "مش" مضافة على حساب التست. زرار الإضافة بيفتح صفحة الـ builder بس (مفيش حاجة بتتحفظ).
export const sampleTool = { name: 'آراء العملاء', slug: 'customer-reviews' };

// عمليات بحث لازم تلاقي أداة.
export const validSearches = [
  { name: 'full name', term: 'واتساب', expected: 'واتساب' },
  { name: 'part of the name', term: 'وات', expected: 'واتساب' },
  { name: 'spaces around the name', term: '  واتساب  ', expected: 'واتساب' },
];

// عمليات بحث لازم تظهر شاشة "مفيش نتايج".
export const noResultSearches = [
  { name: 'unknown name', term: 'zzzzqqq' },
  { name: 'numbers only', term: '123456' },
];

// كلمة بحث وتاب مفيش بينهم أداة مشتركة (بحث + تاب ← شاشة فاضية).
export const searchWithoutMatchInTab = { term: 'عدد', tab: 'تواصل' };

// id مش موجود (لتستات الـ API 404) و id مش رقم.
export const unknownId = 999999;
export const notNumericId = 'abc';

// ───── 9. أدواتي – الإضافة والحذف (SRS 10.9 و 10.10) ─────

// كل أداة بيعملها تست اسمها بيبدأ بالبادئة دي. التنضيف بيحذف الأدوات اللي ليها البادئة دي "بس"،
// فالأدوات الحقيقية على الحساب مستحيل تتلمس.
export const qaPrefix = 'QA-';

// اسم أداة جديد ومميز لكل تست (الرقم هو الوقت الحالي).
export const newQaToolName = (slug = 'tool') => `${qaPrefix}${slug}-${Date.now()}`;

// الأداة اللي بتستخدمها تستات الـ API: الـ builder بتاعها بيتحفظ بالقيم الافتراضية (مش محتاجة مدخلات).
export const toolToAdd = { name: 'الكوكيز', slug: 'cookies-consent', id: 30 };

// أسماء أدوات لازم تترفض (القاعدة: حرفين على الأقل).
export const invalidToolNames = [
  { name: 'empty', value: '' },
  { name: '1 character (Min-1)', value: 'Q' },
];

// نص مش رابط.
export const notALink = 'not a link';

// الـ 33 أداة في الكتالوج. كل أداة ليها فولدر لوحدها: modules/tools/<slug>/
// فيه ملفات view / search / add / edit / delete / store. التستات بتقرا الأداة من هنا.

// الكوبون الحقيقي بتاع حساب التست (فعّال لحد 2027-01-31). أدوات الكوبونات في الـ builder بتختاره من قايمة الكوبونات بالكود.
// بعدين موديول الكوبونات هيعمل كوبون جديد في التست بدل ده (وقتها الثابت ده بس هو اللي يتغيّر).
export const coupon = { code: 'TFY-K5ZZDFNA4N', discount: '33%' };

// اللي التستات محتاجة تعرفه عن أداة واحدة.
export type ToolData = {
  // id الأداة في الـ API والـ slug بتاعها (= اسم الفولدر وعنوان الـ builder /ar/tools/<slug>).
  id: number;
  slug: string;
  // اسم الأداة المكتوب على الكارت.
  name: string;
  // id تصنيف الـ API (التاب في الكتالوج اللي بيعرض الأداة، شوفي catalogTabs).
  categoryId: number;
  // القيمة اللي بتتكتب في حقل "الرابط" في الـ builder. للأدوات اللي الـ builder بتاعها فيه الحقل ده بس.
  link?: string;
  // true = حقل الرابط بيتفحص من النموذج (الفاضي و"مش رابط" بيترفضوا)، فبتشتغل تستات الرابط الغلط.
  linkChecks?: boolean;
  // حقل الـ builder (الـ name بتاعه) اللي تستات الاستور بتكتب فيه قيمة مميزة، عشان تلاقيها في الاستور.
  // حقول نصية / رابط / هاتف اللي الاستور بيعرضها فعلًا. كل أداة ليها حقل متربط.
  storeField?: string;
  // شكل القيمة المميزة: نص (الافتراضي)، url (بتتضاف للرابط)، phone (أرقام بس)، أو number (رقم من 6 أرقام).
  storeKind?: 'text' | 'url' | 'phone' | 'number';
  // عنوان القسم المطوي اللي فيه حقل الاستور (عنوان عادي مش زرار بـ aria-expanded)، بنضغط عليه عشان نفتحه.
  storeSection?: string;
  // true = الأداة بتترسم في صفحة المتجر أول ما بتتحمّل، فتستات الاستور بتفحص الصفحة نفسها كمان.
  shownOnLoad?: boolean;
  // true = الـ builder محتاج مجموعة منتجات واحدة (منتج أساسي ومنتج مرتبط من منتجات المتجر).
  products?: boolean;
  // مكان الأداة في المتجر (تاب "الظهور"). الأدوات الحقيقية على الحساب بتستخدم المكان الافتراضي،
  // والـ API بيرفض أداة فعّالة تانية في نفس المكان، فبننقل أداة QA لمكان تاني.
  position?: string;
  // true = الـ builder محتاج صورة: كل صندوق رفع بياخد صورة التست (qaImagePath).
  image?: boolean;
  // الأدوات اللي محتاجة روابط تواصل: "all" = كل روابط تاب "الروابط" بتاخد رابط؛ "one" = بنفعّل وسيلة تواصل واحدة وندّيها رابط.
  socialLinks?: 'all' | 'one';
  // true = الحساب فيه نسخة "حقيقية" من الأداة دي (مش من تست). الكتالوج بيفضل يقول "مضافة بالفعل" بعد ما نسخة QA تتحذف،
  // ونسخة QA لازم تتنقل لمكان تاني (شوفي position)، عشان النسخة الحقيقية مستحيل تتلمس.
  realInstance?: boolean;
  // true = الـ builder محتاج كوبون خصم يتختار من قايمته ("اختر كوبون الخصم")، شوفي `coupon`.
  coupon?: boolean;
};


// كل الأدوات بترتيب الكتالوج.
const toolRows: ToolData[] = [
  { id: 1, slug: 'customer-reviews', name: 'آراء العملاء', categoryId: 1 },
  { id: 2, slug: 'purchase-counter', name: 'عدد المشتريات', categoryId: 1 },
  { id: 3, slug: 'active-visitors', name: 'زائر نشط', categoryId: 1 },
  { id: 4, slug: 'product-views', name: 'عدد المشاهدات', categoryId: 1 },
  { id: 5, slug: 'social-proof-purchase', name: 'اشتري منتج', categoryId: 1, image: true },
  { id: 6, slug: 'stock-counter', name: 'عدد القطع', categoryId: 1 },
  { id: 7, slug: 'discount-countdown', name: 'عداد خصم', categoryId: 2 },
  { id: 8, slug: 'discount-coupons', name: 'كوبونات الخصم', categoryId: 2, coupon: true },
  { id: 9, slug: 'discounts-popup', name: 'الخصومات', categoryId: 2, coupon: true },
  { id: 10, slug: 'wheel-of-fortune', name: 'عجلة الحظ', categoryId: 2, coupon: true },
  { id: 11, slug: 'sales-plus', name: 'سيلز بلس', categoryId: 2, coupon: true },
  { id: 12, slug: 'social-links', name: 'التواصل', categoryId: 3, socialLinks: 'all' },
  { id: 13, slug: 'whatsapp', name: 'واتساب', categoryId: 3 },
  { id: 14, slug: 'facebook', name: 'فيسبوك', categoryId: 3, link: 'https://www.facebook.com/tooliify', linkChecks: true },
  { id: 15, slug: 'messenger', name: 'ماسنجر', categoryId: 3, link: 'https://m.me/tooliify', linkChecks: true },
  { id: 16, slug: 'snapchat', name: 'سناب شات', categoryId: 3, link: 'https://www.snapchat.com/add/tooliify', linkChecks: true },
  { id: 17, slug: 'phone-number', name: 'رقم الهاتف', categoryId: 3, link: '0501234567' },
  { id: 18, slug: 'email-button', name: 'البريد الإلكتروني', categoryId: 3, link: 'https://example.com' },
  { id: 19, slug: 'tiktok', name: 'تيك توك', categoryId: 3, link: 'https://www.tiktok.com/@tooliify', linkChecks: true },
  { id: 20, slug: 'instagram', name: 'انستجرام', categoryId: 3, link: 'https://www.instagram.com/tooliify', linkChecks: true },
  { id: 21, slug: 'youtube', name: 'يوتيوب', categoryId: 3, link: 'https://www.youtube.com/@tooliify', linkChecks: true },
  { id: 22, slug: 'telegram', name: 'تيليجرام', categoryId: 3 },
  { id: 23, slug: 'share', name: 'مشاركة', categoryId: 3 },
  { id: 24, slug: 'announcement-bar', name: 'الشريط', categoryId: 4 },
  { id: 25, slug: 'advertisements', name: 'إعلانات', categoryId: 4, image: true },
  { id: 26, slug: 'stories', name: 'القصص', categoryId: 4, image: true, position: 'يسار' },
  { id: 27, slug: 'faq', name: 'الأسئلة الشائعة', categoryId: 4 },
  { id: 28, slug: 'maintenance-mode', name: 'مغلق للصيانة', categoryId: 5, socialLinks: 'one' },
  { id: 29, slug: 'hide-extensions', name: 'إخفاء من الإضافات', categoryId: 5 },
  { id: 30, slug: 'cookies-consent', name: 'الكوكيز', categoryId: 5 },
  { id: 31, slug: 'trust-badges', name: 'شارات الثقة', categoryId: 1, realInstance: true, position: 'أسفل معلومات المنتج' },
  { id: 32, slug: 'similar-products', name: 'منتجات مشابهة', categoryId: 4, products: true, position: 'اسفل - يمين', realInstance: true },
  { id: 33, slug: 'frequently-bought-together', name: 'منتجات مقترحة معًا', categoryId: 4, products: true, position: 'اسفل - يمين', realInstance: true },
];

// الحقل اللي تستات الاستور بتستخدمه لكل أداة (شوفي storeField فوق).
const storeFields: Record<string, Partial<ToolData>> = {
  'customer-reviews': { storeField: 'config.ratings_count', storeKind: 'number' },
  'purchase-counter': { storeField: 'config.purchaseCount', storeKind: 'number' },
  'sales-plus': { storeField: 'config.stages.0.reward_text' },
  'social-proof-purchase': { storeField: 'config.messages.0.messageText', storeSection: 'الرسالة 1' },
  'trust-badges': { storeField: 'config.badges.0.text' },
  'active-visitors': { storeField: 'config.text' },
  'product-views': { storeField: 'config.text' },
  'stock-counter': { storeField: 'config.text' },
  'discount-countdown': { storeField: 'config.notificationText' },
  'discount-coupons': { storeField: 'config.text' },
  'discounts-popup': { storeField: 'config.main_text' },
  'wheel-of-fortune': { storeField: 'config.notification_title' },
  whatsapp: { storeField: 'config.main_title' },
  facebook: { storeField: 'config.url', storeKind: 'url', shownOnLoad: true },
  messenger: { storeField: 'config.url', storeKind: 'url', shownOnLoad: true },
  snapchat: { storeField: 'config.url', storeKind: 'url', shownOnLoad: true },
  tiktok: { storeField: 'config.url', storeKind: 'url', shownOnLoad: true },
  instagram: { storeField: 'config.url', storeKind: 'url', shownOnLoad: true },
  youtube: { storeField: 'config.url', storeKind: 'url', shownOnLoad: true },
  'email-button': { storeField: 'config.url', storeKind: 'url', shownOnLoad: true },
  'phone-number': { storeField: 'config.url', storeKind: 'phone', shownOnLoad: true },
  telegram: { storeField: 'config.notify_text' },
  share: { storeField: 'config.share_message' },
  'announcement-bar': { storeField: 'config.messages.0.text' },
  faq: { storeField: 'config.notification_text' },
  'hide-extensions': { storeField: 'config.customText' },
  'cookies-consent': { storeField: 'config.title', shownOnLoad: true },
  'social-links': { storeField: 'config.icon_title' },
  advertisements: { storeField: 'config.main_text' },
  stories: { storeField: 'config.story_groups.0.title' },
  'maintenance-mode': { storeField: 'config.main_text' },
  'similar-products': { storeField: 'config.section_title' },
  'frequently-bought-together': { storeField: 'config.section_title' },
};

// كل الأدوات ومعاها حقل الاستور بتاعها.
export const toolList: ToolData[] = toolRows.map((tool) => ({ ...tool, ...storeFields[tool.slug] }));

// متجر حساب التست والملف العام اللي Tooliify بتنشره ليه (الاتنين جايين من رد تسجيل الدخول:
// store_url و merchant_id). المتجر بيحمّل الملف ده وبيرسم الأدوات المفعّلة منه.
export const store = {
  url: 'https://demostore.salla.sa/dev-cj0yefvxs2l2tpzx',
  scriptUrl: 'https://files.tooliify.com/newtoolify_1781475844.js',
};

// قيمة مميزة لحقل الاستور بتاع أداة. "value" بتتكتب في الـ builder، و "needle" هي اللي التستات بتدوّر عليها في الاستور.
export function storeMarker(tool: ToolData, prefix: 'qas' | 'qae') {
  const time = Date.now();
  // حقل الهاتف بيقبل أرقام بس.
  if (tool.storeKind === 'phone') {
    const digits = String(time).slice(-8);
    return { value: '05' + digits, needle: digits };
  }
  // حقل رقم: رقم من 6 أرقام.
  if (tool.storeKind === 'number') {
    const digits = String(100000 + (time % 900000));
    return { value: digits, needle: digits };
  }
  // حقل رابط: الجزء المميز بيتضاف بعد الرابط الحقيقي.
  if (tool.storeKind === 'url') {
    const tag = prefix + time;
    return { value: tool.link + '?' + tag, needle: tag };
  }
  // حقل نصي.
  const text = prefix.toUpperCase() + time;
  return { value: text, needle: text };
}

// نفس الأدوات بالـ slug: tools['cookies-consent'].
export const tools: Record<string, ToolData> = Object.fromEntries(toolList.map((tool) => [tool.slug, tool]));

// جسم API لإضافة أداة الكوكيز: نفس الجسم اللي صفحة الـ builder الحقيقية بتبعته (منسوخ من المتصفح).
// الـ API بيرفض الحفظ لو أي مفتاح من مفاتيح config دي ناقص (مثلًا "حقل الأجهزة المستهدفة مطلوب")؛ ومش كلهم موجودين في ملف الـ OpenAPI.
export const addToolBody = (name: string) => ({
  merchant_tool_id: null,
  name,
  schedule: { Enabled: false, start_at: null, end_at: null },
  config: {
    title: 'نحن نهتم بخصوصيتك',
    description: 'نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك داخل الموقع، وتخصيص المحتوى.',
    accept_button_text: 'قبول',
    reject_button_text: 'رفض',
    privacy_policy_url: 'https://sallastore.com/privacy-policy',
    page_appearance: 'all_pages',
    product_url: [],
    target_devices: ['phone', 'desktop'],
    notification_position: 'bottom-left',
    text_color: '#111827',
    background_color: '#FFFFFF',
    widget_size: 50,
    accept_button_text_color: '#FFFFFF',
    accept_button_background_color: '#181816',
    reject_button_text_color: '#737373',
    reject_button_background_color: '#FFFFFF',
    vertical_margin: 5,
    horizontal_margin: 5,
  },
  enabled: true,
});

// أجسام API غلط لإضافة أداة – كل واحد لازم يرجّع 422.
export const invalidAddToolBodies = [
  {},
  { name: 'no config' },
  { ...addToolBody(qaPrefix + 'short'), name: 'Q' },
];

// ───── 10. الرسايل المتوقعة (منسوخة حرفيًا من الـ SRS) ─────

export const messages = {
  // الدخول – شكل الإيميل غلط (SRS 10.2).
  emailInvalid: 'البريد الالكتروني غير صحيح',
  // الدخول – إيميل أو كلمة مرور غلط (SRS 10.2 Alt 1 و 2، شوفي SF-005).
  invalidCredentials: 'بيانات الدخول غير صحيحة',
  // الدخول – الاشتراك منتهي (SRS 10.2 Alt 3).
  subscriptionExpired: 'اشتراكك منتهي',
  // الدخول – الحساب موقوف (SRS 10.2 Alt 4).
  accountSuspended: 'تم ايقاف الحساب',
  // نسيت كلمة المرور – إيميل مش مسجّل، رسالة عامة (SRS 10.4 Alt 1).
  otpGenericSent: 'إذا كان البريد الإلكتروني مسجلا، سيتم إرسال رمز التحقق',
  // نسيت كلمة المرور – الرمز اتبعت (الـ SRS بيكتب "ارسال" من غير همزة).
  otpSent: /تم (إ|ا)رسال رمز التحقق/,
  // نسيت كلمة المرور – الرمز غلط (SRS 10.4 Alt 2).
  otpInvalid: 'رمز التحقق غير صحيح',
  // أول دخول – فتح صفحة تانية قبل تعيين كلمة مرور جديدة (SRS 10.3 Alt 2).
  mustSetPassword: 'يجب تعيين كلمة مرور جديدة للمتابعة',
  // كلمة المرور الجديدة مش مطابقة للقواعد (SRS 10.3 / 10.5 / 10.15).
  passwordRules: 'كلمة المرور غير متطابقة مع الشروط',
  // التأكيد مش مطابق (SRS 10.3 / 10.5 / 10.15).
  passwordMismatch: 'كلمة المرور غير متطابقة',
  // البروفايل – رقم هاتف غلط (SRS 10.15).
  invalidPhone: 'من فضلك ادخل رقم صحيح',
  // البروفايل – التغييرات اتحفظت (SRS 10.15).
  saved: 'تم حفظ التغييرات بنجاح',
  // البروفايل – كلمة المرور الحالية غلط (SRS 10.15).
  wrongCurrentPassword: 'كلمة المرور الحالية غير صحيحة',
  // كتالوج الأدوات – مفيش أداة مطابقة للبحث / الفلاتر (SRS 10.8).
  noToolsFound: 'لا توجد أدوات مطابقة',
  noToolsHint: 'قم بالتأكد من اسم الاداة التي تبحث عنها',
  // كتالوج الأدوات – نافذة المعاينة لسه مفيهاش معاينة.
  previewSoon: 'المعاينة ستتوفر قريباً',
  // عنوان صفحة الـ builder بيبدأ بالنص ده ("تخصيص أداة <الاسم>").
  customizeTool: 'تخصيص أداة',
  // الـ builder – اتحفظ (SRS 10.9).
  toolSaved: 'تم حفظ إعدادات الأداة بنجاح',
  // الـ builder – الاسم أقل من حرفين.
  toolNameTooShort: 'يجب ألا يقل اسم الأداة عن حرفين.',
  // الـ builder – رابط فاضي أو غلط.
  linkInvalid: 'أدخل رابطًا صالحًا.',
  // أدواتي – عنوان نافذة الحذف وسؤالها (SRS 10.10).
  deleteToolTitle: 'حذف الأداة',
  deleteToolQuestion: 'هل انت متأكد من الحذف',
  // أدواتي – شارات الحالة.
  toolActive: 'مفعلة',
  toolInactive: 'غير مفعلة',
  // أدواتي – نافذة مفتاح الحالة.
  deactivateToolTitle: 'الغاء تفعيل الاداة من المتجر',
  deactivateToolQuestion: 'هل انت متأكد من الغاء تفعيل الاداة؟',
};

// ───── 11. الجدولة (صفحة "الجدولة" و endpoints الـ Tool Scheduling) ─────

// فترة جدولة صحيحة في المستقبل البعيد (عشان عمرها ما تبقى في الماضي).
// الـ API بيقبل التاريخ والوقت بالشكل "YYYY-MM-DD HH:mm". صفحة الجدولة بتعرض التاريخ من غير صفر في الأول (2030-1-10).
export const validSchedule = {
  startDate: '2030-01-10',
  startTime: '10:00',
  endDate: '2030-01-20',
  endTime: '12:30',
  shownStart: '2030-1-10',
  shownEnd: '2030-1-20',
};

// جسم الـ API لتفعيل جدولة (من فترة الجدولة الصحيحة).
export const scheduleBody = (schedule = validSchedule) => ({
  is_schedule: true,
  start_at: `${schedule.startDate} ${schedule.startTime}`,
  end_at: `${schedule.endDate} ${schedule.endTime}`,
});

// جسم الـ API لإلغاء الجدولة.
export const clearScheduleBody = { is_schedule: false };

// أجسام جدولة غلط لأداة واحدة – كل واحد لازم يرجّع 422 ورسالة الخطأ المكتوبة جنبه.
export const invalidScheduleBodies = [
  { name: 'no dates', body: { is_schedule: true }, message: 'يرجى تحديد تاريخ ووقت البدء والانتهاء.' },
  { name: 'no end date', body: { is_schedule: true, start_at: '2030-01-10 10:00' }, message: 'يرجى تحديد تاريخ ووقت البدء والانتهاء.' },
  { name: 'end before start', body: { is_schedule: true, start_at: '2030-01-20 10:00', end_at: '2030-01-10 10:00' }, message: 'تاريخ غير صالح، يرجى اختيار فترة زمنية صحيحة.' },
  { name: 'end equals start', body: { is_schedule: true, start_at: '2030-01-10 10:00', end_at: '2030-01-10 10:00' }, message: 'تاريخ غير صالح، يرجى اختيار فترة زمنية صحيحة.' },
  { name: 'start in the past', body: { is_schedule: true, start_at: '2020-01-01 10:00', end_at: '2020-01-02 10:00' }, message: 'يجب أن يكون تاريخ ووقت بداية الجدولة بعد الوقت الحالي.' },
  { name: 'ISO date format', body: { is_schedule: true, start_at: '2030-01-10T10:00:00.000000Z', end_at: '2030-01-20T10:00:00.000000Z' }, message: 'يجب إدخال التاريخ والوقت بالتنسيق YYYY-MM-DD HH:mm.' },
  { name: 'dates that are not dates', body: { is_schedule: true, start_at: 'tomorrow', end_at: 'later' }, message: 'يجب إدخال التاريخ والوقت بالتنسيق YYYY-MM-DD HH:mm.' },
];

// أجسام ناقصة أو بنوع غلط – كل واحد لازم يرجّع 422 (الرسالة بتيجي بالإنجليزي من الـ API، فبنفحص الـ status بس).
export const invalidScheduleFlags = [
  { name: 'is_schedule is missing', body: {} },
  { name: 'is_schedule is not a boolean', body: { is_schedule: 'yes' } },
];

// أجسام جدولة المجموعة الغلط – كل واحد لازم يرجّع 422 (بنضيف merchant_tool_ids في التست).
export const invalidGroupSchedules = [
  { name: 'no dates', body: {} },
  { name: 'end before start', body: { start_at: '2030-01-20 10:00', end_at: '2030-01-10 10:00' } },
  { name: 'ISO date format', body: { start_at: '2030-01-10T10:00:00.000000Z', end_at: '2030-01-20T10:00:00.000000Z' } },
];

// حالات الجدولة اللي الـ API بيقبلها في الفلتر filter[schedule_status] (من الـ OpenAPI).
export const scheduleStatuses = ['not_scheduled', 'pending', 'active', 'ended'];

// النصوص المكتوبة في صفحة الجدولة (بالظبط زي ما بتظهر).
export const scheduleTexts = {
  searchPlaceholder: 'قم بالبحث بأسم الاداة',
  groupButton: 'جدولة مجموعة',
  settingsLabel: 'اعدادات الجدولة',
  popupTitle: 'اعدادات الجدولة',
  switchTitle: 'تفعيل الجدولة الزمنية',
  switchOff: 'الجدولة الزمنية غير مُفعَّلة',
  saveButton: 'حفظ الجدولة',
  closeButton: 'إغلاق',
  startDate: 'تاريخ البداية',
  startTime: 'وقت البدء',
  endDate: 'تاريخ النهاية',
  endTime: 'وقت النهاية',
  requiredDates: 'يجب تحديد تاريخ ووقت البدء و الانتهاء',
  cancelTitle: 'هل انت متاكد من الغاء تفعيل الجدولة',
  confirm: 'تأكيد',
  notScheduled: 'غير مجدولة',
  scheduled: 'مجدولة',
  emptyTitle: 'لا توجد ادوات متاحة للجدولة',
  emptyHint: 'يمكنك اضافة ادوات للتمكن من تخصيصها وتفعيلها',
  addTools: 'اضافة ادوات',
  groupTitle: 'جدولة مجموعة',
  groupSelected: 'الادوات المختارة',
  groupSubmit: 'جدولة المحدد',
  selectAll: 'تحديد كل الأدوات',
  nextMonth: 'Go to the Next Month',
};

// مفاتيح ورسايل الـ API لنتايج الجدولة.
export const scheduleApi = {
  rowsKey: 'tool_schedule_rows_success',
  noToolsKey: 'no_tools_available_for_scheduling',
  setKey: 'tool_success',
  groupKey: 'tools_success',
  setMessage: 'تم تفعيل الجدولة، والأداة ستعمل فقط في الوقت المحدد.',
  groupMessage: 'تم تفعيل الجدولة، وستعمل الأدوات فقط في الوقت المحدد.',
  clearMessage: 'تم إلغاء الجدولة وعادت الأداة للعمل حسب حالة التفعيل اليدوية.',
};

// ───── 12. الكوبونات (صفحة "الكوبونات" و endpoints الـ Coupons) ─────

// اسم كوبون QA جديد ومميز (بيبدأ بـ QA-، وأقل من 50 حرف). التنضيف بيحذف الكوبونات اللي اسمها بيبدأ بـ QA- بس،
// فكوبوناتك الحقيقية (وكوبون TFY-K5ZZDFNA4N اللي أدوات الكوبونات بتستخدمه) مستحيل تتلمس.
export const newQaCouponName = () => `${qaPrefix}coupon-${Date.now()}`;

// رمز كوبون جديد ومميز: "TFY-" وبعدها حروف وأرقام بس (القاعدة في الـ OpenAPI).
export const newQaCouponCode = () => `TFY-QA${Date.now().toString(36).toUpperCase()}`;

// بداية اليوم الحالي بالشكل اللي الـ API بيقبله (عشان الكوبون يبقى "مفعل" من أول لحظة).
const todayStart = () => `${new Date().toISOString().slice(0, 10)}T00:00:00+00:00`;

// جسم الـ API لإنشاء كوبون نسبة مئوية "مفعل" (من النهارده لحد 2030). أي حقل ممكن يتغيّر بـ overrides.
export const couponBody = (overrides: Record<string, unknown> = {}) => ({
  name: newQaCouponName(),
  code: newQaCouponCode(),
  type: 'percentage',
  discount: 10,
  max_discount: 5,
  start_date: todayStart(),
  expire_date: '2030-12-31T00:00:00+00:00',
  max_use: 10,
  max_use_per_user: 1,
  min_purchase: 1,
  free_shipping: false,
  status: 'active',
  ...overrides,
});

// كوبون "مجدول": بيبدأ في المستقبل (2030)، فالـ API بيمنع تفعيله لحد ما يبدأ.
export const scheduledCouponBody = () =>
  couponBody({ start_date: '2030-01-01T00:00:00+00:00', expire_date: '2030-02-01T00:00:00+00:00' });

// كوبون "مبلغ ثابت" صحيح: الحد الأدنى للشراء لازم يبقى أكبر من مبلغ الخصم.
export const fixedCouponBody = () => couponBody({ type: 'fixed', discount: 20, max_discount: null, min_purchase: 100 });

// أجسام إنشاء كوبون غلط – كل واحد لازم يرجّع 422 (و message = الرسالة العربي لو الـ API بيرجّعها عربي).
export const invalidCouponBodies: { name: string; changes: Record<string, unknown>; message?: string }[] = [
  { name: 'name is 1 character', changes: { name: 'Q' } },
  { name: 'name is 51 characters', changes: { name: 'Q'.repeat(51) } },
  { name: 'code has spaces and symbols', changes: { code: 'TFY-AB CD!' }, message: 'يجب أن يبدأ رمز الكوبون بـ TFY- وأن يحتوي بعد ذلك على حروف وأرقام فقط.' },
  { name: 'type is not percentage or fixed', changes: { type: 'zzz' } },
  { name: 'discount is 0', changes: { discount: 0 } },
  { name: 'discount is not a number', changes: { discount: 'abc' } },
  { name: 'percentage is above 100', changes: { discount: 101 }, message: 'نسبة الخصم لا يمكن أن تتجاوز 100٪.' },
  { name: 'expire date is before the start date', changes: { start_date: '2030-02-01T00:00:00+00:00', expire_date: '2030-01-01T00:00:00+00:00' }, message: 'تاريخ انتهاء الكوبون يجب أن يكون بعد تاريخ البداية وفي المستقبل.' },
  { name: 'expire date is missing', changes: { expire_date: null } },
  { name: 'max use is 0', changes: { max_use: 0 } },
  { name: 'status is not active or disabled', changes: { status: 'zzz' } },
  { name: 'fixed discount is above the minimum purchase', changes: { type: 'fixed', discount: 20, max_discount: null, min_purchase: 1 }, message: 'يجب أن يكون الحد الأدنى للشراء أكبر من مبلغ الخصم الثابت.' },
];

// قيم الفلاتر اللي الـ API بيقبلها في الـ paginated (من الـ OpenAPI).
export const couponStatuses = ['active', 'disabled', 'scheduled', 'expired', 'completed'];
export const couponSources = ['platform', 'tooliify_manual', 'tooliify_automatic'];

// نصوص صفحة الكوبونات (بالظبط زي ما بتظهر).
export const couponTexts = {
  pageTitle: 'الكوبونات',
  searchPlaceholder: 'قم بالبحث بأسم الكوبون او رمز الكوبون',
  addButton: 'اضافة كوبون',
  syncLabel: 'اخر مزامنة للكوبونات مع سلة',
  emptyTitle: 'لا توجد كوبونات مطابقة',
  emptyHint: 'جرب اسماً أو رمزاً آخر، أو غيّر حالة الكوبون.',
  copyButton: 'نسخ رمز الكوبون',
  editButton: 'تعديل الكوبون',
  deleteButton: 'حذف الكوبون',
  activateLabel: 'تفعيل',
  stopLabel: 'ايقاف',
  statusActive: 'مفعل',
  statusDisabled: 'معطل',
  statusScheduled: 'مجدول',
  sourceManual: 'يدوي - Toolify',
  sourcePlatform: 'سلة',
  typePercentage: 'نسبة مئوية',
  typeFixed: 'قيمة ثابتة',
  stopTitle: 'تأكيد إيقاف الكوبون',
  stopQuestion: 'هل أنت متأكد من إيقاف هذا الكوبون؟',
  deleteTitle: 'حذف الكوبون',
  deleteQuestion: 'هل أنت متأكد من حذف هذا الكوبون؟',
  confirm: 'تأكيد',
  deleteConfirm: 'حذف',
  close: 'إغلاق',
  newTitle: 'إضافة كوبون جديد',
  editTitle: 'تعديل الكوبون',
  saveButton: 'حفظ الكوبون',
  generateCode: 'توليد كود',
  namePlaceholder: 'اكتب وصف للكوبون',
  codePlaceholder: 'SA20',
  nameRequired: 'اسم الكوبون مطلوب',
  percentageRange: 'نسبة الخصم يجب أن تكون بين 1 و 100',
  mustBePositive: 'يجب أن تكون القيمة رقماً أكبر من صفر',
  typeFixedOption: 'مبلغ ثابت',
  typePercentageOption: 'نسبة',
  nextMonth: 'Go to the Next Month',
};

// مفاتيح ورسايل الـ API للكوبونات.
export const couponApi = {
  createdKey: 'coupon_created',
  fetchedKey: 'coupons_fetched',
  shownKey: 'coupon_success',
  updatedKey: 'coupon_updated',
  deletedKey: 'coupon_deleted',
  statusKey: 'coupon_status_updated',
  codeKey: 'coupon_code_generated',
  cannotActivateKey: 'coupon_cannot_activate',
  cannotActivateMessage: 'لا يمكن تفعيل كوبون مجدول او منتهي الصلاحية أو مكتمل الاستخدام.',
  duplicateMessage: 'هذا الكوبون موجود بالفعل.',
};

// ───── 13. صفحة "أدواتي" (النصوص اللي بتظهر فيها) ─────

export const myToolsTexts = {
  // كروت الإحصائيات الثلاثة فوق الجدول.
  activeTotal: 'اجمالي الادوات المفعلة',
  inactiveTotal: 'اجمالي الادوات غير المفعلة',
  scheduledTotal: 'اجمالي الادوات المجدولة',
  // أسماء أعمدة الجدول بالترتيب.
  headers: ['اسم الأداة', 'الوصف', 'حالة الأداة', 'الجدولة', 'تفعيل/إيقاف', 'الإجراءات'],
  // زرار "جدولة الادوات" بيفتح صفحة الجدولة.
  scheduleButton: 'جدولة الادوات',
  // زراير الصف: المعاينة والتخصيص (التخصيص بيبقى مكتوب بعده اسم الأداة).
  previewButton: 'معاينة الأداة',
  editButtonPrefix: 'تخصيص',
  // حالة الجدولة لأداة مش مجدولة.
  notScheduled: 'غير مجدولة',
  // اختيارات "العناصر في الصفحة" والاختيار الافتراضي.
  pageSizes: ['5', '10', '25', '50'],
  defaultPageSize: '10',
};

// ───── 14. لوحة التحكم (صفحة "لوحة التحكم" و endpoints الـ Tool Statistics) ─────

// النصوص اللي بتظهر في لوحة التحكم بالعربي.
export const dashboardTexts = {
  title: 'لوحة التحكم',
  subtitle: 'إحصائيات عامة',
  documentTitle: 'لوحة التحكم | توليفاي',
  // الكروت التلاتة فوق: عناوينها وجملة المقارنة.
  activeTotal: 'إجمالي الأدوات المفعلة',
  clicks: 'إجمالي عدد النقرات',
  views: 'إجمالي المرور الكلي',
  compare: 'مقارنة بالأسبوع الماضي',
  // الأقسام.
  activeSection: 'الأدوات المفعلة',
  showAll: 'عرض الكل',
  topSection: 'أكثر الأدوات تفاعلاً',
  interaction: 'تفاعل',
  chartTitle: 'نشاط الأدوات',
  // شارة الاشتراك لما يكون قرّب على الانتهاء.
  expiringSoon: 'تنتهي قريباً',
  // أزرار الشريط العلوي والجانبي.
  themeButton: 'Toggle theme',
  languageButton: 'تغيير اللغة',
  collapseButton: 'طي الشريط الجانبي',
};

// نفس النصوص بالإنجليزي (بعد تغيير اللغة).
export const dashboardTextsEn = {
  activeTotal: 'Total enabled tools',
  clicks: 'Total clicks',
  views: 'Total visits',
  compare: 'Compared to last week',
  activeSection: 'Activated tools',
  showAll: 'Show all',
  expiringSoon: 'Expiring soon',
};

// روابط الشريط الجانبي (غير "لوحة التحكم" نفسها). صفحة العملاء مش ضمن النطاق فمش موجودة هنا.
export const sidebarLinks = [
  { name: 'الأدوات', path: paths.tools },
  { name: 'أدواتي', path: paths.myTools },
  { name: 'الجدولة', path: paths.scheduling },
  { name: 'الكوبونات', path: paths.coupons },
  { name: 'الملف الشخصي', path: paths.profile },
];

// مفاتيح الـ API وحدودها.
export const statisticsApi = {
  dashboardKey: 'tool_statistics_success',
  toolKey: 'tool_statistic_summary_success',
  trackedKey: 'tool_statistics_batch_queued',
  notOwnedKey: 'tool_not_owned',
  // ترتيب الكروت في رد لوحة التحكم، وفي رد أداة واحدة.
  cardKeys: ['active_tools', 'clicks', 'views'],
  toolCardKeys: ['views', 'clicks'],
  // أقصى عدد في قايمة "أكثر الأدوات تفاعلاً".
  topLimit: 5,
  // الـ API بيسمح بـ 10 طلبات إحصائيات في الدقيقة، فبنكتفي بـ 9 عشان نفضل بعيد عن الحد.
  maxCallsPerMinute: 9,
  // فترة قديمة (فيها 10 أيام) بنجرّب بيها فلتر التاريخ.
  oldRange: { from: '2026-11-01', to: '2026-11-10', days: 10 },
};

// فلاتر تاريخ غلط: الـ API لازم يرفضها بـ 422.
export const invalidDateFilters: { name: string; params: Record<string, string> }[] = [
  { name: 'end date without start date', params: { to: '2026-11-10' } },
  { name: 'start date without end date', params: { from: '2026-11-01' } },
  { name: 'end date before start date', params: { from: '2026-11-10', to: '2026-11-01' } },
  { name: 'end date in the future', params: { from: '2026-11-01', to: '2030-01-01' } },
  { name: 'text instead of a date', params: { from: 'abc', to: '2026-11-10' } },
  { name: 'date that does not exist', params: { from: '2026-13-45', to: '2026-11-10' } },
  { name: 'range longer than 366 days', params: { from: '2020-01-01', to: '2026-11-17' } },
];

// جسم تسجيل تفاعل صحيح لأداة (نقرات ومرور).
export function trackBody(merchantToolId: number, clicks = 3, hovers = 5, occurredAt?: string) {
  return { interactions: [{ merchant_tool_id: merchantToolId, clicks, hovers, ...(occurredAt ? { occurred_at: occurredAt } : {}) }] };
}

// أجسام تسجيل تفاعل غلط: لازم 422 (الفاليديشن قبل البحث عن الأداة، فبنستخدم id مش موجود).
export const invalidTrackBodies = [
  { name: 'empty body', body: {} },
  { name: 'empty list', body: { interactions: [] } },
  { name: 'list is a text', body: { interactions: 'x' } },
  { name: 'missing tool id', body: { interactions: [{ clicks: 1, hovers: 1 }] } },
  { name: 'missing clicks', body: { interactions: [{ merchant_tool_id: unknownId, hovers: 1 }] } },
  { name: 'missing hovers', body: { interactions: [{ merchant_tool_id: unknownId, clicks: 1 }] } },
  { name: 'negative clicks', body: trackBody(unknownId, -1, 0) },
  { name: 'text instead of a number', body: { interactions: [{ merchant_tool_id: unknownId, clicks: 'a', hovers: 0 }] } },
  { name: 'zero clicks and zero hovers', body: trackBody(unknownId, 0, 0) },
  { name: 'time that is not a date', body: trackBody(unknownId, 1, 1, 'nope') },
  { name: 'time long in the past', body: trackBody(unknownId, 1, 1, '2020-01-01T00:00:00Z') },
  { name: 'more than 50 items', body: { interactions: Array.from({ length: 51 }, () => trackBody(unknownId).interactions[0]) } },
];

// ───── 15. المتجر (الـ endpoints العامة اللي سكريبت Tooliify بينده عليها من جوه المتجر + الملف العام) ─────

// أداة آراء العملاء: بنضيفها بالـ API عشان نجرّب إرسال التقييمات (الاسم في الكتالوج وid الأداة).
export const reviewsTool = { name: 'آراء العملاء', slug: 'customer-reviews', id: 1 };

// جسم API لإضافة أداة آراء العملاء: نفس الإعدادات اللي صفحة الـ builder بتحفظها (منسوخة من المتصفح).
export const reviewsToolBody = (name: string) => ({
  merchant_tool_id: null,
  name,
  schedule: { Enabled: false, start_at: null, end_at: null },
  config: {
    icon_style: 'Message',
    icon_title: 'آراء العملاء',
    widget_size: 50,
    local_appear: 'all_pages',
    add_move_icon: true,
    device_appear: ['phone', 'desktop'],
    icon_position: 'right',
    ratings_count: 5,
    average_rating: 3.5,
    type_move_icon: 'waves',
    comments_source: 'merchant',
    vertical_margin: 5,
    customer_reviews: [],
    merchant_reviews: [
      { name: 'شهد هشام', image: null, id_num: 1, rating: 5, comment: 'تجربة رائعة وخدمة ممتازة. أنصح بالتعامل مع هذا المتجر بكل ثقة.' },
    ],
    horizontal_margin: 5,
    comment_text_color: '#111827',
    notification_shape: 'circle',
    allow_customer_comments: true,
    notification_text_color: '#FFFFFF',
    comment_background_color: '#FFFFFF',
    notification_background_color: '#4F3A99',
  },
  enabled: true,
});

// الأحداث اللي المتجر بيبعتها لـ POST /tracking/tools/{id}، والأحداث الغلط.
export const trackingEvents = ['view', 'hover', 'click', 'submission', 'conversion'];
export const invalidTrackingEvents: { name: string; body: unknown }[] = [
  { name: 'no event', body: {} },
  { name: 'empty event', body: { event: '' } },
  { name: 'event that does not exist', body: { event: 'foo' } },
  { name: 'number instead of an event', body: { event: 5 } },
];

// زرار شريط الكوكيز اللي بيظهر في المتجر لما أداة الكوكيز تكون مفعّلة.
export const storeTexts = { accept: 'قبول' };

// الصورة اللي بنرفعها مع التقييم (صورة التست الموجودة في test-data).
export const reviewImage = { file: 'test-data/qa-image.png', name: 'qa.png', mimeType: 'image/png' };

// تقييم صحيح من زائر (بدون id الأداة، بنضيفه في التست).
export const validReview = { name: 'QA Visitor', rating: '5', comment: 'QA review comment' };

// تقييمات غلط: كل واحد لازم يرجّع 422 (بنبدّل حقل واحد من التقييم الصحيح، و null معناها نشيل الحقل).
export const invalidReviews: { name: string; change: Record<string, string | null> }[] = [
  { name: 'no name', change: { name: null } },
  { name: 'no comment', change: { comment: null } },
  { name: 'no rating', change: { rating: null } },
  { name: 'rating 0', change: { rating: '0' } },
  { name: 'rating 6', change: { rating: '6' } },
  { name: 'rating is a text', change: { rating: 'abc' } },
  { name: 'name longer than 255 characters', change: { name: 'N'.repeat(256) } },
  { name: 'no tool id', change: { merchant_tool_id: null } },
  { name: 'tool that does not exist', change: { merchant_tool_id: String(unknownId) } },
];

// تعليق فيه كود HTML: السيرفر المفروض ما يخزنهوش زي ما هو.
export const htmlComment = '<img src=x onerror="alert(1)"> QA';

// مفاتيح الـ API وحدودها لتستات المتجر.
export const storefrontApi = {
  reviewKey: 'customer_review_stored',
  // أداة موقوفة أو مش مضافة.
  toolNotAddedKey: 'customer_import_tool_not_added',
  // الملف العام: أقل حجم منطقي ونوعه.
  scriptMinLength: 1000,
  scriptType: 'application/javascript',
  // ملف تاجر مش موجود.
  missingScript: 'https://files.tooliify.com/newtoolify_999999999.js',
};

// الجدولة في المتجر: ملف المتجر بيتحدّث بعد ثواني من أي تغيير، ومن غير ما نستنى أكتر من كده.
export const storeWait = { fileSeconds: 120, pageSeconds: 60 };
