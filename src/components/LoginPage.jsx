export const API_BASE = 'https://backend-1-kxxu.onrender.com';

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const defaults = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  let response;
  try {
    response = await fetch(url, { ...defaults, ...options });
  } catch (err) {
    throw new Error(
      'Cannot reach the server. Please check your internet connection.'
    );
  }

  // Parse response body
  let data;
  const contentType = response.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch {
    data = null;
  }

  // Handle errors with clean messages
  if (!response.ok) {
    // If backend sent a message field use it
    if (data && data.message) {
      throw new Error(data.message);
    }

    // Clean messages for common status codes
    switch (response.status) {
      case 400: throw new Error('Invalid request. Please check your input.');
      case 401: throw new Error('Incorrect username or password.');
      case 403: throw new Error('Access denied. Please contact admin.');
      case 404: throw new Error('Not found. Please contact admin.');
      case 500: throw new Error('Server error. Please try again in a moment.');
      case 503: throw new Error('Server is starting up. Please wait 30 seconds and try again.');
      default:  throw new Error(`Something went wrong. Please try again.`);
    }
  }

  return data;
} 