// نستورد أنواع Playwright (الصفحة والـ Locator).
import { Page, Locator } from '@playwright/test';
// نستورد انتظار حد الطلبات (نفس الحد اللي بيستخدمه عميل الـ API).
import { waitForStatisticsSlot, sleep } from '../clients/rate-limit';
// نستورد بيانات التست.
import { paths, dashboardTexts } from '../../../test-data/test-data';

// شكل أداة في رد الإحصائيات (من الـ schema اسمه ToolStatisticDashboardResource في الـ OpenAPI).
export type StatisticsTool = {
  merchant_tool_id: number; tool_id: number; slug: string; name: string; image: string | null;
  views: number; clicks: number; interactions: number;
};

// شكل رد لوحة التحكم (الـ data بس).
export type DashboardData = {
  stats: { key: string; value: number; change: number }[];
  active_tools: StatisticsTool[];
  top_tools: StatisticsTool[];
  activity_total: number;
  activity: { date: string; day_name: string; interactions: number }[];
};

// شكل رد الاشتراك (الـ data بس).
export type SubscriptionData = {
  has_subscription: boolean; display_status: string; is_expiring_soon: boolean; days_remaining: number;
  subscription: { start_date: string; end_date: string };
  plan: { name: string };
};

// Page Object للوحة التحكم (الصفحة الرئيسية بعد الدخول): بانر الاشتراك، 3 كروت، الأدوات المفعلة،
// أكثر الأدوات تفاعلًا، ورسم نشاط الأدوات.
export class DashboardPage {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // عنوان الصفحة "لوحة التحكم".
  readonly heading: Locator;
  // زراير الشريط العلوي: الثيم واللغة، وزرار طي الشريط الجانبي.
  readonly themeButton: Locator;
  readonly languageButton: Locator;
  readonly collapseButton: Locator;
  // رابط "عرض الكل" جنب الأدوات المفعلة.
  readonly showAllLink: Locator;
  // عنوان قسم "الأدوات المفعلة" وعدد الأدوات اللي جنبه "(N أداة)".
  readonly activeSection: Locator;
  readonly activeCount: Locator;
  // رسم "نشاط الأدوات" (الـ div اللي فيه الـ svg).
  readonly chart: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // العنوان: أي heading اسمه "لوحة التحكم" (الأول في الصفحة).
    this.heading = page.getByRole('heading', { name: dashboardTexts.title, exact: true }).first();
    // الأزرار: بنلاقيها بأسمائها.
    this.themeButton = page.getByRole('button', { name: dashboardTexts.themeButton });
    this.languageButton = page.getByRole('button', { name: dashboardTexts.languageButton });
    this.collapseButton = page.getByRole('button', { name: dashboardTexts.collapseButton });
    this.showAllLink = page.getByRole('link', { name: dashboardTexts.showAll });
    this.activeSection = page.getByRole('heading', { name: dashboardTexts.activeSection, exact: true });
    this.activeCount = page.getByText(/^\(\d+ أداة\)$/);
    // الرسم: أقرب div فوق عنوان "نشاط الأدوات" فيه svg.
    this.chart = page.getByText(dashboardTexts.chartTitle, { exact: true }).locator('xpath=ancestor::div[.//*[name()="svg"]][1]');
  }

  // نفتح الصفحة وبنرجّع الداتا اللي الصفحة نفسها استلمتها من الـ API (الإحصائيات والاشتراك)،
  // عشان نقارن اللي ظاهر في الشاشة باللي السيرفر بعته من غير ما نستهلك طلبات زيادة من حد الـ 10 في الدقيقة.
  async open(path: string = paths.dashboard) {
    // بنحاول لحد 3 مرات لو السيرفر رد 429 (حد الطلبات).
    for (let attempt = 0; attempt < 3; attempt++) {
      // نستنى مكان فاضي في حد الطلبات.
      await waitForStatisticsSlot();
      // نجهّز انتظار رد الإحصائيات ورد الاشتراك قبل ما نفتح الصفحة.
      const statistics = this.page.waitForResponse((r) => r.url().includes('/merchant/statistics') && r.request().method() === 'GET');
      const subscription = this.page.waitForResponse((r) => r.url().endsWith('/merchant/subscription'));
      await this.page.goto(path, { waitUntil: 'domcontentloaded' });
      const statisticsResponse = await statistics;
      const subscriptionResponse = await subscription;
      // لو الحد اتعدّى نستنى دقيقة ونفتح تاني.
      if (statisticsResponse.status() === 429) {
        await sleep(60_000);
        continue;
      }
      // نستنى العنوان وبعدين نرجّع الداتا.
      await this.heading.waitFor();
      return {
        statistics: (await statisticsResponse.json()).data as DashboardData,
        subscription: (await subscriptionResponse.json()).data as SubscriptionData,
      };
    }
    throw new Error('The statistics endpoint kept answering 429 (too many requests)');
  }

  // كارت من الكروت التلاتة فوق: الـ div اللي فيه العنوان (أول ظهور للعنوان هو الكارت، التاني جوه كروت الأدوات).
  summaryCard(label: string): Locator {
    return this.page.getByText(label, { exact: true }).first().locator('xpath=..');
  }

  // سطر الرقم الكبير ونسبة التغيير جوه كارت من الكروت التلاتة.
  summaryNumbers(label: string): Locator {
    return this.summaryCard(label).locator('div').filter({ has: this.page.locator('strong') }).last();
  }

  // كارت أداة في قسم "الأدوات المفعلة": أصغر div فيه اسم الأداة وعنوان "إجمالي عدد النقرات".
  toolCard(name: string): Locator {
    return this.page.locator('div').filter({ has: this.page.getByRole('heading', { name, exact: true }) }).filter({ hasText: dashboardTexts.clicks }).last();
  }

  // سطر أداة في "أكثر الأدوات تفاعلًا": أقرب div فوق "#<الترتيب>" فيه كلمة "تفاعل".
  topItem(rank: number): Locator {
    return this.page.getByText(`#${rank}`, { exact: true }).locator(`xpath=ancestor::div[contains(., "${dashboardTexts.interaction}")][1]`);
  }

  // رابط في الشريط الجانبي بالمسار بتاعه.
  sidebarLink(path: string): Locator {
    return this.page.locator(`a[href="${path}"]`).first();
  }
}
