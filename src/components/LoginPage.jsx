import React, { useState } from 'react';
import { apiFetch } from '../api';

export default function LoginPage({ onLogin }) {
  const [mode, setMode]         = useState('login');    // 'login' | 'register' | 'student-register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName]   = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const reset = () => { setError(''); setSuccess(''); };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault(); reset();
    if (!username.trim() || !password) {
      setError('Enter username and password.'); return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (res.success) {
        onLogin(res);   // pass full response to App.jsx
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Admin Register ─────────────────────────────────────────────────────────
  const handleAdminRegister = async (e) => {
    e.preventDefault(); reset();
    if (!username.trim())     { setError('Username required.'); return; }
    if (password.length < 4)  { setError('Password: min 4 characters.'); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password, role: 'ADMIN' }),
      });
      if (res.success) {
        setSuccess('Admin account created! You can now sign in.');
        setMode('login'); setPassword(''); setConfirm('');
      } else { setError(res.message); }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Student Register ───────────────────────────────────────────────────────
  const handleStudentRegister = async (e) => {
    e.preventDefault(); reset();
    if (!username.trim())     { setError('Username required.'); return; }
    if (!fullName.trim())     { setError('Full name required.'); return; }
    if (!studentId.trim())    { setError('Student ID required (e.g. A001).'); return; }
    if (password.length < 4)  { setError('Password: min 4 characters.'); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await apiFetch('/auth/register/student', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          password,
          studentId: studentId.trim().toUpperCase(),
          fullName: fullName.trim(),
        }),
      });
      if (res.success) {
        setSuccess('Student account created! You can now sign in.');
        setMode('login'); setPassword(''); setConfirm('');
        setStudentId(''); setFullName('');
      } else { setError(res.message); }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14, margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, var(--accent-dark), var(--accent-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, boxShadow: '0 4px 16px rgba(74,85,104,0.2)',
          }}>🪑</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem',
            fontWeight: 400, color: 'var(--text-primary)' }}>
            Smart<span style={{ color: 'var(--accent-warm)' }}>Seat</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            EXAM SEATING ALLOCATION SYSTEM
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>

          {/* Mode tabs */}
          <div style={{
            display: 'flex', background: 'var(--bg-raised)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: 4, gap: 4, marginBottom: '1.5rem',
          }}>
            {[
              { id: 'login',            label: 'Sign In' },
              { id: 'register',         label: 'Admin' },
              { id: 'student-register', label: 'Student' },
            ].map(m => (
              <button key={m.id} type="button"
                onClick={() => { setMode(m.id); reset(); }}
                style={{
                  flex: 1, padding: '7px 4px', border: 'none',
                  borderRadius: 4, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                  textTransform: 'uppercase', fontWeight: 500,
                  transition: 'all 0.2s',
                  background: mode === m.id
                    ? 'linear-gradient(135deg, var(--accent-dark), var(--accent-mid))'
                    : 'transparent',
                  color: mode === m.id ? '#fff' : 'var(--text-muted)',
                  boxShadow: mode === m.id ? '0 2px 8px rgba(74,85,104,0.2)' : 'none',
                }}
              >{m.label}</button>
            ))}
          </div>

          {/* ── Sign In form ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" type="text" placeholder="Your username"
                    value={username} onChange={e => { setUsername(e.target.value); reset(); }} autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="••••••••"
                    value={password} onChange={e => { setPassword(e.target.value); reset(); }} />
                </div>
                {error   && <div className="banner banner-error"  style={{ margin: 0 }}>⚠ {error}</div>}
                {success && <div className="banner banner-success" style={{ margin: 0 }}>✓ {success}</div>}
                <button type="submit" className="btn btn-primary" disabled={loading}
                  style={{ width: '100%', padding: 11 }}>
                  {loading ? <><span className="spinner" /> Signing in…</> : '→ Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* ── Admin Register form ── */}
          {mode === 'register' && (
            <form onSubmit={handleAdminRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="banner banner-info" style={{ margin: 0 }}>
                  ℹ Admin accounts have full access to the system.
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" type="text" placeholder="e.g. admin"
                    value={username} onChange={e => { setUsername(e.target.value); reset(); }} autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="••••••••"
                    value={password} onChange={e => { setPassword(e.target.value); reset(); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" placeholder="••••••••"
                    value={confirm} onChange={e => { setConfirm(e.target.value); reset(); }} />
                </div>
                {error   && <div className="banner banner-error"  style={{ margin: 0 }}>⚠ {error}</div>}
                {success && <div className="banner banner-success" style={{ margin: 0 }}>✓ {success}</div>}
                <button type="submit" className="btn btn-primary" disabled={loading}
                  style={{ width: '100%', padding: 11 }}>
                  {loading ? <><span className="spinner" /> Creating…</> : '→ Create Admin Account'}
                </button>
              </div>
            </form>
          )}

          {/* ── Student Register form ── */}
          {mode === 'student-register' && (
            <form onSubmit={handleStudentRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="banner banner-info" style={{ margin: 0 }}>
                  ℹ Students can view their seat within 1 hour of the exam.
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" placeholder="e.g. Alice Johnson"
                    value={fullName} onChange={e => { setFullName(e.target.value); reset(); }} autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <input className="form-input" type="text" placeholder="e.g. A001 or CSE-A001"
                    value={studentId} onChange={e => { setStudentId(e.target.value); reset(); }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Must match your ID in the seating system exactly.
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" type="text" placeholder="Choose a username"
                    value={username} onChange={e => { setUsername(e.target.value); reset(); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="••••••••"
                    value={password} onChange={e => { setPassword(e.target.value); reset(); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" placeholder="••••••••"
                    value={confirm} onChange={e => { setConfirm(e.target.value); reset(); }} />
                </div>
                {error   && <div className="banner banner-error"  style={{ margin: 0 }}>⚠ {error}</div>}
                {success && <div className="banner banner-success" style={{ margin: 0 }}>✓ {success}</div>}
                <button type="submit" className="btn btn-primary" disabled={loading}
                  style={{ width: '100%', padding: 11 }}>
                  {loading ? <><span className="spinner" /> Creating…</> : '→ Create Student Account'}
                </button>
              </div>
            </form>
          )}

        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.7rem',
          color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Credentials stored in MySQL · SmartSeat v2.0
        </p>
      </div>
    </div>
  );
}