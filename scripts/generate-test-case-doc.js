import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cases = [];

function add(module, id, desc, pre, steps, data, exp, tech = 'EP') {
  cases.push({ module, id, desc, pre, steps, data, exp, tech });
}

// M1 Registration & Login (15)
add('M1', 'TC-M1-001', 'Valid patient registration', 'DB up; email unused', 'Open /register → fill all required → submit', 'Name "Alex Q", valid email, pwd "Pass1234!", role patient', 'User created; auto-login; lands on /therapists', 'EP valid class');
add('M1', 'TC-M1-002', 'Valid therapist registration', 'Email unused', 'Register as therapist', 'Same as M1-001 with role therapist', 'Profile row exists; can open /therapist/dashboard', 'EP');
add('M1', 'TC-M1-003', 'Reject duplicate email', 'Email exists (seed patient1)', 'Register with same email', 'patient1@example.com', '409 / UI error duplicate', 'Negative');
add('M1', 'TC-M1-004', 'Password boundary min-1', '—', 'Password 7 chars', 'Pass123', 'Validation error min 8', 'BVA');
add('M1', 'TC-M1-005', 'Password boundary min', '—', 'Password exactly 8', 'Pass1234', 'Accept', 'BVA');
add('M1', 'TC-M1-006', 'Invalid email format', '—', 'Malformed email', 'not-an-email', '400 validation', 'Negative');
add('M1', 'TC-M1-007', 'Login valid patient', 'Seed patient1', 'Login form submit', 'patient1@example.com / DemoPass123!', 'JWT returned; browse loads', 'Positive');
add('M1', 'TC-M1-008', 'Login wrong password', 'User exists', 'Wrong password', 'patient1@example.com / wrong', '401 invalid credentials', 'Negative');
add('M1', 'TC-M1-009', 'Login unknown user', '—', 'Random email', 'nope@example.com / x', '401', 'Negative');
add('M1', 'TC-M1-010', 'Inactive account login', 'inactive@example.com seeded', 'Login', 'inactive@example.com / DemoPass123!', 'Account deactivated message', 'Negative');
add('M1', 'TC-M1-011', 'Logout clears session', 'Logged in', 'Logout → hit /appointments', '—', 'Redirect login', 'Alternate');
add('M1', 'TC-M1-012', 'Therapist blocked from patient book URL', 'Therapist logged in', 'Navigate /therapists/1/book', '—', 'Redirect home or forbidden UX', 'Role DT');
add('M1', 'TC-M1-013', 'Optional phone omitted', '—', 'Register without phone', 'Empty phone', 'Success', 'EP optional');
add('M1', 'TC-M1-014', 'Name too short', '—', 'Name 1 char', 'A', 'Validation error', 'BVA');
add('M1', 'TC-M1-015', 'JWT missing on protected route', 'No token', 'GET /appointments', '—', '401 from API if called directly; UI redirects', 'Negative');

