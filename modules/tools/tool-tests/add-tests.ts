// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Objects.
import { ToolsCatalogPage } from '../pages/ToolsCatalogPage';
import { ToolBuilderPage } from '../pages/ToolBuilderPage';
import { MyToolsPage } from '../pages/MyToolsPage';
// نستورد بيانات التست.
import { ToolData, paths, newQaToolName, invalidToolNames, notALink, messages } from '../../../test-data/test-data';

// تستات "الإضافة" لأداة واحدة (SRS 10.9): الكتالوج ← الـ builder ← "حفظ التعديلات" ← الأداة تظهر في "أدواتي".
// كل أداة بتتعمل هنا اسمها بيبدأ بـ "QA-" وبتتحذف بعد التست.
// كل فولدر أداة بينده الدالة دي من ملف add.spec.ts بتاعه.
export function addTests(tool: ToolData) {
  test.describe(`${tool.name} – add`, () => {
    // الحفظ بطيء على staging، فالتستات دي ممكن تاخد أكتر من الـ 30 ثانية العادية.
    test.describe.configure({ timeout: 120_000 });

    // الـ Page Objects، بتتعمل من جديد لكل تست.
    let catalog: ToolsCatalogPage;
    let builder: ToolBuilderPage;
    let myTools: MyToolsPage;
    // بتبقى true لما التست يضغط "حفظ التعديلات" (يعني ممكن تكون أداة اتعملت ولازم تتحذف).
    let mayBeSaved = false;

    // قبل كل تست: نعمل الـ Page Objects.
    test.beforeEach(async ({ page }) => {
      catalog = new ToolsCatalogPage(page);
      builder = new ToolBuilderPage(page);
      myTools = new MyToolsPage(page);
      mayBeSaved = false;
    });

    // بعد كل تست: نحذف أدوات QA، بس لو التست حفظ حاجة.
    test.afterEach(async () => {
      if (mayBeSaved) await myTools.deleteQaTools();
    });

    // حفظ الـ builder بيضيف الأداة لـ "أدواتي" كأداة مفعّلة.
    test('saved tool appears in my tools as active', { tag: '@smoke' }, async ({ page }) => {
      // نفتكر عدد الأدوات المضافة دلوقتي.
      await myTools.open();
      const before = await myTools.addedCount();
      // نفتح الـ builder ونحفظ باسم QA.
      const name = newQaToolName(tool.slug);
      mayBeSaved = true;
      await builder.open(tool.slug);
      await builder.saveTool(tool, name);
      // المتوقع: صفحة الأداة الجديدة (/ar/my-tools/<slug>/<id>) بعد الحفظ.
      await expect(page).toHaveURL(new RegExp(`${paths.myTools}/${tool.slug}/\\d+$`), { timeout: 60_000 });
      // المتوقع: "أدواتي" بتعرض الأداة مفعّلة والعدد زاد واحد.
      await myTools.open();
      await expect(myTools.row(name)).toBeVisible();
      await expect(myTools.statusBadge(name)).toHaveText(messages.toolActive);
      expect(await myTools.addedCount()).toBe(before + 1);
    });

    // بعد الحفظ كارت الكتالوج بيقول "مضافة بالفعل".
    test('catalog shows the tool as already added', { tag: '@regression' }, async () => {
      // الأداة اللي ليها نسخة حقيقية دايمًا "مضافة بالفعل"، فالتست ده عمره ما هيفشل ومالوش لازمة.
      test.skip(Boolean(tool.realInstance), 'the account has a real copy of this tool, so the card always says "مضافة بالفعل"');
      // نضيف الأداة.
      mayBeSaved = true;
      await builder.addAndWait(tool, newQaToolName(tool.slug));
      // نفتح الكتالوج.
      await catalog.open();
      // المتوقع: الكارت بيقول "مضافة بالفعل".
      await expect(catalog.card(tool.name).getByRole('button', { name: 'مضافة بالفعل' })).toBeVisible();
    });

    // "رجوع" بيخرّج من الـ builder من غير ما يضيف حاجة.
    test('"رجوع" returns to the catalog without adding the tool', { tag: '@regression' }, async ({ page }) => {
      // نفتح الـ builder ونكتب اسم وبعدين نرجع.
      await builder.open(tool.slug);
      await builder.nameInput.fill(newQaToolName(tool.slug));
      await builder.backButton.click();
      // المتوقع: رجعنا للكتالوج.
      await expect(page).toHaveURL(new RegExp(`${paths.tools}$`));
      // المتوقع: مفيش أداة QA اتعملت.
      await myTools.open();
      await expect(myTools.qaRows).toHaveCount(0);
    });

    // تست لكل اسم غلط: الأداة مش بتتحفظ.
    for (const item of invalidToolNames) {
      test(`invalid name is rejected: ${item.name}`, { tag: '@regression' }, async ({ page }) => {
        // نفتح الـ builder ونحفظ بالاسم الغلط.
        await builder.open(tool.slug);
        await builder.saveWithName(item.value, tool.link);
        // المتوقع: رسالة الفاليديشن وإحنا لسه في صفحة الـ builder.
        await expect(page.getByText(messages.toolNameTooShort).first()).toBeVisible();
        await expect(page).toHaveURL(new RegExp(`${paths.tools}/${tool.slug}$`));
      });
    }

    // الأدوات اللي رابطها بيتفحص: الرابط الفاضي مرفوض.
    test('empty link is rejected', { tag: '@regression' }, async ({ page }) => {
      test.skip(!tool.linkChecks, 'this tool has no checked link field');
      // نفتح الـ builder ونحفظ من غير رابط.
      await builder.open(tool.slug);
      await builder.saveWithName(newQaToolName(tool.slug));
      // المتوقع: رسالة الفاليديشن وإحنا لسه في صفحة الـ builder.
      await expect(page.getByText(messages.linkInvalid).first()).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${paths.tools}/${tool.slug}$`));
    });

    // الأدوات اللي رابطها بيتفحص: نص مش رابط مرفوض.
    test('text that is not a link is rejected', { tag: '@regression' }, async ({ page }) => {
      test.skip(!tool.linkChecks, 'this tool has no checked link field');
      // نفتح الـ builder ونكتب رابط غلط ونحفظ.
      await builder.open(tool.slug);
      await builder.saveWithName(newQaToolName(tool.slug), notALink);
      // المتوقع: رسالة الفاليديشن وإحنا لسه في صفحة الـ builder.
      await expect(page.getByText(messages.linkInvalid).first()).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${paths.tools}/${tool.slug}$`));
    });
  });
}
