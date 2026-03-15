import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function ExamScheduleManager() {
  const [examName, setExamName]   = useState('');
  const [examDate, setExamDate]   = useState('');
  const [examTime, setExamTime]   = useState('');
  const [active, setActive]       = useState(null);
  const [status, setStatus]       = useState(null);
  const [loading, setLoading]     = useState(false);

  const loadActive = () => {
    apiFetch('/exam-schedule/active')
      .then(d => setActive(d))
      .catch(() => setActive(null));
  };

  useEffect(() => { loadActive(); }, []);

  const handleSet = async () => {
    if (!examName.trim() || !examDate || !examTime) {
      setStatus({ type: 'error', message: 'Fill in all fields.' }); return;
    }
    setLoading(true);
    try {
      const dt = `${examDate}T${examTime}:00`;
      await apiFetch('/exam-schedule', {
        method: 'POST',
        body: JSON.stringify({ examName: examName.trim(), examDateTime: dt }),
      });
      setStatus({ type: 'success', message: '✓ Exam schedule set. Students can log in 1 hour before.' });
      loadActive();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <p className="section-eyebrow">Scheduling</p>
        <h1 className="section-title">Exam <em>Schedule</em></h1>
        <p className="section-desc">
          Set the active exam date and time. Students can log in and view
          their seat only within 1 hour before the exam starts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Set schedule */}
        <div className="card">
          <div className="card-title">
            <span className="card-title-icon">📅</span>
            Set Exam Schedule
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Exam Name</label>
              <input className="form-input" placeholder="e.g. Mid Semester Exam"
                value={examName} onChange={e => setExamName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Exam Date</label>
              <input className="form-input" type="date"
                value={examDate} onChange={e => setExamDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Exam Time</label>
              <input className="form-input" type="time"
                value={examTime} onChange={e => setExamTime(e.target.value)} />
            </div>

            {status && <div className={`banner banner-${status.type}`} style={{ margin: 0 }}>{status.message}</div>}

            <button className="btn btn-primary" onClick={handleSet}
              disabled={loading} style={{ width: '100%', padding: 11 }}>
              {loading ? <><span className="spinner" /> Saving…</> : '📅 Set Active Exam'}
            </button>
          </div>
        </div>

        {/* Active exam info */}
        <div className="card">
          <div className="card-title">
            <span className="card-title-icon">✅</span>
            Currently Active Exam
          </div>

          {active ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Exam Name', value: active.examName },
                { label: 'Date & Time', value: new Date(active.examDateTime).toLocaleString() },
                { label: 'Status', value: active.active ? '🟢 Active' : '🔴 Inactive' },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '9px 12px', background: 'var(--bg-raised)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600,
                    color: 'var(--accent-warm)', fontSize: '0.82rem' }}>{row.value}</span>
                </div>
              ))}
              <div className="banner banner-info" style={{ margin: '0.5rem 0 0' }}>
                ℹ Students can log in from{' '}
                <strong>
                  {new Date(new Date(active.examDateTime) - 3600000).toLocaleTimeString()}
                </strong>{' '}onwards.
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p>No active exam scheduled yet. Set one on the left.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}