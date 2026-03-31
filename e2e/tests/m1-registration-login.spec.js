import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { users, randomEmail, registerFreshPatient, loginTherapist } from '../helpers/session.js';
import { firstTherapistId } from '../helpers/routes.js';

/** M1 — 15 automated tests (TC-M1-001 … TC-M1-015) — see docs/qe/04-test-cases-by-module.md */
test.describe('M1 — Registration & Login (15)', () => {
  test('TC-M1-001 — Valid patient registration', async ({ page }) => {
    await registerFreshPatient(page);
    await expect(page).toHaveURL(/\/therapists/);
  });

  test('TC-M1-002 — Valid therapist registration', async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.goto();
    await reg.register({
      fullName: 'TC Therapist',
      email: randomEmail('th'),
      password: 'LongPass99!',
      role: 'therapist'
    });
    await expect(page.getByTestId('therapist-dashboard')).toBeVisible({ timeout: 20_000 });
  });

  test('TC-M1-003 — Reject duplicate email', async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.goto();
    await page.getByTestId('input-register-name').fill('Dup');
    await page.getByTestId('input-register-email').fill(users.patient.email);
    await page.getByTestId('input-register-password').fill('LongPass99!');
    await page.getByTestId('btn-register-submit').click();
    await expect(page.getByTestId('register-error')).toBeVisible({ timeout: 10000 });
  });

  test('TC-M1-004 — Password boundary min-1 (7 chars)', async ({ page }) => {
    await page.goto('/register');
    await page.getByTestId('input-register-name').fill('User');
    await page.getByTestId('input-register-email').fill(randomEmail('p7'));
    await page.getByTestId('input-register-password').fill('Pass123');
    await page.getByTestId('btn-register-submit').click();
    await expect(page.getByTestId('register-password-error')).toBeVisible();
  });

  test('TC-M1-005 — Password boundary min (exactly 8 chars)', async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.goto();
    await reg.register({
      fullName: 'Eight Char',
      email: randomEmail('p8'),
      password: 'Pass1234',
      role: 'patient'
    });
    await expect(page).toHaveURL(/\/therapists/);
  });

  test('TC-M1-006 — Invalid email format', async ({ page }) => {
    await page.goto('/register');
    await page.getByTestId('input-register-name').fill('Bad Email');
    await page.getByTestId('input-register-email').fill('not-an-email');
    await page.getByTestId('input-register-password').fill('LongPass99!');
    await page.getByTestId('btn-register-submit').click();
    await expect(page.getByTestId('register-error')).toBeVisible({ timeout: 10000 });
  });

  test('TC-M1-007 — Login valid patient', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(users.patient.email, users.patient.password);
    await expect(page).toHaveURL(/\/therapists/);
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M1-008 — Login wrong password', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(users.patient.email, 'WrongPass!!!');
    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  test('TC-M1-009 — Login unknown user', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('nope@example.com', 'whatever99');
    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  test('TC-M1-010 — Inactive account login', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(users.inactivePatient.email, users.inactivePatient.password);
    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  test('TC-M1-011 — Logout clears session', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(users.patient.email, users.patient.password);
    await page.getByTestId('btn-logout').click();
    await page.goto('/appointments');
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-M1-012 — Therapist blocked from patient book URL', async ({ page }) => {
    await loginTherapist(page);
    const tid = await firstTherapistId(page);
    expect(tid, 'Seeded therapists missing').toBeTruthy();
    await page.goto(`/therapists/${tid}/book`);
    await expect(page).not.toHaveURL(/\/therapists\/\d+\/book$/);
  });

  test('TC-M1-013 — Optional phone omitted on register', async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.goto();
    await reg.register({
      fullName: 'No Phone User',
      email: randomEmail('nophone'),
      password: 'LongPass99!',
      role: 'patient'
    });
    await expect(page).toHaveURL(/\/therapists/);
  });

  test('TC-M1-014 — Name too short', async ({ page }) => {
    await page.goto('/register');
    const name = page.getByTestId('input-register-name');
    await name.fill('A');
    await page.getByTestId('input-register-email').fill(randomEmail('shortn'));
    await page.getByTestId('input-register-password').fill('LongPass99!');
    await page.getByTestId('btn-register-submit').click();
    const invalid = await name.evaluate((el) => !el.validity.valid);
    expect(invalid).toBeTruthy();
  });

  test('TC-M1-015 — Protected route without JWT redirects to login', async ({ page }) => {
    await page.goto('/appointments');
    await expect(page).toHaveURL(/\/login/);
  });
});
