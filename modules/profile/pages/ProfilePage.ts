// نستورد أنواع Playwright.
import { Page, Locator } from '@playwright/test';
// نستورد بيانات التست (المسارات وبيانات الدخول).
import { paths, validMerchant } from '../../../test-data/test-data';

// Page Object لصفحة بروفايل التاجر (SRS 10.15). الصفحة بتعرض البيانات بس،
// والتعديل بيحصل في نافذتين (شوفي EditProfileModal و ChangePasswordModal).
export class ProfilePage {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // إيميل التاجر المعروض في الصفحة.
  readonly emailText: Locator;
  // زرار "تعديل البيانات" (بيفتح نافذة التعديل).
  readonly editButton: Locator;
  // زرار "تعديل كلمة المرور" (بيفتح نافذة تغيير كلمة المرور).
  readonly changePasswordButton: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // الإيميل: بنلاقيه من نصه (حساب التاجر من بيانات التست).
    this.emailText = page.getByText(validMerchant.email).first();
    // الأزرار: بنلاقيها بأسمائها العربي.
    this.editButton = page.getByRole('button', { name: 'تعديل البيانات' });
    this.changePasswordButton = page.getByRole('button', { name: 'تعديل كلمة المرور' });
  }

  // نفتح صفحة البروفايل (المسار من بيانات التست).
  async open() {
    // نروح لـ BASE_URL + PROFILE_PATH. بنستنى تحميل الـ HTML بس لأن الصفحة دي بطيئة في التحميل.
    await this.page.goto(paths.profile, { waitUntil: 'domcontentloaded' });
    // نستنى لحد ما الأزرار تجهز.
    await this.editButton.waitFor();
  }
}
