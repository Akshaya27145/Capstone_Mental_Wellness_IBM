import { SPA_GOTO } from '../helpers/spaNavigation.js';

export class AppointmentsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/appointments', SPA_GOTO);
  }
}
