export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
export function savedUser() {
  try { return JSON.parse(localStorage.getItem('tripwise_user') || 'null'); }
  catch { return null; }
}
export async function api(path, options = {}) {
  const token = savedUser()?.token;
  const response = await fetch(API_URL + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token && !path.startsWith('/auth/')) {
      localStorage.removeItem('tripwise_user');
      window.dispatchEvent(new Event('tripwise:logout'));
    }
    throw new Error(data.message || 'Request failed. Please try again.');
  }
  return data;
}
export async function startOAuth(provider, role = 'Traveler') {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const encode = value => btoa(String.fromCharCode(...new Uint8Array(value))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const verifier = encode(bytes);
  sessionStorage.setItem('tripwise_oauth_verifier', verifier);
  const challenge = encode(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  const { url } = await api('/auth/oauth/' + provider + '/start', { method: 'POST', body: { role, challenge } });
  window.location.assign(url);
}
export function recordHistory(kind, title, details = '', destinationId = '') {
  if (!savedUser()?.token) return Promise.resolve();
  return api('/portal/history', { method: 'POST', body: { kind, title, details, destinationId } });
}
