import { expect } from '@playwright/test';
import { SPA_GOTO } from './spaNavigation.js';

/** Register before goto — avoids missing fast GET responses. */
export async function gotoAppointmentsPage(page) {
  const listRes = page.waitForResponse(
    (r) => {
      if (r.request().method() !== 'GET' || !r.ok()) return false;
      try {
        return new URL(r.url()).pathname === '/api/appointments';
      } catch {
        return false;
      }
    },
    { timeout: 25_000 }
  );
  await page.goto('/appointments', SPA_GOTO);
  await listRes;
  await expect(page.getByTestId('appointments-page')).toBeVisible({ timeout: 20_000 });
}
