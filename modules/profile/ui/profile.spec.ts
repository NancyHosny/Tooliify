import { test, expect } from '../../shared/bug-capture';
import { ProfilePage } from '../pages/ProfilePage';
import { EditProfileModal } from '../pages/EditProfileModal';
import { validMerchant, validPhones, invalidPhones, messages } from '../../../test-data/test-data';

// تستات البروفايل (SRS 10.15). بتشتغل في project اسمه "ui-merchant": التاجر بيبقى عامل تسجيل دخول جاهز.

// تستات بتقرا البيانات بس (مفيش حاجة بتتحفظ).
test.describe('Profile – view data (SRS 10.15)', () => {
  // الـ Page Objects، بتتعمل من جديد لكل تست.
  let profilePage: ProfilePage;
  let editModal: EditProfileModal;

  // قبل كل تست: نفتح صفحة البروفايل.
  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    editModal = new EditProfileModal(page);
    await profilePage.open();
  });

  // البروفايل بيعرض إيميل التاجر المسجّل دخول.
  test('profile shows the merchant email', { tag: '@smoke' }, async () => {
    await expect(profilePage.emailText).toBeVisible();
  });

  // نافذة التعديل بتتفتح وفيها البيانات الحالية.
  test('edit popup shows the current email', { tag: '@regression' }, async () => {
    await profilePage.editButton.click();
    await expect(editModal.emailInput).toHaveValue(validMerchant.email);
  });

  // الاسم والإيميل مينفعش يتعدّلوا (SRS 10.15: عرض فقط).
  test('name and email are read-only', { tag: '@regression' }, async () => {
    await profilePage.editButton.click();
    await expect(editModal.nameInput).not.toBeEditable();
    await expect(editModal.emailInput).not.toBeEditable();
  });
});

// تستات بتحفظ رقم الهاتف. الرقم الأصلي بيترجّع دايمًا بعد كل تست.
test.describe('Profile – phone number (SRS 10.15)', () => {
  // الـ Page Objects، والرقم اللي كان على الحساب قبل التست.
  let profilePage: ProfilePage;
  let editModal: EditProfileModal;
  let originalPhone = '';

  // قبل كل تست: نفتح نافذة التعديل ونفتكر الرقم الحالي.
  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    editModal = new EditProfileModal(page);
    await profilePage.open();
    await profilePage.editButton.click();
    originalPhone = await editModal.phoneInput.inputValue();
  });

  // بعد كل تست: نرجّع الرقم الأصلي لو اتغيّر.
  test.afterEach(async () => {
    await profilePage.open();
    await profilePage.editButton.click();
    if ((await editModal.phoneInput.inputValue()) !== originalPhone) {
      await editModal.savePhone(originalPhone);
    }
  });

  // تست لكل رقم صحيح (الحد الأدنى، عادي، الحد الأقصى).
  for (const phone of validPhones) {
    test(`valid phone is saved: ${phone.name}`, { tag: '@regression' }, async ({ page }) => {
      await editModal.savePhone(phone.full);
      await expect(page.getByText(messages.saved)).toBeVisible();
      await profilePage.open();
      await profilePage.editButton.click();
      await expect(editModal.phoneInput).toHaveValue(phone.full);
    });
  }

  // تست لكل رقم غلط (قاعدة الـ SRS: "+" وبعدها من 8 لـ 15 رقم).
  for (const phone of invalidPhones) {
    test(`invalid phone is rejected: ${phone.name}`, { tag: '@regression' }, async ({ page }) => {
      await editModal.savePhone(phone.full);
      await expect(page.getByText(messages.invalidPhone)).toBeVisible();
    });
  }
});
