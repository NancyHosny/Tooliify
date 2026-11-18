// نستورد أنواع Playwright.
import { Page, Locator } from '@playwright/test';
// نستورد نصوص الجدولة من ملف test-data.
import { scheduleTexts } from '../../../test-data/test-data';

// Page Object لنافذة "اعدادات الجدولة" بتاعة أداة واحدة (بتتفتح بأيقونة الإعدادات في صف الأداة).
export class ScheduleModal {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // النافذة نفسها.
  readonly dialog: Locator;
  // مفتاح "تفعيل الجدولة الزمنية".
  readonly switch: Locator;
  // خانتين التاريخ (بداية ونهاية). كل واحدة بتفتح تقويم.
  readonly startDate: Locator;
  readonly endDate: Locator;
  // خانتين الوقت (بداية ونهاية).
  readonly startTime: Locator;
  readonly endTime: Locator;
  // زرار "حفظ الجدولة" وزرار "إغلاق".
  readonly saveButton: Locator;
  readonly closeButton: Locator;
  // زرار "تأكيد" في خطوة تأكيد إلغاء الجدولة (بتظهر لما نقفل المفتاح).
  readonly confirmButton: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // النافذة هي dialog.
    this.dialog = page.getByRole('dialog');
    // المفتاح هو switch.
    this.switch = this.dialog.getByRole('switch');
    // خانات التاريخ: الأولى بداية والتانية نهاية (بنلاقيهم من الـ popover-trigger).
    this.startDate = this.dialog.locator('[data-slot="popover-trigger"]').nth(0);
    this.endDate = this.dialog.locator('[data-slot="popover-trigger"]').nth(1);
    // خانات الوقت: بنلاقيها بالـ name.
    this.startTime = this.dialog.locator('input[name="startTime"]');
    this.endTime = this.dialog.locator('input[name="endTime"]');
    // الأزرار: بنلاقيها بأسمائها العربي.
    this.saveButton = this.dialog.getByRole('button', { name: scheduleTexts.saveButton });
    this.closeButton = this.dialog.getByRole('button', { name: scheduleTexts.closeButton });
    this.confirmButton = this.dialog.getByRole('button', { name: scheduleTexts.confirm });
  }

  // اسم الأداة المكتوب في النافذة.
  toolName(name: string): Locator {
    return this.dialog.getByText(name);
  }
}
