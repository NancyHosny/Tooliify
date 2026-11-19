import { test, expect } from '../../shared/bug-capture';
import { MyToolsPage } from '../pages/MyToolsPage';
import { ToolBuilderPage } from '../pages/ToolBuilderPage';
import { createClients, addQaTool } from '../../scheduling/clients/qa-tools';
import { deleteQaTools } from '../../shared/qa-tools';
import { apiUrl, paths, messages, myToolsTexts, scheduleBody } from '../../../test-data/test-data';

// مجموعة واحدة من قايمة "أدواتي" في الـ API: الأداة ونسخها (instances).
type Group = { tool: { id: number; slug: string }; instances: { id: number; display_name: string; description: string; status: string }[] };

// صفحة "أدواتي" نفسها (SRS 10.9). التستات دي بتقرا الصفحة بس.
test.describe('My tools – page (SRS 10.9)', () => {
  // الـ Page Object، بيتعمل من جديد لكل تست.
  let myTools: MyToolsPage;

  // قبل كل تست: نفتح الصفحة.
  test.beforeEach(async ({ page }) => {
    myTools = new MyToolsPage(page);
    await myTools.open();
  });

  // الصفحة بتعرض العنوان والعدد وزرار الإضافة.
  test('page shows the title, the count and the add button', { tag: '@smoke' }, async () => {
    await expect(myTools.heading).toBeVisible();
    await expect(myTools.countText).toBeVisible();
    await expect(myTools.addToolButton).toBeVisible();
  });

  // العدد بيساوي عدد الأدوات في الجدول.
  test('count matches the number of tools in the table', { tag: '@regression' }, async () => {
    expect(await myTools.addedCount()).toBe(await myTools.deleteButtons.count());
  });

  // كل صف أداة فيه شارة حالة ومفتاح وزرار حذف.
  test('every tool has a status, a switch and a delete button', { tag: '@regression' }, async () => {
    const total = await myTools.deleteButtons.count();
    // المتوقع: نفس العدد من الشارات والمفاتيح.
    // (الجدول فيه شارة مخفية كمان، فبنعدّ الشارات الظاهرة بس)
    expect(await myTools.rows.locator('[data-slot="badge"]').filter({ visible: true }).count()).toBe(total);
    expect(await myTools.rows.getByRole('switch').count()).toBe(total);
  });

  // "اضافة اداة" بتفتح الكتالوج.
  test('"اضافة اداة" opens the catalog', { tag: '@regression' }, async ({ page }) => {
    await myTools.addToolButton.click();
    await expect(page).toHaveURL(new RegExp(`${paths.tools}$`));
  });

  // الجدول بيعرض الأعمدة الستة بالترتيب.
  test('table shows the six columns', { tag: '@regression' }, async () => {
    const headers = (await myTools.headerRow.innerText()).split('\t').map((text) => text.trim()).filter(Boolean);
    expect(headers).toEqual(myToolsTexts.headers);
  });

  // "جدولة الادوات" بتفتح صفحة الجدولة.
  test('"جدولة الادوات" opens the scheduling page', { tag: '@regression' }, async ({ page }) => {
    await myTools.scheduleButton.click();
    await expect(page).toHaveURL(new RegExp(`${paths.scheduling}$`));
  });

  // قايمة "العناصر في الصفحة" فيها 5 و 10 و 25 و 50 والافتراضي 10.
  test('page size list has the four sizes and 10 is the default', { tag: '@regression' }, async () => {
    expect(await myTools.pageSize.locator('option').allInnerTexts()).toEqual(myToolsTexts.pageSizes);
    await expect(myTools.pageSize).toHaveValue(myToolsTexts.defaultPageSize);
  });
});

