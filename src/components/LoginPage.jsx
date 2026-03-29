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
  try { data = JSON.parse(text); }
  catch { data = { message: text }; }
  if (!res.ok) throw new Error(data.message || 'Error ' + res.status);
  return data;
}

export default function LoginPage({ onLogin }) {
  const [mode, setMode]           = useState('login');
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName]   = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);

  const reset = () => { setError(''); setSuccess(''); };

  const handleLogin = async (e) => {
    e.preventDefault(); reset();
    if (!username.trim()) { setError('Enter your username.'); return; }
    if (!password) { setError('Enter your password.'); return; }
    setLoading(true);
    try {
      const res = await post('/auth/login', {
        username: username.trim(),
        password: password,
      });
      if (res.success) { onLogin(res); }
      else { setError(res.message || 'Login failed.'); }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault(); reset();
    if (!username.trim()) { setError('Username required.'); return; }
    if (username.length < 3) { setError('Username min 3 characters.'); return; }
    if (!password) { setError('Password required.'); return; }
    if (password.length < 4) { setError('Password min 4 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await post('/auth/register', {
        username: username.trim(),
        password: password,
        role: 'ADMIN',
      });
      if (res.success) {
        setSuccess('Admin account created! You can now sign in.');
        setMode('login'); setPassword(''); setConfirm('');
      } else { setError(res.message || 'Registration failed.'); }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault(); reset();
    if (!fullName.trim()) { setError('Full name required.'); return; }
    if (!studentId.trim()) { setError('Student ID required.'); return; }
    if (!username.trim()) { setError('Username required.'); return; }
    if (username.length < 3) { setError('Username min 3 characters.'); return; }
    if (!password) { setError('Password required.'); return; }
    if (password.length < 4) { setError('Password min 4 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await post('/auth/register/student', {
        username: username.trim(),
        password: password,
        studentId: studentId.trim().toUpperCase(),
        fullName: fullName.trim(),
      });
      if (res.success) {
        setSuccess('Student account created! You can now sign in.');
        setMode('login');
        setPassword(''); setConfirm('');
        setStudentId(''); setFullName('');
      } else { setError(res.message || 'Registration failed.'); }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const tabStyle = (id) => ({
    flex: 1, padding: '7px 4px', border: 'none',
    borderRadius: 4, cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: '0.75rem',
    textTransform: 'uppercase', fontWeight: 500,
    transition: 'all 0.2s',
    background: mode === id
      ? 'linear-gradient(135deg, var(--gideon-dark), var(--gideon-mid))'
      : 'transparent',
    color: mode === id ? 'var(--gideon-pale)' : 'var(--text-muted)',
  });

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14,
            margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, var(--gideon-dark), var(--gideon-warm))',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 24,
          }}>🪑</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '2rem',
            fontWeight: 400, color: 'var(--text-primary)',
          }}>
            Smart<span style={{ color: 'var(--gideon-warm)' }}>Seat</span>
          </h1>
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
          }}>
            EXAM SEATING ALLOCATION SYSTEM
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>

          <div style={{
            display: 'flex', background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 4, gap: 4, marginBottom: '1.5rem',
          }}>
            <button type="button" style={tabStyle('login')}
              onClick={() => { setMode('login'); reset(); }}>Sign In</button>
            <button type="button" style={tabStyle('register')}
              onClick={() => { setMode('register'); reset(); }}>Admin</button>
            <button type="button" style={tabStyle('student-register')}
              onClick={() => { setMode('student-register'); reset(); }}>Student</button>
          </div>

          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" type="text"
                    placeholder="Your username" autoFocus
                    value={username}
                    onChange={e => { setUsername(e.target.value); reset(); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password"
                    placeholder="••••••••" value={password}
                    onChange={e => { setPassword(e.target.value); reset(); }} />
                </div>
                {error && <div className="banner banner-error" style={{ margin: 0 }}>⚠ {error}</div>}
                {success && <div className="banner banner-success" style={{ margin: 0 }}>✓ {success}</div>}
                <button type="submit" className="btn btn-primary"
                  disabled={loading} style={{ width: '100%', padding: 11 }}>
                  {loading ? <><span className="spinner" /> Signing in…</> : '→ Sign In'}
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleAdminRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="banner banner-info" style={{ margin: 0 }}>
                  Admin accounts have full access to the system.
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" type="text"
                    placeholder="e.g. admin" autoFocus value={username}
                    onChange={e => { setUsername(e.target.value); reset(); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password"
                    placeholder="••••••••" value={password}
                    onChange={e => { setPassword(e.target.value); reset(); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password"
                    placeholder="••••••••" value={confirm}
                    onChange={e => { setConfirm(e.target.value); reset(); }} />
                </div>
                {error && <div className="banner banner-error" style={{ margin: 0 }}>⚠ {error}</div>}
                {success && <div className="banner banner-success" style={{ margin: 0 }}>✓ {success}</div>}
                <button type="submit" className="btn btn-primary"
                  disabled={loading} style={{ width: '100%', padding: 11 }}>
                  {loading ? <><span className="spinner" /> Creating…</> : '→ Create Admin Account'}
                </button>
              </div>
            </form>
          )}

          {mode === 'student-register' && (
            <form onSubmit={handleStudentRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="banner banner-info" style={{ margin: 0 }}>
                  Students can view seat after admin generates seating.
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text"
                    placeholder="e.g. Alice Johnson" autoFocus
                    value={fullName}
                    onChange={e => { setFullName(e.target.value); reset(); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <input className="form-input" type="text"
                    placeholder="e.g. A001" value={studentId}
                    onChange={e => { setStudentId(e.target.value); reset(); }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Must match exactly with your ID in the seating system.
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" type="text"
                    placeholder="Choose a username" value={username}
                    onChange={e => { setUsername(e.target.value); reset(); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password"
                    placeholder="••••••••" value={password}
                    onChange={e => { setPassword(e.target.value); reset(); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password"
                    placeholder="••••••••" value={confirm}
                    onChange={e => { setConfirm(e.target.value); reset(); }} />
                </div>
                {error && <div className="banner banner-error" style={{ margin: 0 }}>⚠ {error}</div>}
                {success && <div className="banner banner-success" style={{ margin: 0 }}>✓ {success}</div>}
                <button type="submit" className="btn btn-primary"
                  disabled={loading} style={{ width: '100%', padding: 11 }}>
                  {loading ? <><span className="spinner" /> Creating…</> : '→ Create Student Account'}
                </button>
              </div>
            </form>
          )}

        </div>

        <p style={{
          textAlign: 'center', marginTop: '1.25rem',
          fontSize: '0.7rem', color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          Credentials stored in PostgreSQL · SmartSeat v2.0
        </p>
      </div>
    </div>
  );
}