import { Page, Locator } from '@playwright/test';
import { scheduleTexts } from '../../../test-data/test-data';

// Page Object لنافذة "اعدادات الجدولة" بتاعة أداة واحدة (بتتفتح بأيقونة الإعدادات في صف الأداة).
export class ScheduleModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly switch: Locator;
  readonly startDate: Locator;
  readonly endDate: Locator;
  readonly startTime: Locator;
  readonly endTime: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
    this.switch = this.dialog.getByRole('switch');
    // خانات التاريخ: الأولى بداية والتانية نهاية (بنلاقيهم من الـ popover-trigger).
    this.startDate = this.dialog.locator('[data-slot="popover-trigger"]').nth(0);
    this.endDate = this.dialog.locator('[data-slot="popover-trigger"]').nth(1);
    this.startTime = this.dialog.locator('input[name="startTime"]');
    this.endTime = this.dialog.locator('input[name="endTime"]');
    this.saveButton = this.dialog.getByRole('button', { name: scheduleTexts.saveButton });
    this.closeButton = this.dialog.getByRole('button', { name: scheduleTexts.closeButton });
    this.confirmButton = this.dialog.getByRole('button', { name: scheduleTexts.confirm });
  }

  // اسم الأداة المكتوب في النافذة.
  toolName(name: string): Locator {
    return this.dialog.getByText(name);
  }
}
