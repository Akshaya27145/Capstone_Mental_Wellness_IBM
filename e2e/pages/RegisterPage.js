import { SPA_GOTO } from '../helpers/spaNavigation.js';

export class RegisterPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/register', SPA_GOTO);
    await this.page.getByTestId('input-register-name').waitFor({ state: 'visible', timeout: 20_000 });
  }

  async register({ fullName, email, password, role = 'patient', phone = '' }) {
    await this.page.getByTestId('input-register-name').fill(fullName);
    await this.page.getByTestId('input-register-email').fill(email);
    await this.page.getByTestId('input-register-password').fill(password);
    if (phone) await this.page.getByTestId('input-register-phone').fill(phone);
    await this.page.getByTestId('select-register-role').selectOption(role);
    await this.page.getByTestId('btn-register-submit').click();
    await Promise.race([
      this.page.waitForURL(/\/therapists/, { timeout: 20_000 }),
      this.page.waitForURL(/\/therapist\/dashboard/, { timeout: 20_000 }),
      this.page.getByTestId('register-error').waitFor({ state: 'visible', timeout: 20_000 }),
      this.page.getByTestId('register-password-error').waitFor({ state: 'visible', timeout: 20_000 })
    ]);
  }
}
