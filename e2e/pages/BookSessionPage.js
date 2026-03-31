import { expect } from '@playwright/test';
import { SPA_GOTO } from '../helpers/spaNavigation.js';

export class BookSessionPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto(therapistId) {
    await this.page.goto(`/therapists/${therapistId}/book`, SPA_GOTO);
  }

  async selectFirstAvailableSlot() {
    const slot = this.page.locator('button[data-testid^="slot-"]').first();
    await slot.click();
    await expect(slot).toHaveClass(/selected/, { timeout: 5000 });
  }

  async confirmBooking() {
    await this.page.getByTestId('btn-confirm-booking').click();
  }
}
