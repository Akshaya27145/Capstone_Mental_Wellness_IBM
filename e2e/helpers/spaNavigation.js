/** Vite dev server can keep the document in "loading" (HMR / pending resources). DOM-ready is enough for our SPA. */
export const SPA_GOTO = { waitUntil: 'domcontentloaded', timeout: 60_000 };
