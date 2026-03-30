export const API_BASE = 'https://backend-1-kxxu.onrender.com';

export async function apiFetch(path, options) {
  var opts = options || {};
  var url = API_BASE + path;
  var res;
  try {
    res = await fetch(url, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: opts.body || null,
    });
  } catch (e) {
    throw new Error('Cannot reach server. Check internet.');
  }
  var txt = await res.text();
  var obj;
  try { obj = JSON.parse(txt); } catch (e) { obj = txt; }
  if (!res.ok) {
    var msg = (obj && obj.message) ? obj.message : ('Error ' + res.status);
    throw new Error(msg);
  }
  return obj;
}
