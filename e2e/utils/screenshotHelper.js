import path from 'path';
import fs from 'fs';

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 */
export async function captureNamedScreenshot(page, name) {
  const dir = path.join(process.cwd(), 'test-results', 'screenshots');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}