// M2 Browse (15)
add('M2', 'TC-M2-001', 'Default list non-empty after seed', 'Seed run', 'Open /therapists', '—', '≥1 card', 'Positive');
add('M2', 'TC-M2-002', 'Card fields present', 'List visible', 'Inspect first card', '—', 'Name, spec, rate, rating, experience', 'UI');
add('M2', 'TC-M2-003', 'Navigate to profile', 'List visible', 'Click View profile', '—', 'Profile route loads', 'Positive');
add('M2', 'TC-M2-004', 'Issue pills render', '—', 'Open card', '—', 'Pills match API issue types', 'UI vs API');
add('M2', 'TC-M2-005', 'API returns only active therapists', 'Deactivate user in DB', 'Refresh list', '—', 'Inactive therapist hidden', 'DB+UI');
add('M2', 'TC-M2-006', 'Sort/rating order', 'Multiple therapists', 'Observe order', '—', 'Higher rating tends first (service rule)', 'System');
add('M2', 'TC-M2-007', 'Empty list graceful', 'Filter impossible combo', 'Apply filters', 'minRate > maxRate high', 'Message no match', 'Edge');
add('M2', 'TC-M2-008', 'Network error handling', 'Stop API', 'Load page', '—', 'User-visible error', 'Negative');
add('M2', 'TC-M2-009', 'Responsive layout', 'Narrow viewport', 'Resize', '—', 'Cards stack; no horizontal overflow', 'UI');
add('M2', 'TC-M2-010', 'Keyboard focus order', 'Tab through filters', '—', 'Logical focus', 'A11y smoke');
add('M2', 'TC-M2-011', 'Deep link /therapists', 'Logged out', 'Open URL', '—', 'List still public', 'Positive');
add('M2', 'TC-M2-012', 'Concurrent refresh', '—', 'Double-click Apply', '—', 'No duplicate crash', 'Edge');
add('M2', 'TC-M2-013', 'Special characters in search', '—', 'Search "%_"', 'SQL-ish chars', 'Handled safely (no 500)', 'Security smoke per scope');
add('M2', 'TC-M2-014', 'Large search string', '—', '200 char search', 'Long string', 'Trim or validate', 'Boundary');
add('M2', 'TC-M2-015', 'Therapist with zero reviews', 'DB insert therapist no reviews', 'Open card', '—', '0 reviews displayed', 'EP');

// M3 Profile (15)
add('M3', 'TC-M3-001', 'Load valid profile', 'Known id', 'GET profile page', 'id=1', 'Bio, rate, rating visible', 'Positive');
add('M3', 'TC-M3-002', 'Invalid id', '—', 'id=99999', '—', '404 or error message', 'Negative');
add('M3', 'TC-M3-003', 'Reviews list empty', 'Therapist no reviews', 'Open reviews', '—', 'Empty state text', 'EP');
add('M3', 'TC-M3-004', 'Reviews list with rows', 'Seed review', 'Open', '—', 'Stars + patient name', 'Positive');
add('M3', 'TC-M3-005', 'Book CTA patient', 'Patient login', 'Open profile', '—', 'Book button visible', 'DT role');
add('M3', 'TC-M3-006', 'Book hidden guest', 'Logged out', 'Open profile', '—', 'Login prompt; no book', 'DT');
add('M3', 'TC-M3-007', 'Back navigation', 'From book flow', 'Browser back', '—', 'Profile state consistent', 'Alternate');
add('M3', 'TC-M3-008', 'Malformed id in URL', '—', '/therapists/abc', '—', 'Error', 'Negative');
add('M3', 'TC-M3-009', 'Profile matches DB specialization', 'Compare SQL', 'Visual check', '—', 'Match', 'DB');
add('M3', 'TC-M3-010', 'Hourly rate format', '—', 'View', '—', 'Currency style $', 'UI');
add('M3', 'TC-M3-011', 'Long bio display', 'DB bio 4000 chars', 'Load', '—', 'Wrapped / scroll', 'Boundary');
add('M3', 'TC-M3-012', ' XSS-safe rendering', 'Bio with <script>', 'Stored via API', 'Escaped in UI', 'UI smoke');
add('M3', 'TC-M3-013', 'Parallel load profile+reviews', 'Throttling', 'Slow 3G sim', '—', 'Eventually consistent', 'Edge');
add('M3', 'TC-M3-014', 'Therapist views own public profile', 'Therapist login', 'Open /therapists/:selfId', '—', 'Public view OK', 'Alternate');
add('M3', 'TC-M3-015', 'Stale link after therapist deleted', 'Rare', 'Delete user DB', 'Hit old URL', '404', 'Negative');

