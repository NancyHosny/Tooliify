// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Object وأنواع الداتا.
import { DashboardPage, DashboardData, SubscriptionData } from '../pages/DashboardPage';
// نستورد بيانات التست.
import { paths, dashboardTexts, statisticsApi } from '../../../test-data/test-data';

// تستات لوحة التحكم (الصفحة الرئيسية بعد الدخول).
// كل تست بيفتح الصفحة مرة واحدة ويقارن اللي ظاهر في الشاشة باللي السيرفر بعته للصفحة نفسها (الإحصائيات والاشتراك).
test.describe('Dashboard – page', () => {
  // الصفحة بتنده الإحصائيات اللي حدها 10 طلبات في الدقيقة، فممكن التست يستنى شوية قبل ما يفتحها.
  test.describe.configure({ timeout: 90_000 });

  // الـ Page Object والداتا اللي الصفحة استلمتها.
  let dashboard: DashboardPage;
  let statistics: DashboardData;
  let subscription: SubscriptionData;

  // قبل كل تست: نفتح لوحة التحكم.
  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    ({ statistics, subscription } = await dashboard.open());
  });

  // العنوان والعنوان الفرعي واسم التاب.
  test('page shows its title, subtitle and browser title', { tag: '@smoke' }, async ({ page }) => {
    // المتوقع: العنوان والعنوان الفرعي واسم تاب المتصفح.
    await expect(dashboard.heading).toBeVisible();
    await expect(page.getByText(dashboardTexts.subtitle, { exact: true }).first()).toBeVisible();
    await expect(page).toHaveTitle(dashboardTexts.documentTitle);
    await expect(page).toHaveURL(new RegExp(`${paths.dashboard}$`));
  });

  // بانر الاشتراك بيعرض اسم الخطة وتاريخ الانتهاء والأيام المتبقية بنفس رد الـ API.
  test('subscription banner shows the plan, end date and remaining days', { tag: '@regression' }, async ({ page }) => {
    // تاريخ الانتهاء بنكتبه زي ما الصفحة بتكتبه ("1 ديسمبر 2026") بأرقام إنجليزي.
    const endDate = new Date(`${subscription.subscription.end_date}T00:00:00Z`)
      .toLocaleDateString('ar-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    // المتوقع: اسم الخطة ظاهر.
    await expect(page.getByRole('heading', { name: subscription.plan.name, exact: true })).toBeVisible();
    // المتوقع: جملة "تنتهي في <التاريخ> - متبقي <N> يوم".
    await expect(page.getByText(`${endDate} - متبقي ${subscription.days_remaining} يوم`)).toBeVisible();
    // المتوقع: شارة "تنتهي قريباً" ظاهرة لو الاشتراك قرّب يخلص، ومش ظاهرة لو لأ.
    const badge = page.getByText(dashboardTexts.expiringSoon, { exact: true });
    if (subscription.is_expiring_soon) await expect(badge).toBeVisible();
    else await expect(badge).toBeHidden();
  });

  // الكروت التلاتة: العنوان والرقم ونسبة التغيير وجملة المقارنة، بنفس رد الـ API.
  test('summary cards show the numbers and changes from the API', { tag: '@smoke' }, async () => {
    // الكروت بنفس ترتيب رد الـ API: الأدوات المفعلة، النقرات، المرور.
    const labels = [dashboardTexts.activeTotal, dashboardTexts.clicks, dashboardTexts.views];
    expect(statistics.stats.map((item) => item.key)).toEqual(statisticsApi.cardKeys);
    for (const [index, label] of labels.entries()) {
      const { value, change } = statistics.stats[index];
      const card = dashboard.summaryCard(label);
      // المتوقع: العنوان وجملة المقارنة ظاهرين.
      await expect(card, label).toBeVisible();
      await expect(card.getByText(dashboardTexts.compare), label).toBeVisible();
      // المتوقع: الرقم الكبير هو الرقم اللي في الـ API.
      await expect(card.locator('strong'), label).toHaveText(String(value));
      // المتوقع: نسبة التغيير مكتوبة بعد الرقم ("0" لو مفيش تغيير، و"33.33%" مثلًا لو في).
      const changeText = change === 0 ? '0' : `${Math.abs(change)}%`;
      await expect(dashboard.summaryNumbers(label), label).toHaveText(new RegExp(`^${value}\\s*${changeText.replace('.', '\\.')}$`));
    }
  });

  // قسم "الأدوات المفعلة": العدد وكارت لكل أداة بنقراتها ومرورها.
  test('active tools section shows every active tool with its numbers', { tag: '@regression' }, async () => {
    // المتوقع: العنوان والعدد "(N أداة)".
    await expect(dashboard.activeSection).toBeVisible();
    await expect(dashboard.activeCount).toHaveText(`(${statistics.active_tools.length} أداة)`);
    // المتوقع: كل أداة ليها كارت فيه عدد النقرات وبعده عدد المرور.
    for (const tool of statistics.active_tools) {
      const card = dashboard.toolCard(tool.name);
      await expect(card, tool.name).toBeVisible();
      await expect(card, tool.name).toContainText(new RegExp(`${tool.clicks}\\s*${dashboardTexts.clicks}\\s*${tool.views}\\s*${dashboardTexts.views}`));
    }
  });

  // "أكثر الأدوات تفاعلًا": بالترتيب اللي في الـ API وبحد أقصى 5.
  test('top tools list is ranked and has at most five tools', { tag: '@regression' }, async ({ page }) => {
    // المتوقع: القايمة مش أكتر من 5 والعنوان ظاهر.
    expect(statistics.top_tools.length).toBeLessThanOrEqual(statisticsApi.topLimit);
    await expect(page.getByText(dashboardTexts.topSection)).toBeVisible();
    // المتوقع: كل سطر فيه الترتيب والاسم وعدد التفاعلات.
    for (const [index, tool] of statistics.top_tools.entries()) {
      const item = dashboard.topItem(index + 1);
      await expect(item, tool.name).toContainText(tool.name);
      await expect(item, tool.name).toContainText(new RegExp(`${tool.interactions}\\s*${dashboardTexts.interaction}`));
    }
    // المتوقع: مفيش ترتيب بعد آخر أداة.
    await expect(page.getByText(`#${statistics.top_tools.length + 1}`, { exact: true })).toHaveCount(0);
  });

  // رسم "نشاط الأدوات" لازم يعرض كل يوم من أيام الأسبوع اللي الـ API رجّعه.
  test('activity chart shows every day returned by the API', { tag: '@regression' }, async () => {
    // المتوقع: العنوان ظاهر وكل يوم مكتوب اسمه تحت الرسم.
    await expect(dashboard.chart).toBeVisible();
    for (const day of statistics.activity) {
      await expect(dashboard.chart.getByText(day.day_name, { exact: true }), `${day.date} ${day.day_name}`).toBeVisible();
    }
  });

  // "عرض الكل" بيفتح صفحة أدواتي.
  test('"عرض الكل" opens my tools', { tag: '@regression' }, async ({ page }) => {
    // نضغط على الرابط.
    await dashboard.showAllLink.click();
    // المتوقع: صفحة أدواتي.
    await expect(page).toHaveURL(new RegExp(`${paths.myTools}$`));
  });
});
