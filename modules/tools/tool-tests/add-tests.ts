import { test, expect } from '../../shared/bug-capture';
import { ToolsCatalogPage } from '../pages/ToolsCatalogPage';
import { ToolBuilderPage } from '../pages/ToolBuilderPage';
import { MyToolsPage } from '../pages/MyToolsPage';
import { ToolsCatalogClient } from '../clients/ToolsCatalogClient';
import { getMerchantToken } from '../../shared/merchant-token';
import { ToolData, apiUrl, paths, newQaToolName, invalidToolNames, notALink, messages, myToolsTexts } from '../../../test-data/test-data';

// تستات "الإضافة" لأداة واحدة (SRS 10.9): الكتالوج ← الـ builder ← "حفظ التعديلات" ← الأداة تظهر في "أدواتي".
// أدوات QA اسمها بيبدأ بـ "QA-" وبتتحذف بعد التست. بيتنده من add.spec.ts في فولدر كل أداة.
export function addTests(tool: ToolData) {
  test.describe(`${tool.name} – add`, () => {
    // الحفظ بطيء على staging، فالتستات دي ممكن تاخد أكتر من الـ 30 ثانية العادية.
    test.describe.configure({ timeout: 120_000 });

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
      if (mayBeSaved) await myTools.deleteQaToolsFromPage();
    });

    // حفظ الـ builder بيضيف الأداة لـ "أدواتي" بنفس بياناتها: الاسم والوصف والحالة والجدولة، والعدد والإحصائيات بيزيدوا،
    // وصفحة الأداة بتفتح من "أدواتي" بنفس البيانات اللي اتكتبت.
    test('saved tool appears in my tools with its own data', { tag: '@smoke' }, async ({ page, playwright }) => {
      // الوصف الأصلي للأداة بنجيبه من الـ API عشان نقارن بيه.
      test.skip(!apiUrl, 'API_URL is not set in .env');
      const request = await playwright.request.newContext({ baseURL: apiUrl });
      const description = (await (await new ToolsCatalogClient(request, await getMerchantToken(request)).getTool(tool.id)).json()).data.description;
      await myTools.open();
      const before = await myTools.addedCount();
      const activeBefore = await myTools.statValue(myToolsTexts.activeTotal);
      const name = newQaToolName(tool.slug);
      mayBeSaved = true;
      await builder.open(tool.slug);
      await builder.saveTool(tool, name);
      await expect(page).toHaveURL(new RegExp(`${paths.myTools}/${tool.slug}/\\d+$`), { timeout: 60_000 });
      await myTools.open();
      const row = myTools.row(name);
      await expect(row).toBeVisible();
      await expect(row).toContainText(description);
      await expect(myTools.statusBadge(name)).toHaveText(messages.toolActive);
      await expect(row).toContainText(myToolsTexts.notScheduled);
      expect(await myTools.addedCount()).toBe(before + 1);
      expect(await myTools.statValue(myToolsTexts.activeTotal)).toBe(activeBefore + 1);
      await expect(myTools.previewButton(name)).toBeVisible();
      await expect(myTools.editButton(name)).toBeVisible();
      await expect(myTools.deleteButton(name)).toBeVisible();
      await myTools.editButton(name).click();
      await expect(page).toHaveURL(new RegExp(`${paths.myTools}/${tool.slug}/\\d+$`));
      await expect(builder.nameInput).toHaveValue(name);
      if (tool.link !== undefined) await expect(builder.linkInput).toHaveValue(tool.link);
    });

    // بعد الحفظ كارت الكتالوج بيقول "مضافة بالفعل".
    test('catalog shows the tool as already added', { tag: '@regression' }, async () => {
      // الأداة اللي ليها نسخة حقيقية دايمًا "مضافة بالفعل"، فالتست ده عمره ما هيفشل ومالوش لازمة.
      test.skip(Boolean(tool.realInstance), 'the account has a real copy of this tool, so the card always says "مضافة بالفعل"');
      mayBeSaved = true;
      await builder.addAndWait(tool, newQaToolName(tool.slug));
      await catalog.open();
      await expect(catalog.card(tool.name).getByRole('button', { name: 'مضافة بالفعل' })).toBeVisible();
    });

    // "رجوع" بيخرّج من الـ builder من غير ما يضيف حاجة.
    test('"رجوع" returns to the catalog without adding the tool', { tag: '@regression' }, async ({ page }) => {
      await builder.open(tool.slug);
      await builder.nameInput.fill(newQaToolName(tool.slug));
      await builder.backButton.click();
      await expect(page).toHaveURL(new RegExp(`${paths.tools}$`));
      await myTools.open();
      await expect(myTools.qaRows).toHaveCount(0);
    });

    // تست لكل اسم غلط: الأداة مش بتتحفظ.
    for (const item of invalidToolNames) {
      test(`invalid name is rejected: ${item.name}`, { tag: '@regression' }, async ({ page }) => {
        await builder.open(tool.slug);
        await builder.saveWithName(item.value, tool.link);
        await expect(page.getByText(messages.toolNameTooShort).first()).toBeVisible();
        await expect(page).toHaveURL(new RegExp(`${paths.tools}/${tool.slug}$`));
      });
    }

    // الأدوات اللي رابطها بيتفحص: الرابط الفاضي مرفوض.
    test('empty link is rejected', { tag: '@regression' }, async ({ page }) => {
      test.skip(!tool.linkChecks, 'this tool has no checked link field');
      await builder.open(tool.slug);
      await builder.saveWithName(newQaToolName(tool.slug));
      await expect(page.getByText(messages.linkInvalid).first()).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${paths.tools}/${tool.slug}$`));
    });

    // الأدوات اللي رابطها بيتفحص: نص مش رابط مرفوض.
    test('text that is not a link is rejected', { tag: '@regression' }, async ({ page }) => {
      test.skip(!tool.linkChecks, 'this tool has no checked link field');
      await builder.open(tool.slug);
      await builder.saveWithName(newQaToolName(tool.slug), notALink);
      await expect(page.getByText(messages.linkInvalid).first()).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${paths.tools}/${tool.slug}$`));
    });
  });
}
