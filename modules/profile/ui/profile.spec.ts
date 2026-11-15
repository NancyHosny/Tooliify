// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Objects.
import { ProfilePage } from '../pages/ProfilePage';
import { EditProfileModal } from '../pages/EditProfileModal';
// نستورد بيانات التست.
import { validMerchant, validPhones, invalidPhones, messages } from '../../../test-data/test-data';

// تستات البروفايل (SRS 10.15). بتشتغل في project اسمه "ui-merchant": التاجر بيبقى عامل تسجيل دخول جاهز.

// تستات بتقرا البيانات بس (مفيش حاجة بتتحفظ).
test.describe('Profile – view data (SRS 10.15)', () => {
  // الـ Page Objects، بتتعمل من جديد لكل تست.
  let profilePage: ProfilePage;
  let editModal: EditProfileModal;

  // قبل كل تست: نفتح صفحة البروفايل.
  test.beforeEach(async ({ page }) => {
    // نعمل الـ Page Objects.
    profilePage = new ProfilePage(page);
    editModal = new EditProfileModal(page);
    // نفتح صفحة البروفايل.
    await profilePage.open();
  });

  // البروفايل بيعرض إيميل التاجر المسجّل دخول.
  test('profile shows the merchant email', { tag: '@smoke' }, async () => {
    // المتوقع: الإيميل اللي في .env ظاهر في الصفحة.
    await expect(profilePage.emailText).toBeVisible();
  });

  // نافذة التعديل بتتفتح وفيها البيانات الحالية.
  test('edit popup shows the current email', { tag: '@regression' }, async () => {
    // نفتح نافذة التعديل.
    await profilePage.editButton.click();
    // المتوقع: خانة الإيميل فيها إيميل .env.
    await expect(editModal.emailInput).toHaveValue(validMerchant.email);
  });

  // الاسم والإيميل مينفعش يتعدّلوا (SRS 10.15: عرض فقط).
  test('name and email are read-only', { tag: '@regression' }, async () => {
    // نفتح نافذة التعديل.
    await profilePage.editButton.click();
    // المتوقع: الخانتين مش قابلين للتعديل.
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
    // نعمل الـ Page Objects.
    profilePage = new ProfilePage(page);
    editModal = new EditProfileModal(page);
    // نفتح صفحة البروفايل ونافذة التعديل.
    await profilePage.open();
    await profilePage.editButton.click();
    // نفتكر الرقم الحالي.
    originalPhone = await editModal.phoneInput.inputValue();
  });

  // بعد كل تست: نرجّع الرقم الأصلي لو اتغيّر.
  test.afterEach(async () => {
    // نفتح نافذة التعديل تاني بصفحة جديدة.
    await profilePage.open();
    await profilePage.editButton.click();
    // نرجّع الرقم بس لو مختلف.
    if ((await editModal.phoneInput.inputValue()) !== originalPhone) {
      await editModal.savePhone(originalPhone);
    }
  });

  // تست لكل رقم صحيح (الحد الأدنى، عادي، الحد الأقصى).
  for (const phone of validPhones) {
    test(`valid phone is saved: ${phone.name}`, { tag: '@regression' }, async ({ page }) => {
      // نكتب الرقم ونحفظ.
      await editModal.savePhone(phone.full);
      // المتوقع: رسالة النجاح.
      await expect(page.getByText(messages.saved)).toBeVisible();
      // نعمل reload للصفحة ونفتح النافذة تاني.
      await profilePage.open();
      await profilePage.editButton.click();
      // المتوقع: الرقم الجديد اتحفظ.
      await expect(editModal.phoneInput).toHaveValue(phone.full);
    });
  }

  // تست لكل رقم غلط (قاعدة الـ SRS: "+" وبعدها من 8 لـ 15 رقم).
  for (const phone of invalidPhones) {
    test(`invalid phone is rejected: ${phone.name}`, { tag: '@regression' }, async ({ page }) => {
      // نكتب الرقم ونحاول نحفظ.
      await editModal.savePhone(phone.full);
      // المتوقع: "من فضلك ادخل رقم صحيح".
      await expect(page.getByText(messages.invalidPhone)).toBeVisible();
    });
  }
});
