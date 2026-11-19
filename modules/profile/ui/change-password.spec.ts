import { test, expect } from '../../shared/bug-capture';
import { ProfilePage } from '../pages/ProfilePage';
import { ChangePasswordModal } from '../pages/ChangePasswordModal';
import { weakNewPasswords, strongPassword, mismatchedConfirmation, wrongCurrentPassword, messages } from '../../../test-data/test-data';

// نافذة تغيير كلمة المرور (SRS 10.15).
// أمان: كلمة المرور الحالية الحقيقية مش بتتكتب هنا أبدًا، فكلمة مرور الحساب مستحيل تتغيّر.
test.describe('Profile – change password (SRS 10.15)', () => {
  let modal: ChangePasswordModal;

  // قبل كل تست: نفتح البروفايل ونفتح النافذة.
  test.beforeEach(async ({ page }) => {
    const profilePage = new ProfilePage(page);
    modal = new ChangePasswordModal(page);
    await profilePage.open();
    await profilePage.changePasswordButton.click();
    await expect(modal.dialog).toBeVisible();
  });

  // زرار الحفظ معطّل والخانات فاضية.
  test('save button disabled while fields are empty', { tag: '@regression' }, async () => {
    await expect(modal.saveButton).toBeDisabled();
  });

  // كلمة المرور الحالية الغلط بتترفض.
  test('wrong current password is rejected', { tag: '@regression' }, async ({ page }) => {
    await modal.fill(wrongCurrentPassword, strongPassword, strongPassword);
    await modal.saveButton.click();
    await expect(page.getByText(messages.wrongCurrentPassword)).toBeVisible();
  });

  // كل كلمة مرور جديدة ضعيفة بتظهر رسالة الشروط (مفيش حاجة بتتبعت).
  for (const weak of weakNewPasswords) {
    test(`weak new password shows rules message: ${weak.rule}`, { tag: '@regression' }, async ({ page }) => {
      await modal.fill(wrongCurrentPassword, weak.value, weak.value);
      await expect(page.getByText(messages.passwordRules)).toBeVisible();
    });
  }

  // التأكيد المختلف بيظهر رسالة "غير متطابقة".
  test('mismatched confirmation is rejected', { tag: '@regression' }, async ({ page }) => {
    await modal.fill(wrongCurrentPassword, strongPassword, mismatchedConfirmation);
    await expect(page.getByText(messages.passwordMismatch, { exact: true })).toBeVisible();
  });
});