// M4 Search & Filter (15)
add('M4', 'TC-M4-001', 'Filter anxiety', 'Seed', 'Issue=anxiety Apply', '—', 'Only matching therapists', 'EP');
add('M4', 'TC-M4-002', 'Filter depression', '—', 'depression', '—', 'Subset correct', 'EP');
add('M4', 'TC-M4-003', 'Min rate boundary 0', '—', 'minRate=0', '—', 'All within range', 'BVA');
add('M4', 'TC-M4-004', 'Max rate excludes expensive', '—', 'maxRate=100', '—', 'No therapist >100', 'BVA');
add('M4', 'TC-M4-005', 'Min rating 4.5', '—', 'minRating=4.5', '—', 'All ≥4.5', 'BVA');
add('M4', 'TC-M4-006', 'Available date filter', 'Known slot date', 'availableDate', '—', 'Therapists with free slot that day', 'Decision');
add('M4', 'TC-M4-007', 'Combined filters', '—', 'issue+rate+rating', '—', 'AND semantics', 'DT');
add('M4', 'TC-M4-008', 'Search name partial', '—', 'search=Morgan', '—', 'Matching names', 'EP');
add('M4', 'TC-M4-009', 'No results message', 'minRate=9999', 'Apply', '—', 'Empty state', 'Negative');
add('M4', 'TC-M4-010', 'Invalid date format', '—', 'availableDate bad', '99-99-99', 'Validation / ignore', 'Negative');
add('M4', 'TC-M4-011', 'Reset filters', '—', 'Clear fields re-apply', '—', 'Full list', 'Alternate');
add('M4', 'TC-M4-012', 'minRate > maxRate', '—', 'min=200 max=50', '—', 'Empty or validation', 'Edge');
add('M4', 'TC-M4-013', 'Decimal rating filter', '—', '4.7', '—', 'Correct rounding', 'BVA');
add('M4', 'TC-M4-014', 'Case insensitive issue', '—', 'ANXIETY vs anxiety', '—', 'Same results', 'EP');
add('M4', 'TC-M4-015', 'SQL injection in search', '—', "' OR 1=1 --", '—', 'Treated as literal; no leak', 'Negative');

// M5 Book session (15)
add('M5', 'TC-M5-001', 'Book first open slot', 'Patient; free slot', 'Select slot → confirm', 'Valid ids', 'Success; appointments list', 'Positive');
add('M5', 'TC-M5-002', 'No slot selected', '—', 'Confirm without pick', '—', 'UI error', 'Negative');
add('M5', 'TC-M5-003', 'Double book same slot', 'Two patients', 'Both book same slot quickly', '—', 'One fails server-side', 'Race');
add('M5', 'TC-M5-004', 'Wrong therapistProfileId for slot', 'Tamper body', 'API direct wrong id', 'Mismatch', 'Slot does not belong error', 'Negative');
add('M5', 'TC-M5-005', 'Patient overlap', 'Existing appt same time', 'Book another', '—', 'Overlap error', 'Negative');
add('M5', 'TC-M5-006', 'Notes max length', '—', '501 chars notes', '—', 'Validation', 'BVA');
add('M5', 'TC-M5-007', 'Guest cannot book', 'Logged out', 'Hit book URL', '—', 'Redirect login', 'Negative');
add('M5', 'TC-M5-008', 'Therapist cannot POST book', 'Therapist JWT', 'API', '—', '403', 'Role');
add('M5', 'TC-M5-009', 'Slot already booked flag', 'After book', 'DB availability_slots', '—', 'is_booked=1', 'DB');
add('M5', 'TC-M5-010', 'Appointment status PENDING', 'After book', 'Query row', '—', 'PENDING', 'DB');
add('M5', 'TC-M5-011', 'Past date slot (if created)', 'Manual slot yesterday', 'Book', '—', 'Business rule reject or allow per product', 'Edge');
add('M5', 'TC-M5-012', 'Zero duration slot', 'DB invalid', '—', 'App prevents / DB constraint', 'Edge');
add('M5', 'TC-M5-013', 'Notes optional empty', '—', 'Leave blank', '—', 'Success', 'EP');
add('M5', 'TC-M5-014', 'Unicode notes', '—', 'Notes with emoji', '—', 'Stored correctly', 'EP');
add('M5', 'TC-M5-015', 'Refresh after book', '—', 'F5 on book page', '—', 'No duplicate submit warning UX', 'Alternate');

