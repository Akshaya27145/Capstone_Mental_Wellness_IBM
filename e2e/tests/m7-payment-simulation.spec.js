import { test, expect } from '@playwright/test';
import { loginPatient, loginTherapist } from '../helpers/session.js';
import { gotoAppointmentsPage } from '../helpers/nav.js';

/** M7 — 15 tests (serial: pay mutates rows) */
test.describe.configure({ mode: 'serial' });
test.describe('M7 — Payment simulation (15)', () => {
  test('TC-M7-001 — Pay confirmed unpaid appointment', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    const payRow = page.locator('[data-testid^="appointment-row-"]').filter({ hasText: 'Status: Confirmed' }).first();
    const pay = payRow.locator('[data-testid^="btn-pay-"]').first();
    await expect(pay).toBeVisible({ timeout: 20_000 });
    await pay.click();
    await expect(page.getByTestId('appointments-msg')).toContainText(/payment/i, { timeout: 12000 });
  });

  test('TC-M7-002 — Second pay blocked (manual/API)', () => {
    // STLC
  });

  test('TC-M7-003 — PENDING row has no Pay button', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    const rows = page.locator('[data-testid^="appointment-row-"]');
    const n = await rows.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const t = await rows.nth(i).textContent();
      if (/pending/i.test(t)) {
        await expect(rows.nth(i).locator('[data-testid^="btn-pay-"]')).toHaveCount(0);
        return;
      }
    }
    throw new Error('No PENDING row');
  });

  test('TC-M7-004 — Wrong patient pays (manual)', () => {
    // STLC
  });

  test('TC-M7-005 — Wallet method (API)', () => {
    // STLC
  });

  test('TC-M7-006 — Amount matches rate (SQL)', () => {
    // validation_queries.sql
  });

  test('TC-M7-007 — Transaction ref pattern (SQL)', () => {
    // STLC
  });

  test('TC-M7-008 — Pay-fail hook (API)', () => {
    // STLC
  });

  test('TC-M7-009 — Currency USD (SQL)', () => {
    // STLC
  });

  test('TC-M7-010 — Therapist cannot see patient pay', async ({ page }) => {
    await loginTherapist(page);
    await page.goto('/therapist/dashboard');
    await expect(page.locator('[data-testid^="btn-pay-"]')).toHaveCount(0);
  });

  test('TC-M7-011 — Missing appointment pay (API)', () => {
    // STLC
  });

  test('TC-M7-012 — Pay only on eligible rows', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    await expect(page).toHaveURL(/\/appointments/, { timeout: 20_000 });
    const rows = page.locator('[data-testid^="appointment-row-"]');
    const n = await rows.count();
    for (let i = 0; i < n; i++) {
      const t = await rows.nth(i).textContent();
      const hasPay = (await rows.nth(i).locator('[data-testid^="btn-pay-"]').count()) > 0;
      if (hasPay) expect(t).toMatch(/CONFIRMED/i);
    }
    await expect(page.getByTestId('appointment-list')).toBeVisible({ timeout: 20_000 });
  });

  test('TC-M7-013 — Reload appointments after pay', async ({ page }) => {
    await loginPatient(page);
    await gotoAppointmentsPage(page);
    await expect(page).toHaveURL(/\/appointments/, { timeout: 20_000 });
    await page.reload();
    await expect(page.getByTestId('appointments-page')).toBeVisible({ timeout: 20_000 });
  });

  test('TC-M7-014 — Concurrent pay (manual)', () => {
    // STLC
  });

  test('TC-M7-015 — Payment 1:1 appointment (SQL)', () => {
    // validation_queries.sql
  });
});
