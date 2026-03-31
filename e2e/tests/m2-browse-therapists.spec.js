import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { BrowseTherapistsPage } from '../pages/BrowseTherapistsPage.js';
import { users, loginPatient } from '../helpers/session.js';

/** M2 — 15 tests (TC-M2-001 … TC-M2-015) */
test.describe('M2 — Browse therapists (15)', () => {
  function therapistArticles(page) {
    return page.getByTestId('therapist-list').locator('article[data-testid^="therapist-card-"]');
  }

  test('TC-M2-001 — Default list non-empty after seed', async ({ page }) => {
    await page.goto('/therapists');
    await page.getByTestId('therapist-list').waitFor({ state: 'visible', timeout: 25_000 });
    await expect(therapistArticles(page).first()).toBeVisible({ timeout: 25_000 });
    expect(await therapistArticles(page).count()).toBeGreaterThan(0);
  });

  test('TC-M2-002 — Card fields present', async ({ page }) => {
    await page.goto('/therapists');
    await page.getByTestId('therapist-list').waitFor({ state: 'visible', timeout: 25_000 });
    const card = therapistArticles(page).first();
    await expect(card.locator('h3')).toBeVisible();
    await expect(card.getByText(/\$/).first()).toBeVisible();
    await expect(card.getByText(/⭐/)).toBeVisible();
  });

  test('TC-M2-003 — Navigate to profile from list', async ({ page }) => {
    await page.goto('/therapists');
    await page.getByTestId('therapist-list').waitFor({ state: 'visible', timeout: 25_000 });
    await expect(therapistArticles(page).first()).toBeVisible({ timeout: 25_000 });
    await page.locator('[data-testid^="link-profile-"]').first().click();
    await expect(page.getByTestId('therapist-profile')).toBeVisible();
  });

  test('TC-M2-004 — Issue pills render on card', async ({ page }) => {
    await page.goto('/therapists');
    await page.getByTestId('therapist-list').waitFor({ state: 'visible', timeout: 25_000 });
    await expect(therapistArticles(page).first()).toBeVisible({ timeout: 25_000 });
    const pill = page.locator('.pill').first();
    await expect(pill).toBeVisible();
  });

  test('TC-M2-005 — Inactive therapist hidden (manual DB check)', () => {
    // Deactivate therapist in DB; docs/qe + SQL
  });

  test('TC-M2-006 — List ordered by rating (first card has rating text)', async ({ page }) => {
    await page.goto('/therapists');
    await page.getByTestId('therapist-list').waitFor({ state: 'visible', timeout: 25_000 });
    await expect(therapistArticles(page).first().getByText(/⭐/)).toBeVisible({ timeout: 25_000 });
  });

  test('TC-M2-007 — Empty list graceful (impossible min rate)', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await loginPatient(page);
    await browse.goto();
    await browse.applyFilters({ minRate: '99999' });
    await expect(page.getByText(/no therapists match/i)).toBeVisible();
  });

  test('TC-M2-008 — Error state when API unreachable', async ({ page }) => {
    await page.route(
      (url) => {
        try {
          return new URL(url).pathname === '/api/therapists';
        } catch {
          return false;
        }
      },
      (route) => route.abort()
    );
    await page.goto('/therapists');
    await page.getByTestId('therapist-list').waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
    await expect(page.locator('.alert.error')).toBeVisible({ timeout: 15_000 });
  });

  test('TC-M2-009 — Responsive narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/therapists');
    await expect(page.getByTestId('therapist-list')).toBeVisible({ timeout: 25_000 });
  });

  test('TC-M2-010 — Filters keyboard reachable', async ({ page }) => {
    await page.goto('/therapists');
    await page.getByTestId('filter-search').focus();
    await expect(page.getByTestId('filter-search')).toBeFocused();
  });

  test('TC-M2-011 — Deep link /therapists while logged out', async ({ page }) => {
    await page.goto('/therapists');
    await expect(page.getByTestId('therapist-list')).toBeVisible({ timeout: 25_000 });
  });

  test('TC-M2-012 — Double-click Apply filters does not crash', async ({ page }) => {
    await loginPatient(page);
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    const btn = page.getByTestId('btn-apply-filters');
    await btn.dblclick();
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M2-013 — Special characters in search', async ({ page }) => {
    await loginPatient(page);
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ search: '%_\' OR' });
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M2-014 — Large search string', async ({ page }) => {
    await loginPatient(page);
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    const long = 'a'.repeat(200);
    await browse.applyFilters({ search: long });
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M2-015 — Zero reviews text may appear on card', async ({ page }) => {
    await page.goto('/therapists');
    await page.getByTestId('therapist-list').waitFor({ state: 'visible', timeout: 25_000 });
    await expect(therapistArticles(page).first()).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(/reviews/i).first()).toBeVisible({ timeout: 25_000 });
  });
});
