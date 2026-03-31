import { test, expect } from '@playwright/test';
import { loginPatient, loginTherapist } from '../helpers/session.js';
import { firstTherapistId } from '../helpers/routes.js';

/** M3 — 15 tests */
test.describe('M3 — Therapist profile (15)', () => {
  test('TC-M3-001 — Load valid profile', async ({ page }) => {
    const tid = await firstTherapistId(page);
    expect(tid).toBeTruthy();
    await page.goto(`/therapists/${tid}`);
    await expect(page.getByTestId('therapist-profile')).toBeVisible();
    await expect(page.getByText(/\$/).first()).toBeVisible();
  });

  test('TC-M3-002 — Invalid id shows error', async ({ page }) => {
    await page.goto('/therapists/999999');
    await expect(page.getByText(/error|not found/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-M3-003 — Reviews section shows empty or list', async ({ page }) => {
    const tid = await firstTherapistId(page);
    expect(tid).toBeTruthy();
    await page.goto(`/therapists/${tid}`);
    await expect(page.getByTestId('therapist-reviews-list')).toBeVisible();
  });

  test('TC-M3-004 — Reviews may show star rows when data exists', async ({ page }) => {
    await page.goto('/therapists');
    await page.locator('[data-testid^="link-profile-"]').first().click();
    const list = page.getByTestId('therapist-reviews-list');
    await expect(list).toBeVisible();
  });

  test('TC-M3-005 — Patient sees Book CTA', async ({ page }) => {
    await loginPatient(page);
    const tid = await firstTherapistId(page);
    expect(tid).toBeTruthy();
    await page.goto(`/therapists/${tid}`);
    await expect(page.getByTestId('btn-book-session')).toBeVisible({ timeout: 20_000 });
  });

  test('TC-M3-006 — Guest sees login prompt not book', async ({ page }) => {
    const tid = await firstTherapistId(page);
    expect(tid).toBeTruthy();
    await page.goto(`/therapists/${tid}`);
    await expect(page.getByText(/log in as a patient/i)).toBeVisible();
    await expect(page.getByTestId('btn-book-session')).toHaveCount(0);
  });

  test('TC-M3-007 — Back from book to profile', async ({ page }) => {
    await loginPatient(page);
    const tid = await firstTherapistId(page);
    expect(tid).toBeTruthy();
    await page.goto(`/therapists/${tid}`);
    await page.getByTestId('btn-book-session').click();
    await page.goBack();
    await expect(page.getByTestId('therapist-profile')).toBeVisible();
  });

  test('TC-M3-008 — Malformed id in URL', async ({ page }) => {
    await page.goto('/therapists/abc');
    await expect(page.getByText(/error|not found/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-M3-009 — Specialization visible (spot-check vs seed)', async ({ page }) => {
    await page.goto('/therapists');
    await page.locator('[data-testid^="link-profile-"]').first().click();
    await expect(page.getByText(/Psychology|Counselor|Therapy|Marriage/i).first()).toBeVisible();
  });

  test('TC-M3-010 — Hourly rate shows $', async ({ page }) => {
    await page.goto('/therapists');
    await page.locator('[data-testid^="link-profile-"]').first().click();
    await expect(page.getByText(/\$\d/).first()).toBeVisible();
  });

  test('TC-M3-011 — Bio area visible', async ({ page }) => {
    await page.goto('/therapists');
    await page.locator('[data-testid^="link-profile-"]').first().click();
    await expect(page.getByTestId('therapist-profile').getByRole('paragraph').first()).toBeVisible();
  });

  test('TC-M3-012 — Profile content renders as structured UI', async ({ page }) => {
    await page.goto('/therapists');
    await page.locator('[data-testid^="link-profile-"]').first().click();
    await expect(page.getByTestId('therapist-profile')).toContainText(/[a-zA-Z]{3,}/);
  });

  test('TC-M3-013 — Profile loads after slow navigation', async ({ page }) => {
    const tid = await firstTherapistId(page);
    expect(tid).toBeTruthy();
    await page.goto(`/therapists/${tid}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('therapist-profile')).toBeVisible({ timeout: 20000 });
  });

  test('TC-M3-014 — Therapist can open public profile by id', async ({ page }) => {
    await loginTherapist(page);
    const tid = await firstTherapistId(page);
    expect(tid).toBeTruthy();
    await page.goto(`/therapists/${tid}`);
    await expect(page.getByTestId('therapist-profile')).toBeVisible();
  });

  test('TC-M3-015 — Deleted therapist (manual DB)', () => {
    // DB delete + SQL validation; STLC
  });
});
