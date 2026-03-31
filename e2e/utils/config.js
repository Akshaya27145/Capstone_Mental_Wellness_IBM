export const config = {
  baseURL: process.env.BASE_URL || 'http://localhost:5173',
  apiURL: process.env.API_URL || 'http://localhost:4000',
  timeouts: {
    navigation: 30_000,
    action: 15_000
  }
};
