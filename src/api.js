export const API_BASE = 'https://backend-1-kxxu.onrender.com';

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  let response;
  try {
    response = await fetch(url, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: options.body || undefined,
    });
  } catch (err) {
    throw new Error('Cannot reach server.');
  }
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); }
  catch { data = text; }
  if (!response.ok) {
    throw new Error((data && data.message) ? data.message : 'Server error ' + response.status);
  }
  return data;
}
