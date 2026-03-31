import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadJsonFixture(name) {
  const p = path.join(__dirname, '..', 'fixtures', `${name}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function randomEmail(prefix = 'qe') {
  return `${prefix}.${Date.now()}@example.com`;
}
