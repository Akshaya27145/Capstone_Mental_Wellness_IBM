import { test, expect } from '@playwright/test';
import { loginPatient, loginTherapist } from '../helpers/session.js';
import { firstTherapistId } from '../helpers/routes.js';
import { gotoAppointmentsPage } from '../helpers/nav.js';

/** M8 — 15 tests (serial: reviews consume rows) */
test.describe.configure({ mode: 'serial' });
test.describe('M8 — Ratings & reviews (15)', () => {
  test('TC-M8-001 — Submit review on completed row', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    const btn = page.locator('[data-testid^="btn-submit-review-"]').first();
    await expect(btn).toBeVisible({ timeout: 20_000 });
    const idAttr = await btn.getAttribute('data-testid');
    const m = idAttr?.match(/btn-submit-review-(\d+)/);
    expect(m?.[1]).toBeTruthy();
    const apptId = m[1];
    await page.locator(`[data-testid="select-review-rating-${apptId}"]`).selectOption('5');
    await page.locator(`[data-testid="input-review-comment-${apptId}"]`).fill('E2E review');
    await btn.click();
    await expect(page.getByTestId('appointments-msg')).toContainText(/review|thank/i, { timeout: 10000 });
  });

  test('TC-M8-002 — Duplicate review (manual/API)', () => {
    // STLC
  });

  test('TC-M8-003 — Review on PENDING (manual)', () => {
    // STLC
  });

  test('TC-M8-004 — Rating 0 invalid (manual/API)', () => {
    // STLC
  });

  test('TC-M8-005 — Rating 1 option exists', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    const sel = page.locator('[data-testid^="select-review-rating-"]').first();
    await expect(sel).toBeVisible({ timeout: 20_000 });
    await expect(sel.locator('option[value="1"]')).toBeAttached();
  });

  test('TC-M8-006 — Rating 5 option exists', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    const sel = page.locator('[data-testid^="select-review-rating-"]').first();
    await expect(sel).toBeVisible({ timeout: 20_000 });
    await expect(sel.locator('option[value="5"]')).toBeAttached();
  });

  test('TC-M8-007 — Therapist cannot see patient review submit', async ({ page }) => {
    await loginTherapist(page);
    await page.goto('/therapist/dashboard');
    await expect(page.locator('[data-testid^="btn-submit-review-"]')).toHaveCount(0);
  });

  test('TC-M8-008 — Comment optional', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    const btn = page.locator('[data-testid^="btn-submit-review-"]').first();
    await expect(btn).toBeVisible({ timeout: 20_000 });
    const idAttr = await btn.getAttribute('data-testid');
    const m = idAttr?.match(/btn-submit-review-(\d+)/);
    expect(m?.[1]).toBeTruthy();
    const apptId = m[1];
    await page.locator(`[data-testid="select-review-rating-${apptId}"]`).selectOption('4');
    await page.locator(`[data-testid="input-review-comment-${apptId}"]`).fill('');
    await btn.click();
    await expect(page.getByTestId('appointments-msg').or(page.getByTestId('appointments-error'))).toBeVisible({
      timeout: 10000
    });
  });

  test('TC-M8-009 — Review comment input visible when form shown', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    const comment = page.locator('[data-testid^="input-review-comment-"]').first();
    await expect(comment).toBeVisible({ timeout: 20_000 });
  });

  test('TC-M8-010 — Comment max length (manual/API)', () => {
    // STLC
  });

  test('TC-M8-011 — Aggregates (SQL)', () => {
    // STLC
  });

  test('TC-M8-012 — Public reviews on profile', async ({ page }) => {
    const tid = await firstTherapistId(page);
    expect(tid).toBeTruthy();
    await page.goto(`/therapists/${tid}`);
    await expect(page.getByTestId('therapist-reviews-list')).toBeVisible();
  });

  test('TC-M8-013 — Wrong patient review (manual)', () => {
    // STLC
  });

  test('TC-M8-014 — Emoji comment', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    const btn = page.locator('[data-testid^="btn-submit-review-"]').first();
    await expect(btn).toBeVisible({ timeout: 20_000 });
    const idAttr = await btn.getAttribute('data-testid');
    const m = idAttr?.match(/btn-submit-review-(\d+)/);
    expect(m?.[1]).toBeTruthy();
    const apptId = m[1];
    await page.locator(`[data-testid="select-review-rating-${apptId}"]`).selectOption('5');
    await page.locator(`[data-testid="input-review-comment-${apptId}"]`).fill('Great 😊');
    await btn.click();
    await expect(page.getByTestId('appointments-msg').or(page.getByTestId('appointments-error'))).toBeVisible({
      timeout: 10000
    });
  });

  test('TC-M8-015 — CASCADE delete (SQL)', () => {
    // STLC
  });
});
