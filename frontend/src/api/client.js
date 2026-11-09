// Tiny fetch wrapper around the Laravel API. Every response has the shape
// { success, message, data, meta?, links? }  or  { success:false, message, code, errors? }.

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'hr_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status, code, errors) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors || null; // { field: [messages] }
  }
  /** First validation message for a field, if any. */
  field(name) {
    return this.errors && this.errors[name] ? this.errors[name][0] : '';
  }
}

function buildQuery(query) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

export async function request(path, { method = 'GET', body, query, token = tokenStore.get() } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (body instanceof FormData) {
    payload = body; // browser sets the multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}${buildQuery(query)}`, { method, headers, body: payload });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 0, 'NETWORK_ERROR');
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || (json && json.success === false)) {
    if (res.status === 401 && token) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status, json?.code, json?.errors);
  }
  return json || { success: true, data: null };
}

export const api = {
  get: (path, query) => request(path, { query }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};
