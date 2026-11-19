import { Page, Locator } from '@playwright/test';
import { paths, validMerchant } from '../../../test-data/test-data';

// Page Object لصفحة بروفايل التاجر (SRS 10.15). الصفحة بتعرض البيانات بس،
// والتعديل بيحصل في نافذتين (شوفي EditProfileModal و ChangePasswordModal).
export class ProfilePage {
  readonly page: Page;
  readonly emailText: Locator;
  readonly editButton: Locator;
  readonly changePasswordButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailText = page.getByText(validMerchant.email).first();
    this.editButton = page.getByRole('button', { name: 'تعديل البيانات' });
    this.changePasswordButton = page.getByRole('button', { name: 'تعديل كلمة المرور' });
  }

  // نفتح صفحة البروفايل (المسار من بيانات التست).
  async open() {
    // نروح لـ BASE_URL + PROFILE_PATH. بنستنى تحميل الـ HTML بس لأن الصفحة دي بطيئة في التحميل.
    await this.page.goto(paths.profile, { waitUntil: 'domcontentloaded' });
    await this.editButton.waitFor();
  }
}
