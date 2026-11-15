// ملف واحد لكل بيانات التست وبيانات الدخول. التستات بتستورد منه اللي محتاجاه،
// ومفيش إيميل أو باسورد أو توكن أو رقم هاتف أو مسار أو رسالة بتتكتب جوه كود التست نفسه.

// بيانات الدخول الحقيقية "مش" مكتوبة هنا (الملف ده ممكن يتشارك). بتتقرا من ملف .env.

// ======================================================================
// 1. العناوين والمسارات
// ======================================================================

// عنوان الـ API بتاع الباك إند (لو فاضي تستات الـ API بتتخطى).
export const apiUrl = process.env.API_URL ?? '';

// مسارات الصفحات (عنوان الموقع نفسه هو BASE_URL في ملف .env).
export const paths = {
  // صفحة تسجيل الدخول.
  login: process.env.LOGIN_PATH ?? '/ar/auth',
  // الصفحة الرئيسية للوحة التحكم (افتراض مننا – غيّريها لو المسار الحقيقي مختلف).
  home: '/ar',
  // صفحة البروفايل.
  profile: process.env.PROFILE_PATH ?? '/ar/profile',
  // صفحة كتالوج الأدوات ("الأدوات").
  tools: '/ar/tools',
  // صفحة أدواتي ("أدواتي").
  myTools: '/ar/my-tools',
};

// ======================================================================
// 2. الحسابات (بيانات الدخول بتيجي من .env)
// ======================================================================

// حساب التاجر الفعّال اللي أغلب التستات بتستخدمه.
export const validMerchant = {
  // الإيميل من .env (نص فاضي لو مش موجود، فالتست يفشل برسالة واضحة).
  email: process.env.MERCHANT_EMAIL ?? '',
  // كلمة المرور من .env.
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

// ======================================================================
// 3. الإيميلات
// ======================================================================

// إيميل "مش" مسجّل في Tooliify (SRS 10.2 Alt 2). مبيحسبش محاولات فاشلة على الحساب الحقيقي.
export const unregisteredEmail = 'qa.not.registered.tooliify@example.com';

// إيميلات شكلها غلط (SRS 10.2: لازم تبقى بشكل name@domain.com).
export const invalidEmails = ['merchant', 'merchant@', '@tooliify.com', 'merchant tooliify@mail.com'];

// ======================================================================
// 4. كلمات المرور
// ======================================================================

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

// ======================================================================
// 5. رموز OTP وتوكنز مزيّفة
// ======================================================================

// رمز من 6 أرقام (غالبًا) غلط – بيتستخدم في تست واجهة الرمز الغلط.
export const wrongOtp = '000000';

// توكن مش موجود (لازم يرجّع 401).
export const fakeJwt = 'invalid.jwt.token';

// reset token مش موجود (لازم يترفض).
export const fakeResetToken = 'fake-reset-token';

// ======================================================================
// 6. أرقام الهاتف (البروفايل)
// ======================================================================

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

// ======================================================================
// 7. أجسام طلبات الـ API
// ======================================================================

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

// ======================================================================
// 8. كتالوج الأدوات (SRS 10.8)
// ======================================================================

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

// ======================================================================
// 9. أدواتي – الإضافة والحذف (SRS 10.9 و 10.10)
// ======================================================================

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

// ----------------------------------------------------------------------
// الـ 33 أداة في الكتالوج. كل أداة ليها فولدر لوحدها: modules/tools/<slug>/
// فيه ملفات view / search / add / edit / delete / store. التستات بتقرا الأداة من هنا.
// ----------------------------------------------------------------------

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

// ======================================================================
// 10. الرسايل المتوقعة (منسوخة حرفيًا من الـ SRS)
// ======================================================================

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
