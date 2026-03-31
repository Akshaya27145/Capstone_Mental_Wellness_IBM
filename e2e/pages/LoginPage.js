import { SPA_GOTO } from '../helpers/spaNavigation.js';

export class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/login', SPA_GOTO);
    await this.page.getByTestId('input-login-email').waitFor({ state: 'visible', timeout: 20_000 });
  }

  async login(email, password) {
    await this.page.getByTestId('input-login-email').fill(email);
    await this.page.getByTestId('input-login-password').fill(password);
    const responsePromise = this.page.waitForResponse(
      (r) => r.url().includes('/api/auth/login') && r.request().method() === 'POST',
      { timeout: 25_000 }
    );
    await this.page.getByTestId('btn-login-submit').click();
    const res = await responsePromise;
    if (res.ok()) {
      await this.page.waitForResponse(
        (r) => r.url().includes('/api/auth/me') && r.request().method() === 'GET' && r.ok(),
        { timeout: 25_000 }
      );
      await this.page.waitForURL(/\/therapists/, { timeout: 25_000 });
    } else {
      await this.page.getByTestId('login-error').waitFor({ state: 'visible', timeout: 15_000 });
    }
  }
}