// M6 Appointments (15)
add('M6', 'TC-M6-001', 'Patient cancel PENDING', 'Own appt', 'Cancel', '—', 'Slot freed; status CANCELLED', 'Positive');
add('M6', 'TC-M6-002', 'Cancel COMPLETED rejected', 'Completed appt', 'Cancel', '—', 'Error', 'Negative');
add('M6', 'TC-M6-003', 'Reschedule valid slot', 'PENDING', 'Pick new free slot', 'newSlotId', 'Success; old slot free', 'Positive');
add('M6', 'TC-M6-004', 'Reschedule to taken slot', '—', 'Booked slot id', '—', 'Error', 'Negative');
add('M6', 'TC-M6-005', 'Reschedule other therapist slot', '—', 'Wrong therapist slot', '—', 'Error', 'Negative');
add('M6', 'TC-M6-006', 'Therapist confirm', 'PENDING appt', 'Confirm', '—', 'CONFIRMED', 'Positive');
add('M6', 'TC-M6-007', 'Confirm twice', 'Already CONFIRMED', 'Confirm', '—', 'Error', 'Negative');
add('M6', 'TC-M6-008', 'Complete flow', 'CONFIRMED', 'Complete', '—', 'COMPLETED', 'Positive');
add('M6', 'TC-M6-009', 'Complete from PENDING', '—', 'Complete', '—', 'Rejected', 'Negative');
add('M6', 'TC-M6-010', 'Other patient cannot cancel', 'Patient B', 'Cancel A appt', '—', '403', 'Negative');
add('M6', 'TC-M6-011', 'Therapist cancel own calendar', 'Therapist', 'Cancel patient appt', '—', 'Allowed; slot free', 'Positive');
add('M6', 'TC-M6-012', 'List shows payment column', 'Patient', 'Open appointments', '—', 'Status shown', 'UI');
add('M6', 'TC-M6-013', 'Open session room link', 'CONFIRMED', 'Click open session', '—', 'Mock room visible', 'UI');
add('M6', 'TC-M6-014', 'Reschedule overlap patient', 'Two appts adjacent', 'Move into conflict', '—', 'Rejected', 'Negative');
add('M6', 'TC-M6-015', 'Appointment ordering', 'Multiple rows', 'View list', '—', 'Descending by start time', 'System');

// M7 Payment (15)
add('M7', 'TC-M7-001', 'Pay confirmed appointment', 'Patient owner', 'Pay', 'card_simulated', 'completed; paid_at set', 'Positive');
add('M7', 'TC-M7-002', 'Double pay blocked', 'Already paid', 'Pay again', '—', 'Error', 'Negative');
add('M7', 'TC-M7-003', 'Pay PENDING rejected', 'Not confirmed', 'Pay', '—', 'Business / UI gate', 'Negative');
add('M7', 'TC-M7-004', 'Wrong patient', 'Patient B', 'Pay A', '—', '403', 'Negative');
add('M7', 'TC-M7-005', 'Wallet method', '—', 'wallet_simulated', '—', 'Row stores method', 'Alternate');
add('M7', 'TC-M7-006', 'Amount matches hourly rate', '—', 'Compare payment amount', '—', 'Matches therapist rate', 'DB');
add('M7', 'TC-M7-007', 'Transaction ref unique pattern', '—', 'Pay', '—', 'SIM- prefix', 'UI/API');
add('M7', 'TC-M7-008', 'Pay-fail hook', '—', 'POST pay-fail', '—', 'status failed', 'Negative path');
add('M7', 'TC-M7-009', 'Currency USD default', '—', 'Inspect row', '—', 'USD', 'DB');
add('M7', 'TC-M7-010', 'Therapist cannot pay', 'Therapist JWT', 'Pay endpoint', '—', '403', 'Role');
add('M7', 'TC-M7-011', 'Missing appointment', '—', 'id=0', '—', '404', 'Negative');
add('M7', 'TC-M7-012', 'UI Pay button only when CONFIRMED', 'Mixed statuses', 'Observe', '—', 'Correct enablement', 'DT');
add('M7', 'TC-M7-013', 'Refresh after pay', '—', 'Reload', '—', 'Still completed', 'Regression');
add('M7', 'TC-M7-014', 'Concurrent double pay', 'Scripts', 'Two parallel pays', '—', 'One wins; one error', 'Race');
add('M7', 'TC-M7-015', 'Payment row 1:1 appointment', 'DB', 'Query', '—', 'Unique appointment_id', 'DB');

