// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Objects.
import { ToolBuilderPage } from '../pages/ToolBuilderPage';
import { MyToolsPage } from '../pages/MyToolsPage';
// نستورد بيانات التست.
import { ToolData, paths, newQaToolName, invalidToolNames, notALink, messages } from '../../../test-data/test-data';

// تستات "التعديل" لأداة واحدة: نغيّر الأداة بعد ما تتضاف، ونشغّلها ونطفّيها.
// قبل كل تست بنضيف أداة QA، وبعد كل تست بنحذف أي أداة QA فاضلة.
// كل فولدر أداة بينده الدالة دي من ملف edit.spec.ts بتاعه.
export function editTests(tool: ToolData) {
  test.describe(`${tool.name} – edit`, () => {
    // الحفظ بطيء على staging، فالتستات دي ممكن تاخد أكتر من الـ 30 ثانية العادية.
    test.describe.configure({ timeout: 120_000 });

    // الـ Page Objects، واسم الأداة اللي اتعملت للتست.
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
      await myTools.deleteQaTools();
    });

    // صفحة التعديل بتتفتح بالاسم المحفوظ.
    test('edit page shows the saved name', { tag: '@regression' }, async () => {
      // المتوقع: خانة الاسم فيها الاسم اللي كتبناه لما أضفنا الأداة.
      await expect(builder.nameInput).toHaveValue(name);
      await expect(builder.saveButton).toBeVisible();
    });

    // الاسم الجديد بيتحفظ وبيظهر في "أدواتي".
    test('renaming the tool saves the new name', { tag: '@smoke' }, async ({ page }) => {
      // نكتب اسم جديد ونحفظ.
      const newName = newQaToolName(tool.slug) + '-edited';
      await builder.saveWithName(newName, tool.link);
      // المتوقع: رجعنا لـ "أدواتي" بالاسم الجديد ومن غير الاسم القديم.
      await expect(page).toHaveURL(new RegExp(`${paths.myTools}$`), { timeout: 60_000 });
      await expect(myTools.row(newName)).toBeVisible();
      await expect(myTools.row(name)).toHaveCount(0);
    });

    // تست لكل اسم غلط: التعديل مش بيتحفظ.
    for (const item of invalidToolNames) {
      test(`invalid name is rejected: ${item.name}`, { tag: '@regression' }, async ({ page }) => {
        // نحفظ بالاسم الغلط.
        await builder.saveWithName(item.value, tool.link);
        // المتوقع: رسالة الفاليديشن وإحنا لسه في صفحة التعديل.
        await expect(page.getByText(messages.toolNameTooShort).first()).toBeVisible();
        await expect(page).toHaveURL(new RegExp(`${paths.myTools}/${tool.slug}/\\d+$`));
      });
    }

    // الأدوات اللي رابطها بيتفحص: الرابط الغلط مرفوض في التعديل كمان.
    // التست ده جوه describe لوحده، عشان التخطي بيحصل قبل ما الأداة تتضاف (من غير ما نضيّع وقت في إضافة أداة مش هنستخدمها).
    test.describe('link', () => {
      test.skip(!tool.linkChecks, 'this tool has no checked link field');
      test('text that is not a link is rejected', { tag: '@regression' }, async ({ page }) => {
        // نبدّل الرابط بنص غلط ونحفظ.
        await builder.saveWithName(name, notALink);
        // المتوقع: رسالة الفاليديشن وإحنا لسه في صفحة التعديل.
        await expect(page.getByText(messages.linkInvalid).first()).toBeVisible();
        await expect(page).toHaveURL(new RegExp(`${paths.myTools}/${tool.slug}/\\d+$`));
      });
    });

    // كل تاب في صفحة الأداة (عام، الظهور، التصميم...) بيفتح قسمه.
    test('every tab of the tool page opens its panel', { tag: '@regression' }, async ({ page }) => {
      // نجيب كل التابات (الأداة ممكن يكون فيها تابات مختلفة عن غيرها).
      const tabs = page.getByRole('tab');
      const total = await tabs.count();
      // المتوقع: تاب "عام" موجود في كل الأدوات.
      await expect(page.getByRole('tab', { name: 'عام', exact: true })).toBeVisible();
      // نفتح كل تاب.
      for (let i = 0; i < total; i++) {
        const tabName = (await tabs.nth(i).innerText()).trim();
        await tabs.nth(i).click();
        // المتوقع: التاب بقى متحدد وقسمه ظاهر.
        await expect(tabs.nth(i), tabName).toHaveAttribute('aria-selected', 'true');
        await expect(page.getByRole('tabpanel', { name: tabName }), tabName).toBeVisible();
      }
    });

    // "رجوع" بيخرّج من صفحة التعديل من غير ما يحفظ التغيير.
    test('"رجوع" leaves without saving the change', { tag: '@regression' }, async ({ page }) => {
      // نكتب اسم تاني وبعدين نرجع.
      const otherName = newQaToolName(tool.slug) + '-not-saved';
      await builder.nameInput.fill(otherName);
      await builder.backButton.click();
      // المتوقع: رجعنا لـ "أدواتي" بالاسم القديم.
      await expect(page).toHaveURL(new RegExp(`${paths.myTools}$`));
      await expect(myTools.row(name)).toBeVisible();
      await expect(myTools.row(otherName)).toHaveCount(0);
    });

    // مفتاح التشغيل بيفتح نافذة فيها اسم الأداة وتحذير.
    test('deactivate popup shows the tool name and a warning', { tag: '@regression' }, async () => {
      // نفتح "أدواتي" ونضغط على مفتاح الأداة.
      await myTools.open();
      await myTools.statusSwitch(name).click();
      // المتوقع: العنوان واسم الأداة والسؤال والزرارين ظاهرين.
      await expect(myTools.deleteDialog.getByText(messages.deactivateToolTitle)).toBeVisible();
      await expect(myTools.deleteDialog.getByText(name)).toBeVisible();
      await expect(myTools.deleteDialog.getByText(messages.deactivateToolQuestion)).toBeVisible();
      await expect(myTools.confirmStatusButton).toBeVisible();
      await expect(myTools.closeDeleteButton).toBeVisible();
    });

    // تأكيد النافذة بيوقّف الأداة.
    test('confirming the popup deactivates the tool', { tag: '@smoke' }, async () => {
      // نفتح "أدواتي" ونضغط المفتاح ونأكد.
      await myTools.open();
      await myTools.statusSwitch(name).click();
      await myTools.confirmStatusButton.click();
      // المتوقع: النافذة اتقفلت والحالة بقت "غير مفعلة".
      await expect(myTools.deleteDialog).toBeHidden({ timeout: 30_000 });
      await expect(myTools.statusBadge(name)).toHaveText(messages.toolInactive, { timeout: 30_000 });
    });

    // "إغلاق" بيسيب الأداة مفعّلة.
    test('"إغلاق" in the deactivate popup keeps the tool active', { tag: '@regression' }, async () => {
      // نفتح النافذة ونقفلها.
      await myTools.open();
      await myTools.statusSwitch(name).click();
      await myTools.closeDeleteButton.click();
      // المتوقع: النافذة اختفت والأداة لسه مفعّلة.
      await expect(myTools.deleteDialog).toBeHidden();
      await expect(myTools.statusBadge(name)).toHaveText(messages.toolActive);
    });
  });
}
