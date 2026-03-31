/**
 * Small wait helpers for UI stability (Playwright prefers auto-waiting; use sparingly).
 * @param {import('@playwright/test').Page} page
 */
export async function waitForNetworkIdle(page, timeout = 5000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    /* non-fatal */
  }
}
