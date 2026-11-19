import { test, expect } from '../../shared/bug-capture';
import { ToolBuilderPage } from '../pages/ToolBuilderPage';
import { MyToolsPage } from '../pages/MyToolsPage';
import { ToolData, paths, newQaToolName, invalidToolNames, notALink, messages } from '../../../test-data/test-data';

// تستات "التعديل" لأداة واحدة: نغيّر الأداة بعد ما تتضاف، ونشغّلها ونطفّيها.
// قبل كل تست بنضيف أداة QA وبعده بنحذفها. بيتنده من edit.spec.ts في فولدر كل أداة.
export function editTests(tool: ToolData) {
  test.describe(`${tool.name} – edit`, () => {
    // الحفظ بطيء على staging، فالتستات دي ممكن تاخد أكتر من الـ 30 ثانية العادية.
    test.describe.configure({ timeout: 120_000 });

    let builder: ToolBuilderPage;
    let myTools: MyToolsPage;
    let name = '';

    // قبل كل تست: نضيف أداة QA (والصفحة بعد كده بتبقى صفحة تعديل الأداة دي).
    test.beforeEach(async ({ page }) => {
      builder = new ToolBuilderPage(page);
      myTools = new MyToolsPage(page);
      name = newQaToolName(tool.slug);
      await builder.addAndWait(tool, name);
    });

    // بعد كل تست: نحذف أي أداة QA فاضلة.
    test.afterEach(async () => {
      await myTools.deleteQaToolsFromPage();
    });

    // صفحة التعديل بتتفتح بالاسم المحفوظ.
    test('edit page shows the saved name', { tag: '@regression' }, async () => {
      await expect(builder.nameInput).toHaveValue(name);
      await expect(builder.saveButton).toBeVisible();
    });

    // الاسم الجديد بيتحفظ وبيظهر في "أدواتي".
    test('renaming the tool saves the new name', { tag: '@smoke' }, async ({ page }) => {
      const newName = newQaToolName(tool.slug) + '-edited';
      await builder.saveWithName(newName, tool.link);
      await expect(page).toHaveURL(new RegExp(`${paths.myTools}$`), { timeout: 60_000 });
      await expect(myTools.row(newName)).toBeVisible();
      await expect(myTools.row(name)).toHaveCount(0);
    });

    // تست لكل اسم غلط: التعديل مش بيتحفظ.
    for (const item of invalidToolNames) {
      test(`invalid name is rejected: ${item.name}`, { tag: '@regression' }, async ({ page }) => {
        await builder.saveWithName(item.value, tool.link);
        await expect(page.getByText(messages.toolNameTooShort).first()).toBeVisible();
        await expect(page).toHaveURL(new RegExp(`${paths.myTools}/${tool.slug}/\\d+$`));
      });
    }

    // الأدوات اللي رابطها بيتفحص: الرابط الغلط مرفوض في التعديل كمان.
    // التست ده جوه describe لوحده، عشان التخطي بيحصل قبل ما الأداة تتضاف (من غير ما نضيّع وقت في إضافة أداة مش هنستخدمها).
    test.describe('link', () => {
      test.skip(!tool.linkChecks, 'this tool has no checked link field');
      test('text that is not a link is rejected', { tag: '@regression' }, async ({ page }) => {
        await builder.saveWithName(name, notALink);
        await expect(page.getByText(messages.linkInvalid).first()).toBeVisible();
        await expect(page).toHaveURL(new RegExp(`${paths.myTools}/${tool.slug}/\\d+$`));
      });
    });

    // كل تاب في صفحة الأداة (عام، الظهور، التصميم...) بيفتح قسمه.
    test('every tab of the tool page opens its panel', { tag: '@regression' }, async ({ page }) => {
      const tabs = page.getByRole('tab');
      const total = await tabs.count();
      await expect(page.getByRole('tab', { name: 'عام', exact: true })).toBeVisible();
      // نفتح كل تاب.
      for (let i = 0; i < total; i++) {
        const tabName = (await tabs.nth(i).innerText()).trim();
        await tabs.nth(i).click();
        await expect(tabs.nth(i), tabName).toHaveAttribute('aria-selected', 'true');
        await expect(page.getByRole('tabpanel', { name: tabName }), tabName).toBeVisible();
      }
    });

    // "رجوع" بيخرّج من صفحة التعديل من غير ما يحفظ التغيير.
    test('"رجوع" leaves without saving the change', { tag: '@regression' }, async ({ page }) => {
      const otherName = newQaToolName(tool.slug) + '-not-saved';
      await builder.nameInput.fill(otherName);
      await builder.backButton.click();
      await expect(page).toHaveURL(new RegExp(`${paths.myTools}$`));
      await expect(myTools.row(name)).toBeVisible();
      await expect(myTools.row(otherName)).toHaveCount(0);
    });

    // مفتاح التشغيل بيفتح نافذة فيها اسم الأداة وتحذير.
    test('deactivate popup shows the tool name and a warning', { tag: '@regression' }, async () => {
      await myTools.open();
      await myTools.statusSwitch(name).click();
      await expect(myTools.deleteDialog.getByText(messages.deactivateToolTitle)).toBeVisible();
      await expect(myTools.deleteDialog.getByText(name)).toBeVisible();
      await expect(myTools.deleteDialog.getByText(messages.deactivateToolQuestion)).toBeVisible();
      await expect(myTools.confirmStatusButton).toBeVisible();
      await expect(myTools.closeDeleteButton).toBeVisible();
    });

    // تأكيد النافذة بيوقّف الأداة.
    test('confirming the popup deactivates the tool', { tag: '@smoke' }, async () => {
      await myTools.open();
      await myTools.statusSwitch(name).click();
      await myTools.confirmStatusButton.click();
      await expect(myTools.deleteDialog).toBeHidden({ timeout: 30_000 });
      await expect(myTools.statusBadge(name)).toHaveText(messages.toolInactive, { timeout: 30_000 });
    });

    // "إغلاق" بيسيب الأداة مفعّلة.
    test('"إغلاق" in the deactivate popup keeps the tool active', { tag: '@regression' }, async () => {
      await myTools.open();
      await myTools.statusSwitch(name).click();
      await myTools.closeDeleteButton.click();
      await expect(myTools.deleteDialog).toBeHidden();
      await expect(myTools.statusBadge(name)).toHaveText(messages.toolActive);
    });
  });
}
