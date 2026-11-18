// نستورد أنواع Playwright (الصفحة والـ Locator).
import { Page, Locator } from '@playwright/test';
// نستورد بيانات التست (المسارات، بيانات الأداة، صورة التست، الكوبون).
import { paths, ToolData, qaImagePath, coupon } from '../../../test-data/test-data';

// Page Object لصفحة تخصيص الأداة "/ar/tools/<slug>" (بتتفتح بزرار "إضافة الأداة" من الكتالوج).
// حفظ النموذج هنا هو اللي "بيضيف" الأداة لصفحة "أدواتي" (SRS 10.9).
// صفحة تعديل أداة متضافة ("/ar/my-tools/<slug>/<id>") فيها نفس الحقول ونفس الأزرار.
export class ToolBuilderPage {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // حقل "اسم الاداة".
  readonly nameInput: Locator;
  // حقل الرابط (موجود في أدوات زي فيسبوك بس).
  readonly linkInput: Locator;
  // زرار "حفظ التعديلات" (بيحفظ وبيضيف الأداة).
  readonly saveButton: Locator;
  // زرار "رجوع" (بيرجع للكتالوج ومبيحفظش حاجة).
  readonly backButton: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // الحقول: بنلاقيها بالـ name attribute بتاعها في الصفحة الحقيقية.
    this.nameInput = page.locator('input[name="name"]');
    this.linkInput = page.locator('input[name="config.url"]');
    // الأزرار: بنلاقيها بأسمائها العربي.
    this.saveButton = page.getByRole('button', { name: 'حفظ التعديلات' });
    this.backButton = page.getByRole('button', { name: 'رجوع' });
  }

  // نفتح صفحة تخصيص أداة معينة مباشرة من الـ slug بتاعها.
  async open(slug: string) {
    // نروح لـ BASE_URL + /ar/tools/<slug>.
    await this.page.goto(`${paths.tools}/${slug}`, { waitUntil: 'domcontentloaded' });
    // نستنى لحد ما النموذج يجهز.
    await this.nameInput.waitFor();
  }

  // عنوان الصفحة "تخصيص أداة <الاسم>" (في أدوات معينة مفيش كلمة "أداة" زي "تخصيص شارات الثقة").
  heading(toolName: string): Locator {
    return this.page.getByRole('heading', { name: new RegExp(`^تخصيص (أداة )?${toolName}$`) });
  }

  // نكتب اسم (ورابط لو الأداة ليها رابط) ونضغط حفظ.
  async saveWithName(name: string, link?: string) {
    // نبدّل الاسم الافتراضي.
    await this.nameInput.fill(name);
    // نكتب الرابط.
    if (link !== undefined) await this.linkInput.fill(link);
    // نضغط حفظ.
    await this.saveButton.click();
  }

  // بنختار الكوبون في قوايم الكوبونات ("اختر كوبون الخصم") الظاهرة حاليًا، بالكود اللي في test-data.
  private async chooseVisibleCoupons() {
    // القوايم اللي لسه مكتوب فيها النص الافتراضي (القوايم في التابات المخفية بنتجاهلها). القايمة بتقل بعد كل اختيار.
    const emptyLists = this.page.getByText('اختر كوبون الخصم').filter({ visible: true });
    for (let tries = 0; tries < 10 && (await emptyLists.count()) > 0; tries++) {
      await emptyLists.first().click();
      await this.page.getByRole('option', { name: coupon.code }).click();
    }
  }

  // بنختار كوبون الخصم في كل قوايم الكوبونات في الـ builder (بعض الأدوات فيها أكتر من قايمة، في تابات أو أقسام مطوية مختلفة).
  async chooseCoupon() {
    // نعدّي على كل تابات النموذج.
    const tabs = this.page.getByRole('tab');
    for (let i = 0; i < (await tabs.count()); i++) {
      await tabs.nth(i).click();
      // الأقسام المطوية في التاب (مثلًا "مكافأة المرحلة الثانية"). لما نفتح قسم الباقي بيتقفل.
      const sections = this.page.getByRole('tabpanel').locator('button[aria-expanded]:not([role="combobox"])');
      const total = await sections.count();
      // تاب من غير أقسام: نختار الكوبونات الظاهرة فيه على طول.
      if (total === 0) await this.chooseVisibleCoupons();
      // تاب فيه أقسام: نفتح كل قسم وننتقي الكوبون بتاعه قبل ما نفتح القسم اللي بعده.
      for (let s = 0; s < total; s++) {
        if ((await sections.nth(s).getAttribute('aria-expanded')) === 'false') {
          await sections.nth(s).click();
          // نستنى حركة فتح القسم تخلص.
          await this.page.waitForTimeout(500);
        }
        // القايمة الأولى بس: قوايم الأقسام التانية (المطوية) مش قابلة للاستخدام لسه.
        const emptyLists = this.page.getByText('اختر كوبون الخصم').filter({ visible: true });
        if ((await emptyLists.count()) > 0) {
          await emptyLists.first().click();
          await this.page.getByRole('option', { name: coupon.code }).click();
        }
      }
    }
    // نرجع للتاب الأول (اللي فيه زرار الحفظ كمان).
    await tabs.first().click();
  }

  // أدوات الرابط والهاتف بنكتب فيها القيمة المميزة بتاعة الاستور في حقل الرابط، والباقي في حقل نصي من النموذج.
  private usesLinkField(tool: ToolData): boolean {
    return tool.storeKind === 'url' || tool.storeKind === 'phone';
  }

  // نكتب قيمة في حقل الاستور بتاع الأداة. الحقل ممكن يكون في تاب تاني أو جوه قسم مطوي،
  // فبنفتح التابات (وأقسامها المطوية) لحد ما الحقل يظهر.
  async fillStoreField(tool: ToolData, value: string) {
    const field = this.page.locator(`[name="${tool.storeField}"]`).first();
    const tabs = this.page.getByRole('tab');
    // بعض الأدوات بتحط الحقل في قسم مطوي بيتفتح بالضغط على عنوانه.
    if (tool.storeSection && !(await field.isVisible())) {
      await this.page.getByText(tool.storeSection, { exact: true }).first().click();
      await field.waitFor();
    }
    for (let i = 0; !(await field.isVisible()) && i < (await tabs.count()); i++) {
      await tabs.nth(i).click();
      // نفتح الأقسام المطوية في التاب واحد واحد لحد ما الحقل يظهر.
      const folded = this.page.getByRole('tabpanel').locator('button[aria-expanded="false"]:not([role="combobox"])');
      for (let j = 0; !(await field.isVisible()) && j < (await folded.count()); j++) {
        await folded.nth(j).click();
        await this.page.waitForTimeout(500);
      }
    }
    await field.fill(value);
  }

  // نحط صورة التست في كل صندوق رفع في النموذج (الصناديق دي حقول ملفات مخفية، فبنحط الملف مباشرة).
  async uploadImages() {
    const boxes = this.page.locator('input[type="file"]');
    for (let i = 0; i < (await boxes.count()); i++) await boxes.nth(i).setInputFiles(qaImagePath);
    // نستنى الرفع يخلص.
    await this.page.waitForTimeout(3000);
  }

  // نملا روابط التواصل اللي الأداة محتاجاها: "all" = كل روابط تاب "الروابط"، و"one" = نفعّل وسيلة تواصل واحدة ونديها رابط.
  async fillSocialLinks(mode: 'all' | 'one') {
    if (mode === 'all') {
      await this.page.getByRole('tab', { name: 'الروابط', exact: true }).click();
      const links = this.page.locator('input[name$=".url"]');
      for (let i = 0; i < (await links.count()); i++) {
        // رابط الإيميل لازم يتكتب كرابط (mailto:)، والباقي بعنوان عادي.
        const isEmail = (await links.nth(i).getAttribute('type')) === 'email';
        await links.nth(i).fill(isEmail ? 'mailto:qa@example.com' : 'https://example.com/qa');
      }
    } else {
      // الصندوق الأول هو "إضافة وسائل تواصل"، والتاني هو أول وسيلة تواصل، وبعد تفعيله بيظهر حقل رابطه.
      await this.page.getByRole('checkbox').nth(1).click();
      await this.page.locator('input[name="config.social_links.0.url"]').fill('https://x.com/tooliify');
    }
  }

  // بنضيف مجموعة منتجات واحدة: منتج أساسي ومنتج مرتبط، الاتنين من منتجات المتجر.
  async addProductGroup() {
    // نموذج المجموعة موجود في التاب الأول.
    await this.page.getByRole('tab').first().click();
    await this.page.getByRole('button', { name: 'إضافة مجموعة' }).first().click();
    const lists = this.page.getByRole('combobox');
    // المنتج الأساسي: أول منتج.
    await lists.nth(0).click();
    await this.page.getByRole('option').first().click();
    // المنتج المرتبط: أول منتج مش معطّل (المنتج الأساسي بيظهر كـ "مستخدم بالفعل").
    await lists.nth(1).click();
    await this.page.locator('[role="option"]:not([aria-disabled="true"])').first().click();
    await this.page.keyboard.press('Escape');
    // نضيف المجموعة لقايمة المجموعات.
    await this.page.getByRole('button', { name: 'إضافة إلى المجموعات' }).click();
  }

  // نختار مكان الأداة في المتجر (تاب "الظهور").
  async choosePosition(position: string) {
    await this.page.getByRole('tab', { name: 'الظهور', exact: true }).click();
    // أغلب الأدوات ليها قايمة أماكن، أما شارات الثقة فعندها اختيارين مكتوبين في الصفحة.
    const list = this.page.getByRole('combobox');
    if ((await list.count()) > 0) {
      await list.first().click();
      await this.page.getByRole('option', { name: position, exact: true }).click();
    } else {
      await this.page.getByText(position, { exact: true }).first().click();
    }
  }

  // بنملا نموذج أداة صحيحة (الاسم، الرابط، الكوبون، المنتجات، المكان) ونضغط حفظ.
  // "storeValue" قيمة مميزة بنستخدمها في تستات الاستور.
  async saveTool(tool: ToolData, name: string, storeValue?: string) {
    // الكوبون بيتختار الأول لأن اختياره ممكن يرجّع حقول تانية لقيمتها الافتراضية.
    if (tool.coupon) await this.chooseCoupon();
    // الاسم بيتكتب الأول لأن كتابة حقل الاستور في تاب تاني بتسيب النموذج على التاب ده، واللي فيه خانة الاسم مخفية.
    await this.nameInput.fill(name);
    // أدوات الرابط والهاتف: حقل الرابط بيشيل القيمة المميزة (أو الرابط العادي).
    const link = storeValue && this.usesLinkField(tool) ? storeValue : tool.link;
    if (link !== undefined) await this.linkInput.fill(link);
    // الأدوات اللي محتاجة صورة أو روابط تواصل.
    if (tool.image) await this.uploadImages();
    if (tool.socialLinks) await this.fillSocialLinks(tool.socialLinks);
    // باقي الأدوات: القيمة المميزة بتتكتب في حقلها النصي.
    if (storeValue && !this.usesLinkField(tool)) await this.fillStoreField(tool, storeValue);
    // أدوات المنتجات: لازم مجموعة منتجات واحدة.
    if (tool.products) await this.addProductGroup();
    // الأدوات اللي بتشارك مكانها الافتراضي مع أداة حقيقية على الحساب بننقلها لمكان تاني.
    if (tool.position) await this.choosePosition(tool.position);
    // نضغط حفظ.
    await this.saveButton.click();
  }

  // نغيّر قيمة الاستور لأداة متضافة (صفحة التعديل) ونضغط حفظ.
  async saveStoreValue(tool: ToolData, value: string) {
    if (this.usesLinkField(tool)) await this.linkInput.fill(value);
    else await this.fillStoreField(tool, value);
    await this.saveButton.click();
  }

  // نضيف أداة بالطريقة العادية ونستنى لحد ما تتحفظ (الصفحة بتنتقل لـ /ar/my-tools/<slug>/<id>).
  // الحفظ بطيء على staging (لحد حوالي 25 ثانية)، فالانتظار طويل.
  async addAndWait(tool: ToolData, name: string, storeValue?: string) {
    // نفتح الـ builder ونملا ونحفظ.
    await this.open(tool.slug);
    // بنسجّل لو الصفحة بعتت طلب POST للسيرفر (الحفظ).
    let sent = false;
    this.page.on('request', (request) => {
      if (request.method() === 'POST') sent = true;
    });
    await this.saveTool(tool, name, storeValue);
    // ساعات ضغطة "حفظ" مبتبعتش أي طلب للسيرفر (بتحصل مرة من كل كام تشغيل): لو مفيش طلب اتبعت بعد 5 ثواني نضغط تاني.
    await this.page.waitForTimeout(5000);
    if (!sent && !/\/\d+$/.test(this.page.url())) await this.saveButton.click();
    // نستنى صفحة تعديل الأداة الجديدة.
    await this.page.waitForURL(new RegExp(`${paths.myTools}/${tool.slug}/\\d+$`), { timeout: 60_000 });
    // نستنى لحد ما نموذجها يجهز.
    await this.nameInput.waitFor();
  }
}
