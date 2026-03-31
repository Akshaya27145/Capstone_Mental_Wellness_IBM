import { test, expect } from '@playwright/test';
import { BrowseTherapistsPage } from '../pages/BrowseTherapistsPage.js';
import { loginPatient } from '../helpers/session.js';
import { SPA_GOTO } from '../helpers/spaNavigation.js';

/** M4 — 15 tests */
test.describe('M4 — Search & filter (15)', () => {
  test.beforeEach(async ({ page }) => {
    await loginPatient(page);
  });

  test('TC-M4-001 — Filter issue anxiety', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ issueType: 'anxiety' });
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M4-002 — Filter issue depression', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ issueType: 'depression' });
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M4-003 — Min rate boundary 0', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ minRate: '0' });
    expect(await browse.therapistCards().count()).toBeGreaterThan(0);
  });

  test('TC-M4-004 — Max rate 100 excludes high prices', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ maxRate: '100' });
    const cards = browse.therapistCards();
    const n = await cards.count();
    for (let i = 0; i < n; i++) {
      const text = await cards.nth(i).textContent();
      const m = text.match(/\$(\d+(?:\.\d+)?)/);
      if (m) expect(Number(m[1])).toBeLessThanOrEqual(100);
    }
  });

  test('TC-M4-005 — Min rating 4.6', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ minRating: '4.6' });
    const cards = browse.therapistCards();
    const n = await cards.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const rating = cards.nth(i).getByTestId('therapist-card-rating');
      await expect(rating).toBeVisible({ timeout: 20_000 });
      const ratingText = await rating.textContent();
      expect(parseFloat((ratingText || '').trim())).toBeGreaterThanOrEqual(4.6);
    }
  });

  test('TC-M4-006 — Available date filter', async ({ page }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const d = tomorrow.toISOString().slice(0, 10);
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ availableDate: d });
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M4-007 — Combined filters', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ issueType: 'anxiety', minRating: '4.0', maxRate: '200' });
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M4-008 — Search name Morgan', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ search: 'Morgan' });
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M4-009 — No results high min rate', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ minRate: '99999' });
    await expect(page.getByText(/no therapists match/i)).toBeVisible();
  });

  test('TC-M4-010 — Invalid available date string', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ availableDate: '99-99-99' });
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M4-011 — Reset list by reloading after narrow search', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ search: 'ZZZNOMATCH123' });
    await page.goto('/therapists', SPA_GOTO);
    expect(await browse.therapistCards().count()).toBeGreaterThan(0);
  });

  test('TC-M4-012 — Min rate greater than max rate', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ minRate: '200', maxRate: '50' });
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M4-013 — Decimal min rating 4.7', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ minRating: '4.7' });
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M4-014 — Issue filter uses known option', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ issueType: 'family' });
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });

  test('TC-M4-015 — SQL-ish search literal', async ({ page }) => {
    const browse = new BrowseTherapistsPage(page);
    await browse.goto();
    await browse.applyFilters({ search: "' OR 1=1 --" });
    await expect(page.getByTestId('therapist-list')).toBeVisible();
  });
});
