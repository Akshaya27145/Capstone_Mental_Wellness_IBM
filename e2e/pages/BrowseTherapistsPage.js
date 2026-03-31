import { SPA_GOTO } from '../helpers/spaNavigation.js';

export class BrowseTherapistsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/therapists', SPA_GOTO);
    await this.page.getByTestId('therapist-list').waitFor({ state: 'visible', timeout: 20_000 });
  }

  async applyFilters(partial) {
    if (partial.issueType != null) await this.page.getByTestId('filter-issue').selectOption(partial.issueType);
    if (partial.minRate != null) await this.page.getByTestId('filter-min-rate').fill(String(partial.minRate));
    if (partial.maxRate != null) await this.page.getByTestId('filter-max-rate').fill(String(partial.maxRate));
    if (partial.minRating != null) await this.page.getByTestId('filter-min-rating').fill(String(partial.minRating));
    if (partial.availableDate != null) await this.page.getByTestId('filter-available-date').fill(partial.availableDate);
    if (partial.search != null) await this.page.getByTestId('filter-search').fill(partial.search);
    const listRes = this.page.waitForResponse(
      (r) => {
        if (r.request().method() !== 'GET') return false;
        try {
          const path = new URL(r.url()).pathname;
          return path === '/api/therapists';
        } catch {
          return false;
        }
      },
      { timeout: 25_000 }
    );
    await this.page.getByTestId('btn-apply-filters').click();
    await listRes;
  }

  therapistCards() {
    return this.page.getByTestId('therapist-list').locator('article[data-testid^="therapist-card-"]');
  }
}
