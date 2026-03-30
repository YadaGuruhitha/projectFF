import React, { useState, useEffect } from 'react';

import { API_BASE } from '../api';
const API = API_BASE;        

export default function StudentManager() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState(null);

  const load = () => {
    setLoading(true);
    fetch(`${API}/students`)
      .then(r => r.json())
      .then(d => { setStudents(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`${API}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error('Failed to add student');
      setNewName('');
      setStatus({ type: 'success', message: 'Student added.' });
      load();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from the database?`)) return;
    await fetch(`${API}/students/${id}`, { method: 'DELETE' });
    setStudents(s => s.filter(x => x.id !== id));
  };

  const filtered = students.filter(s => s.name?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <div className="section-header">
        <p className="section-eyebrow">Registry</p>
        <h1 className="section-title">Manage <em>Students</em></h1>
        <p className="section-desc">
          View, add, and remove student records in the database.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Student list */}
        <div>
          <div className="filter-bar">
            <input
              className="form-input"
              placeholder="Search by name…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ maxWidth: 240 }}
            />
            <button className="btn btn-secondary" onClick={load}>↻ Refresh</button>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {filtered.length} student{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div className="table-wrapper" style={{ border: 'none', maxHeight: 480, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <p>{students.length === 0 ? 'No students registered yet.' : 'No matches found.'}</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student Name</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id}>
                        <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{s.id}</td>
                        <td>{s.name}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                            onClick={() => handleDelete(s.id, s.name)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Add student */}
        <div className="card">
          <div className="card-title">
            <span className="card-title-icon">➕</span>
            Add Student
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              placeholder="e.g. Alice Johnson"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>

          {status && (
            <div className={`banner banner-${status.type}`} style={{ marginBottom: '0.75rem' }}>
              {status.message}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            style={{ width: '100%' }}
          >
            {adding ? <><span className="spinner" /> Adding…</> : '+ Add Student'}
          </button>
        </div>
      </div>
    </div>
  );
}
