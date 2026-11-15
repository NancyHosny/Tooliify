// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Objects.
import { ProfilePage } from '../pages/ProfilePage';
import { ChangePasswordModal } from '../pages/ChangePasswordModal';
// نستورد بيانات التست.
import { weakNewPasswords, strongPassword, mismatchedConfirmation, wrongCurrentPassword, messages } from '../../../test-data/test-data';

// نافذة تغيير كلمة المرور (SRS 10.15).
// أمان: كلمة المرور الحالية الحقيقية "عمرها" ما بتتكتب هنا، فمستحيل كلمة مرور الحساب تتغيّر.
test.describe('Profile – change password (SRS 10.15)', () => {
  // الـ Page Object بتاع النافذة، بيتعمل من جديد لكل تست.
  let modal: ChangePasswordModal;

  // قبل كل تست: نفتح صفحة البروفايل والنافذة.
  test.beforeEach(async ({ page }) => {
    // نعمل الـ Page Objects.
    const profilePage = new ProfilePage(page);
    modal = new ChangePasswordModal(page);
    // نفتح صفحة البروفايل ونضغط "تعديل كلمة المرور".
    await profilePage.open();
    await profilePage.changePasswordButton.click();
    // نستنى النافذة.
    await expect(modal.dialog).toBeVisible();
  });

  // زرار الحفظ معطّل طول ما الخانات فاضية.
  test('save button disabled while fields are empty', { tag: '@regression' }, async () => {
    // المتوقع (الـ SRS: بيشتغل لما كل الحقول المطلوبة تتملي): معطّل.
    await expect(modal.saveButton).toBeDisabled();
  });

  // كلمة المرور الحالية الغلط بتترفض.
  test('wrong current password is rejected', { tag: '@regression' }, async ({ page }) => {
    // نكتب كلمة مرور حالية "غلط" وكلمة مرور جديدة صحيحة.
    await modal.fill(wrongCurrentPassword, strongPassword, strongPassword);
    // نبعت.
    await modal.saveButton.click();
    // المتوقع: "كلمة المرور الحالية غير صحيحة".
    await expect(page.getByText(messages.wrongCurrentPassword)).toBeVisible();
  });

  // تست لكل كلمة مرور جديدة ضعيفة (حالات حدّية وفئات مكافئة). مفيش حاجة بتتبعت.
  for (const weak of weakNewPasswords) {
    test(`weak new password shows rules message: ${weak.rule}`, { tag: '@regression' }, async ({ page }) => {
      // نكتب كلمة مرور حالية غلط (للأمان) وكلمة المرور الجديدة الضعيفة.
      await modal.fill(wrongCurrentPassword, weak.value, weak.value);
      // المتوقع: "كلمة المرور غير متطابقة مع الشروط".
      await expect(page.getByText(messages.passwordRules)).toBeVisible();
    });
  }

  // التأكيد لازم يطابق كلمة المرور الجديدة.
  test('mismatched confirmation is rejected', { tag: '@regression' }, async ({ page }) => {
    // نكتب تأكيد مختلف عن كلمة المرور الجديدة.
    await modal.fill(wrongCurrentPassword, strongPassword, mismatchedConfirmation);
    // المتوقع: "كلمة المرور غير متطابقة".
    await expect(page.getByText(messages.passwordMismatch, { exact: true })).toBeVisible();
  });
});
