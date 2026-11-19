import { Page, Locator } from '@playwright/test';
import { paths, couponTexts } from '../../../test-data/test-data';

// Page Object لصفحة "إضافة كوبون جديد" (/ar/coupons/new) وصفحة "تعديل الكوبون" (/ar/coupons/<id>): نفس النموذج.
export class CouponFormPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly codeInput: Locator;
  readonly generateButton: Locator;
  readonly typeSelect: Locator;
  readonly shippingSelect: Locator;
  // الخانات الرقمية بترتيبها في الصفحة: قيمة الخصم، عدد المستخدمين، مرات الاستخدام للعميل، أقل مبلغ شراء، أقصى مبلغ تخفيض.
  readonly discountInput: Locator;
  readonly maxUsersInput: Locator;
  readonly perCustomerInput: Locator;
  readonly minPurchaseInput: Locator;
  readonly maxDiscountInput: Locator;
  readonly startDate: Locator;
  readonly endDate: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByPlaceholder(couponTexts.namePlaceholder);
    this.codeInput = page.getByPlaceholder(couponTexts.codePlaceholder);
    this.generateButton = page.getByText(couponTexts.generateCode);
    this.typeSelect = page.getByRole('combobox').nth(0);
    this.shippingSelect = page.getByRole('combobox').nth(1);
    const numbers = page.locator('input[type="number"]');
    this.discountInput = numbers.nth(0);
    this.maxUsersInput = numbers.nth(1);
    this.perCustomerInput = numbers.nth(2);
    this.minPurchaseInput = numbers.nth(3);
    this.maxDiscountInput = numbers.nth(4);
    this.startDate = page.locator('[data-slot="popover-trigger"]').nth(0);
    this.endDate = page.locator('[data-slot="popover-trigger"]').nth(1);
    this.saveButton = page.getByRole('button', { name: couponTexts.saveButton });
  }

  // نفتح صفحة كوبون جديد.
  async openNew() {
    await this.page.goto(paths.newCoupon, { waitUntil: 'domcontentloaded' });
    await this.nameInput.waitFor();
  }

  // نفتح صفحة تعديل كوبون بالـ id بتاعه.
  async openEdit(id: number) {
    await this.page.goto(`${paths.coupons}/${id}`, { waitUntil: 'domcontentloaded' });
    await this.nameInput.waitFor();
    // الصفحة بتملا الخانات بعد ما تجيب الكوبون، فنستنى لحد ما الرمز يتكتب.
    await this.page.waitForFunction(() => (document.querySelector('input[placeholder="SA20"]') as HTMLInputElement | null)?.value !== '');
  }

  // نختار يوم من التقويم: نفتح التقويم من الخانة، ننتقل للشهر الجاي (عشان التاريخ يبقى في المستقبل)، ونضغط على اليوم.
  // اليوم من 10 لـ 20 عشان يظهر مرة واحدة بس في الشبكة. التقويم القديم بيفضل ثانية في الصفحة، فبناخد الأخير.
  async pickDate(trigger: Locator, day: number) {
    await trigger.click();
    await this.page.getByRole('button', { name: couponTexts.nextMonth }).last().click();
    await this.page.locator('td[role="gridcell"] button', { hasText: new RegExp(`^${day}$`) }).last().click();
    await this.page.waitForTimeout(1000);
  }

  // نختار اختيار من قايمة (بنفتحها ونضغط الاختيار).
  async choose(select: Locator, option: string) {
    await select.click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
  }

  // نملا نموذج كوبون صحيح: الاسم والرمز وقيمة الخصم والتواريخ (من 10 لـ 20 الشهر الجاي). باقي الخانات بقيمها الافتراضية.
  async fillValid(name: string, code: string, discount = '15') {
    await this.nameInput.fill(name);
    await this.codeInput.fill(code);
    await this.discountInput.fill(discount);
    await this.pickDate(this.startDate, 10);
    await this.pickDate(this.endDate, 20);
  }
}