// M8 Reviews (15)
add('M8', 'TC-M8-001', 'Review completed session', 'Patient; COMPLETED', 'Submit 5 stars', 'comment text', '201; row in reviews', 'Positive');
add('M8', 'TC-M8-002', 'Duplicate review', 'Already reviewed', 'Submit again', '—', 'Duplicate error', 'Negative');
add('M8', 'TC-M8-003', 'Review PENDING appt', '—', 'POST review', '—', 'Rejected', 'Negative');
add('M8', 'TC-M8-004', 'Rating boundary 0', '—', 'rating=0', '—', '400', 'BVA');
add('M8', 'TC-M8-005', 'Rating boundary 1', '—', 'rating=1', '—', 'OK', 'BVA');
add('M8', 'TC-M8-006', 'Rating boundary 5', '—', 'rating=5', '—', 'OK', 'BVA');
add('M8', 'TC-M8-007', 'Rating boundary 6 invalid', '—', 'rating=6', '—', '400', 'BVA');
add('M8', 'TC-M8-008', 'Therapist cannot review', 'Therapist JWT', 'POST', '—', '403', 'Role');
add('M8', 'TC-M8-009', 'Comment optional empty', '—', 'No comment', '—', 'OK', 'EP');
add('M8', 'TC-M8-010', 'Comment max 2000', '—', '2001 chars', '—', 'Validation', 'BVA');
add('M8', 'TC-M8-011', 'Profile aggregates updated', 'After review', 'SQL avg', '—', 'Matches therapist_profiles', 'DB');
add('M8', 'TC-M8-012', 'Public list shows new review', '—', 'Open /therapists/:id/reviews', '—', 'Visible', 'UI');
add('M8', 'TC-M8-013', 'Wrong patient review', 'Patient B', 'Review A appt', '—', '403', 'Negative');
add('M8', 'TC-M8-014', 'Emoji / unicode comment', '—', 'Unicode', '—', 'Stored', 'EP');
add('M8', 'TC-M8-015', 'Review removed when appointment deleted', 'CASCADE', 'Delete appt DB', '—', 'Review row gone', 'DB');

let md = '# Test Cases by Module\n\n';
md += '**Requirement:** ≥15 test cases per module (8 modules). **Techniques:** EP = Equivalence Partitioning, BVA = Boundary Value Analysis, DT = Decision Table.\n\n';

let lastMod = '';
for (const c of cases) {
  if (c.module !== lastMod) {
    md += `\n## Module ${c.module}\n\n`;
    lastMod = c.module;
  }
  md += `### ${c.id} — ${c.desc}\n`;
  md += `- **Preconditions:** ${c.pre}\n`;
  md += `- **Steps:** ${c.steps}\n`;
  md += `- **Test data:** ${c.data}\n`;
  md += `- **Expected result:** ${c.exp}\n`;
  md += `- **Technique / type:** ${c.tech}\n\n`;
}

const out = path.join(__dirname, '..', 'docs', 'qe', '04-test-cases-by-module.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md, 'utf8');
console.log('Wrote', out, 'cases:', cases.length);
