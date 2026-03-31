const BASE = '';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || 'Invalid response' };
  }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText);
    err.status = res.status;
    err.details = data?.details;
    err.body = data;
    throw err;
  }
  return data;
}

export const authApi = {
  login: (body) => api('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => api('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api('/api/auth/me')
};

export const therapistApi = {
  list: (params) => {
    const q = new URLSearchParams(params).toString();
    return api(`/api/therapists${q ? `?${q}` : ''}`);
  },
  get: (id) => api(`/api/therapists/${id}`),
  slots: (id, from, to) => {
    const q = new URLSearchParams();
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    return api(`/api/therapists/${id}/slots?${q.toString()}`);
  },
  reviews: (id) => api(`/api/therapists/${id}/reviews`)
};

export const appointmentApi = {
  book: (body) => api('/api/appointments', { method: 'POST', body: JSON.stringify(body) }),
  list: () => api('/api/appointments'),
  cancel: (id) => api(`/api/appointments/${id}/cancel`, { method: 'PATCH' }),
  reschedule: (id, newSlotId) =>
    api(`/api/appointments/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify({ newSlotId }) }),
  pay: (id, method) => api(`/api/appointments/${id}/pay`, { method: 'POST', body: JSON.stringify({ method }) }),
  review: (id, body) => api(`/api/appointments/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
  confirm: (id) => api(`/api/appointments/${id}/confirm`, { method: 'PATCH' }),
  complete: (id) => api(`/api/appointments/${id}/complete`, { method: 'PATCH' })
};

export const therapistSelfApi = {
  addSlot: (body) => api('/api/therapists/me/slots', { method: 'POST', body: JSON.stringify(body) }),
  myProfile: () => api('/api/therapists/me/profile')
};
