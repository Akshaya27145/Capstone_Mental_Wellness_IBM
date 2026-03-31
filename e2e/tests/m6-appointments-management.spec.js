import { test, expect } from '@playwright/test';
import { loginPatient, loginTherapist } from '../helpers/session.js';
import { gotoAppointmentsPage } from '../helpers/nav.js';

/** M6 — 15 tests (serial: appointment rows mutate shared seed + M5) */
test.describe.configure({ mode: 'serial' });
test.describe('M6 — Appointments management (15)', () => {
  test('TC-M6-001 — Cancel PENDING when button exists', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    const pendingRow = page.locator('[data-testid^="appointment-row-"]').filter({ hasText: /Pending confirmation/i }).first();
    const cancel = pendingRow.locator('[data-testid^="btn-cancel-"]');
    await expect(cancel).toBeVisible({ timeout: 20_000 });
    await cancel.click();
    await expect(page.getByTestId('appointments-msg')).toContainText(/cancel/i, { timeout: 10000 });
  });

  test('TC-M6-002 — Completed row has no cancel', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    const rows = page.locator('[data-testid^="appointment-row-"]');
    const n = await rows.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const text = await rows.nth(i).textContent();
      if (/completed/i.test(text)) {
        await expect(rows.nth(i).locator('[data-testid^="btn-cancel-"]')).toHaveCount(0);
        return;
      }
    }
    throw new Error('No Completed row in list');
  });

  test('TC-M6-003 — Reschedule panel opens', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    const pendingRow = page.locator('[data-testid^="appointment-row-"]').filter({ hasText: /Pending confirmation/i }).first();
    const res = pendingRow.locator('[data-testid^="btn-reschedule-"]');
    await expect(res).toBeVisible({ timeout: 20_000 });
    await res.click();
    await expect(page.getByTestId('reschedule-panel')).toBeVisible();
  });

  test('TC-M6-004 — Reschedule invalid slot shows error', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    const pendingRow = page.locator('[data-testid^="appointment-row-"]').filter({ hasText: /Pending confirmation/i }).first();
    const res = pendingRow.locator('[data-testid^="btn-reschedule-"]');
    await expect(res).toBeVisible({ timeout: 20_000 });
    await res.click();
    await page.getByTestId('select-reschedule-slot').selectOption({ index: 0 });
    await page.getByTestId('btn-confirm-reschedule').click();
    await expect(page.getByTestId('appointments-error')).toBeVisible({ timeout: 8000 });
  });

  test('TC-M6-005 — Wrong therapist slot (manual)', () => {
    // API-level; STLC
  });

  test('TC-M6-006 — Therapist confirm PENDING', async ({ page }) => {
    await loginTherapist(page);
    await page.goto('/therapist/dashboard');
    await expect(page.getByTestId('therapist-dashboard')).toBeVisible({ timeout: 20_000 });
    const btn = page.locator('[data-testid^="btn-confirm-"]').first();
    await expect(btn).toBeVisible({ timeout: 20_000 });
    await btn.click();
    await expect(page.getByText(/confirmed|confirm/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-M6-007 — Confirm twice (manual/API)', () => {
    // STLC
  });

  test('TC-M6-008 — Therapist complete CONFIRMED', async ({ page }) => {
    await loginTherapist(page);
    await page.goto('/therapist/dashboard');
    await expect(page.getByTestId('therapist-dashboard')).toBeVisible({ timeout: 20_000 });
    const btn = page.locator('[data-testid^="btn-complete-"]').first();
    await expect(btn).toBeVisible({ timeout: 20_000 });
    await btn.click();
    await expect(page.getByText(/complete/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-M6-009 — Complete from PENDING rejected', () => {
    // No UI for invalid transition; STLC
  });

  test('TC-M6-010 — Other patient cannot cancel (manual)', () => {
    // STLC
  });

  test('TC-M6-011 — Therapist cancel (manual)', () => {
    // STLC
  });

  test('TC-M6-012 — List shows payment status', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    await expect(page).toHaveURL(/\/appointments/, { timeout: 20_000 });
    await expect(page.getByText(/Payment:/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test('TC-M6-013 — Session room invalid id redirects', async ({ page }) => {
    await loginPatient(page);
    await page.goto('/session/999999999');
    await expect(page).toHaveURL(/\/appointments/);
  });

  test('TC-M6-014 — Reschedule overlap (manual)', () => {
    // STLC
  });

  test('TC-M6-015 — Multiple rows ordered section visible', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    await expect(page).toHaveURL(/\/appointments/, { timeout: 20_000 });
    await expect(page.getByTestId('appointment-list')).toBeVisible({ timeout: 20_000 });
  });
});