// تفاصيل الصف والإحصائيات. كل تست بيضيف أداة QA بالـ API ويحذفها بعد كده، وأدواتك الحقيقية مبتتلمسش.
test.describe('My tools – row and totals', () => {
  // التستات دي بتضيف أداة بالـ API، فبنتخطاها لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // الـ Page Object وعملاء الـ API وأداة QA اللي اتعملت للتست.
  let myTools: MyToolsPage;
  let api: Awaited<ReturnType<typeof createClients>>;
  let tool: { id: number; name: string };

  // قبل كل تست: نضيف أداة QA بالـ API ونفتح "أدواتي".
  test.beforeEach(async ({ page, playwright }) => {
    api = await createClients(await playwright.request.newContext({ baseURL: apiUrl }));
    tool = await addQaTool(api.myTools);
    myTools = new MyToolsPage(page);
    await myTools.open();
  });

  // بعد كل تست: نحذف أي أداة QA فاضلة.
  test.afterEach(async () => {
    if (api) await deleteQaTools(api.myTools);
  });

  // نجيب قايمة "أدواتي" من الـ API.
  async function groups(): Promise<Group[]> {
    return (await (await api.myTools.listMyTools()).json()).data.tools;
  }

  // صف الأداة بيعرض الاسم والوصف والحالة والجدولة وأزرارها.
  test('row shows the name, the description, the status, the schedule and its buttons', { tag: '@smoke' }, async () => {
    const instance = (await groups()).flatMap((group) => group.instances).find((item) => item.id === tool.id)!;
    const row = myTools.row(tool.name);
    await expect(row).toBeVisible();
    await expect(row).toContainText(instance.description);
    await expect(myTools.statusBadge(tool.name)).toHaveText(messages.toolActive);
    await expect(row).toContainText(myToolsTexts.notScheduled);
    await expect(myTools.previewButton(tool.name)).toBeVisible();
    await expect(myTools.editButton(tool.name)).toBeVisible();
    await expect(myTools.deleteButton(tool.name)).toBeVisible();
    await expect(myTools.statusSwitch(tool.name)).toBeChecked();
  });

  // "معاينة الأداة" بتفتح صفحة الأداة.
  test('"معاينة الأداة" opens the tool page', { tag: '@regression' }, async ({ page }) => {
    await myTools.previewButton(tool.name).click();
    await expect(page).toHaveURL(new RegExp(`${paths.myTools}/cookies-consent/${tool.id}$`));
    await expect(new ToolBuilderPage(page).nameInput).toHaveValue(tool.name);
  });

  // "تخصيص" بتفتح صفحة تعديل الأداة.
  test('"تخصيص" opens the tool edit page', { tag: '@regression' }, async ({ page }) => {
    await myTools.editButton(tool.name).click();
    await expect(page).toHaveURL(new RegExp(`${paths.myTools}/cookies-consent/${tool.id}$`));
    await expect(new ToolBuilderPage(page).nameInput).toHaveValue(tool.name);
  });

  // كروت الإحصائيات بتساوي الأرقام اللي في الـ API.
  test('totals match the tools in the API', { tag: '@regression' }, async () => {
    const instances = (await groups()).flatMap((group) => group.instances);
    const scheduled = (await (await api.scheduling.listSchedules({ 'filter[is_schedule]': '1' })).json()).data.rows.length;
    expect(await myTools.statValue(myToolsTexts.activeTotal)).toBe(instances.filter((item) => item.status === 'active').length);
    expect(await myTools.statValue(myToolsTexts.inactiveTotal)).toBe(instances.filter((item) => item.status !== 'active').length);
    expect(await myTools.statValue(myToolsTexts.scheduledTotal)).toBe(scheduled);
  });

  // إيقاف الأداة وجدولتها بيغيّرا الكروت.
  test('totals follow the tool when it is stopped and when it is scheduled', { tag: '@regression' }, async () => {
    const active = await myTools.statValue(myToolsTexts.activeTotal);
    const inactive = await myTools.statValue(myToolsTexts.inactiveTotal);
    const scheduled = await myTools.statValue(myToolsTexts.scheduledTotal);
    await api.myTools.toggleTool(tool.id);
    await myTools.open();
    expect(await myTools.statValue(myToolsTexts.activeTotal)).toBe(active - 1);
    expect(await myTools.statValue(myToolsTexts.inactiveTotal)).toBe(inactive + 1);
    await api.scheduling.setSchedule(tool.id, scheduleBody());
    await myTools.open();
    expect(await myTools.statValue(myToolsTexts.scheduledTotal)).toBe(scheduled + 1);
  });

  // "N اداة مضافة" بتعدّ الأدوات كلها، و "1 - K من K عنصر" بتعدّ صفوف الجدول (الأداة بنسخها صف واحد).
  test('the count counts tools and the pagination counts table rows', { tag: '@regression' }, async () => {
    const all = await groups();
    const instances = all.flatMap((group) => group.instances).length;
    expect(await myTools.addedCount()).toBe(instances);
    // المتوقع: الترقيم = عدد الأدوات المختلفة (كلها في صفحة واحدة لأنها أقل من 10).
    await expect(myTools.paginationText).toHaveText(`1 - ${all.length} من ${all.length} عنصر`);
  });
});

// التحكم في الوصول.
test.describe('My tools – access (SRS 10.9)', () => {
  // الجزء ده بيشتغل من غير الجلسة المحفوظة (cookies فاضية = زائر مش عامل تسجيل دخول).
  test.use({ storageState: { cookies: [], origins: [] } });

  // الزائر اللي مش عامل تسجيل دخول مينفعش يفتح "أدواتي".
  test('my tools is not accessible without login', { tag: '@regression' }, async ({ page }) => {
    await page.goto(paths.myTools, { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/auth\?.*callbackUrl=%2Far%2Fmy-tools/, { timeout: 30_000 });
  });
});
