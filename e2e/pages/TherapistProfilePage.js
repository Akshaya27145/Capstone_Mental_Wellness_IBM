import { SPA_GOTO } from '../helpers/spaNavigation.js';

export class TherapistProfilePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto(id) {
    await this.page.goto(`/therapists/${id}`, SPA_GOTO);
  }

  bookButton() {
    return this.page.getByTestId('btn-book-session');
  }
}
