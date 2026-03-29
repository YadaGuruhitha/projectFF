export const API_BASE = 'https://backend-1-kxxu.onrender.com';

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error(
      'Cannot reach the server. Please check your internet connection.'
    );
  }

  // Try to get response text first
  let responseText = '';
  try {
    responseText = await response.clone().text();
  } catch (err) {
    responseText = '';
  }

  // Try to parse as JSON
  let data = null;
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    data = responseText;
  }

  // Handle error responses
  if (!response.ok) {
    // Use message from backend if available
    if (data && typeof data === 'object' && data.message) {
      throw new Error(data.message);
    }

    // Clean messages for status codes
    if (response.status === 400) throw new Error('Invalid input. Please check and try again.');
    if (response.status === 401) throw new Error('Incorrect username or password.');
    if (response.status === 403) throw new Error('Access denied. Please contact admin.');
    if (response.status === 404) throw new Error('Not found. Please contact admin.');
    if (response.status === 500) throw new Error('Server error. Please try again in a moment.');
    if (response.status === 503) throw new Error('Server is starting up. Please wait 30 seconds and try again.');

    throw new Error('Something went wrong. Please try again.');
  }

  return data;
}