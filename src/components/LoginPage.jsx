import React, { useState } from 'react';

const BASE = 'https://backend-1-kxxu.onrender.com';

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }

  if (!res.ok) throw new Error(data.message || 'Error ' + res.status);
  return data;
}

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setError('');
    setSuccess('');
  };

  // ✅ SAFE LOGIN HANDLER (FIXED)
  const handleLogin = async (e) => {
    e.preventDefault();
    reset();

    if (!username.trim()) return setError('Enter your username.');
    if (!password) return setError('Enter your password.');

    setLoading(true);

    try {
      const res = await post('/auth/login', {
        username: username.trim(),
        password,
      });

      if (res.success) {
        // ✅ SAFE CALL (fixes your crash)
        if (typeof onLogin === "function") {
          onLogin(res);
        } else {
          console.log("Login success:", res);
        }
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    reset();

    if (!username.trim()) return setError('Username required.');
    if (username.length < 3) return setError('Username min 3 characters.');
    if (!password) return setError('Password required.');
    if (password.length < 4) return setError('Password min 4 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);

    try {
      const res = await post('/auth/register', {
        username: username.trim(),
        password,
        role: 'ADMIN',
      });

      if (res.success) {
        setSuccess('Admin account created!');
        setMode('login');
        setPassword('');
        setConfirm('');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    reset();

    if (!fullName.trim()) return setError('Full name required.');
    if (!studentId.trim()) return setError('Student ID required.');
    if (!username.trim()) return setError('Username required.');
    if (username.length < 3) return setError('Username min 3 characters.');
    if (!password) return setError('Password required.');
    if (password.length < 4) return setError('Password min 4 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);

    try {
      const res = await post('/auth/register/student', {
        username: username.trim(),
        password,
        studentId: studentId.trim().toUpperCase(),
        fullName: fullName.trim(),
      });

      if (res.success) {
        setSuccess('Student account created!');
        setMode('login');
        setPassword('');
        setConfirm('');
        setStudentId('');
        setFullName('');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="card" style={{ padding: 30, width: 400 }}>

        <h2 style={{ textAlign: 'center' }}>SmartSeat Login</h2>

        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {error && <div className="banner banner-error">{error}</div>}
            {success && <div className="banner banner-success">{success}</div>}

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}