import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { loadJsonFixture, randomEmail } from '../utils/testData.js';

const users = loadJsonFixture('users');

export { users, randomEmail };

export async function loginPatient(page) {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(users.patient.email, users.patient.password);
}

export async function loginPatient2(page) {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(users.patient2?.email || 'patient2@example.com', users.patient.password);
}

export async function loginTherapist(page) {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(users.therapist.email, users.therapist.password);
}

export async function registerFreshPatient(page, { password = 'LongPass99!' } = {}) {
  const reg = new RegisterPage(page);
  await reg.goto();
  const email = randomEmail('tc');
  await reg.register({
    fullName: 'TC User',
    email,
    password,
    role: 'patient'
  });
  return email;
}
