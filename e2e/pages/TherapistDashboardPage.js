import { SPA_GOTO } from '../helpers/spaNavigation.js';

export class TherapistDashboardPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/therapist/dashboard', SPA_GOTO);
  }
}
