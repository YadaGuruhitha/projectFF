export const API_BASE = 'http://localhost:8080';

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const defaults = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
  };

  let response;
  try {
    response = await fetch(url, { ...defaults, ...options });
  } catch (err) {
    throw new Error(
      `Cannot reach backend at ${API_BASE}. Is Spring Boot running?`
    );
  }

  if (!response.ok) {
    let detail = '';
    try { detail = await response.text(); } catch (_) {}
    throw new Error(`Server error ${response.status}${detail ? ': ' + detail : ''}`);
  }

  const ct = response.headers.get('content-type') || '';
  return ct.includes('application/json') ? response.json() : response.text();
}