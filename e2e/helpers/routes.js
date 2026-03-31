import { SPA_GOTO } from './spaNavigation.js';

export async function firstTherapistId(page) {
  await page.goto('/therapists', SPA_GOTO);
  await page.getByTestId('therapist-list').waitFor({ state: 'visible', timeout: 20_000 });
  const href = await page.locator('[data-testid^="link-profile-"]').first().getAttribute('href');
  const m = href?.match(/therapists\/(\d+)/);
  return m ? m[1] : null;
}

/** First therapist profile id whose book page shows at least one open slot (not necessarily highest-rated). */
export async function bookableTherapistProfileId(page) {
  await page.goto('/therapists', SPA_GOTO);
  await page.getByTestId('therapist-list').waitFor({ state: 'visible', timeout: 25_000 });
  const hrefs = await page
    .locator('[data-testid^="link-profile-"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href')));
  for (const href of hrefs) {
    const m = href?.match(/therapists\/(\d+)/);
    if (!m) continue;
    await page.goto(`/therapists/${m[1]}/book`, SPA_GOTO);
    await page.getByTestId('book-session').waitFor({ state: 'visible', timeout: 20_000 });
    const slotCount = await page.locator('button[data-testid^="slot-"]').count();
    if (slotCount > 0) return m[1];
  }
  return null;
}
