import { test, expect } from '@playwright/test';
import { BrowseTherapistsPage } from '../pages/BrowseTherapistsPage.js';
import { BookSessionPage } from '../pages/BookSessionPage.js';
import { loginPatient, loginTherapist } from '../helpers/session.js';
import { firstTherapistId, bookableTherapistProfileId } from '../helpers/routes.js';

/** M5 — 15 tests (serial: bookings share slot pool; 006+ need extra time for bookableTherapistProfileId) */
test.describe.configure({ mode: 'serial', timeout: 90_000 });
test.describe('M5 — Book session (15)', () => {
  test('TC-M5-001 — Book first open slot', async ({ page }) => {
    await loginPatient(page);
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    const href = await page.locator('[data-testid^="link-profile-"]').first().getAttribute('href');
    const m = href?.match(/therapists\/(\d+)/);
    expect(m, 'No profile link on browse').toBeTruthy();
    const book = new BookSessionPage(page);
    await book.goto(m[1]);
    await expect(page.getByTestId('book-session')).toBeVisible({ timeout: 20_000 });
    const slots = page.locator('button[data-testid^="slot-"]');
    await expect(slots.first()).toBeVisible({ timeout: 20_000 });
    await book.selectFirstAvailableSlot();
    await book.confirmBooking();
    await expect(page.getByTestId('book-success')).toBeVisible({ timeout: 15000 });
  });

  test('TC-M5-002 — Confirm without slot shows error', async ({ page }) => {
    await loginPatient(page);
    const tid = await firstTherapistId(page);
    expect(tid).toBeTruthy();
    await page.goto(`/therapists/${tid}/book`);
    await page.getByTestId('btn-confirm-booking').click();
    await expect(page.getByTestId('book-error')).toBeVisible();
  });

  test('TC-M5-003 — Double book race', () => {
    // Manual / two-browser race; see STLC
  });

  test('TC-M5-004 — Wrong therapistProfileId tamper', () => {
    // No UI for tampering body; exercise via API in STLC
  });

  test('TC-M5-005 — Patient overlap', () => {
    // Scripted second booking same time; STLC
  });

  test('TC-M5-006 — Notes over 500 chars rejected by API', async ({ page }) => {
    await loginPatient(page);
    const tid = await bookableTherapistProfileId(page);
    expect(tid, 'No therapist with open slot').toBeTruthy();
    await page.goto(`/therapists/${tid}/book`);
    const slots = page.locator('button[data-testid^="slot-"]');
    await expect(slots.first()).toBeVisible({ timeout: 20_000 });
    await slots.first().click();
    await page.getByTestId('input-book-notes').fill('x'.repeat(501));
    await page.getByTestId('btn-confirm-booking').click();
    await expect(page.getByTestId('book-error')).toBeVisible({ timeout: 10000 });
  });

  test('TC-M5-007 — Guest redirected from book URL', async ({ page }) => {
    const tid = await firstTherapistId(page);
    expect(tid).toBeTruthy();
    await page.goto(`/therapists/${tid}/book`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-M5-008 — Therapist cannot use patient book flow', async ({ page }) => {
    await loginTherapist(page);
    const tid = await firstTherapistId(page);
    expect(tid).toBeTruthy();
    await page.goto(`/therapists/${tid}/book`);
    await expect(page).not.toHaveURL(/\/therapists\/\d+\/book$/);
  });

  test('TC-M5-009 — Slot booked flag (DB)', () => {
    // database/validation_queries.sql
  });

  test('TC-M5-010 — Appointment PENDING (DB)', () => {
    // SQL after book
  });

  test('TC-M5-011 — Past date slot', () => {
    // DB slot in past; STLC
  });

  test('TC-M5-012 — Zero duration slot', () => {
    // DB constraint; STLC
  });

  test('TC-M5-013 — Notes optional empty booking', async ({ page }) => {
    await loginPatient(page);
    const tid = await bookableTherapistProfileId(page);
    expect(tid, 'No therapist with open slot').toBeTruthy();
    await page.goto(`/therapists/${tid}/book`);
    const slots = page.locator('button[data-testid^="slot-"]');
    await expect(slots.first()).toBeVisible({ timeout: 20_000 });
    await slots.first().click();
    await page.getByTestId('input-book-notes').fill('');
    await page.getByTestId('btn-confirm-booking').click();
    await expect(page.getByTestId('book-success')).toBeVisible({ timeout: 15000 });
  });

  test('TC-M5-014 — Unicode notes', async ({ page }) => {
    await loginPatient(page);
    const tid = await bookableTherapistProfileId(page);
    expect(tid, 'No therapist with open slot').toBeTruthy();
    await page.goto(`/therapists/${tid}/book`);
    const slots = page.locator('button[data-testid^="slot-"]');
    await expect(slots.first()).toBeVisible({ timeout: 20_000 });
    await slots.first().click();
    await page.getByTestId('input-book-notes').fill('Focus: calm 🌿');
    await page.getByTestId('btn-confirm-booking').click();
    await expect(page.getByTestId('book-success')).toBeVisible({ timeout: 15000 });
  });

  test('TC-M5-015 — Refresh book page still loads', async ({ page }) => {
    await loginPatient(page);
    const tid = await firstTherapistId(page);
    expect(tid).toBeTruthy();
    await page.goto(`/therapists/${tid}/book`);
    await expect(page.getByTestId('book-session')).toBeVisible({ timeout: 20_000 });
    await page.reload();
    await expect(page.getByTestId('book-session')).toBeVisible({ timeout: 20_000 });
  });
});
