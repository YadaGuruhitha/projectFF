import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8080';

export default function SeatingView() {
  const [seating, setSeating] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [hallFilter, setHallFilter] = useState('');

  const load = () => {
    setLoading(true);
    fetch(`${API}/seating/all`)
      .then(r => r.json())
      .then(data => { setSeating(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const halls = [...new Set(seating.map(s => s.hallId))].sort();

  const filtered = seating.filter(s => {
    const matchId = s.studentId?.toLowerCase().includes(filter.toLowerCase());
    const matchHall = hallFilter ? s.hallId === hallFilter : true;
    return matchId && matchHall;
  });

  return (
    <div>
      <div className="section-header">
        <p className="section-eyebrow">Results</p>
        <h1 className="section-title">Seating <em>Chart</em></h1>
        <p className="section-desc">
          Browse all allocated seats. Filter by student ID or exam hall.
        </p>
      </div>

      <div className="filter-bar">
        <input
          className="form-input"
          placeholder="Search student ID…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ maxWidth: 220 }}
        />
        <select
          className="form-input"
          style={{ maxWidth: 180 }}
          value={hallFilter}
          onChange={e => setHallFilter(e.target.value)}
        >
          <option value="">All Halls</option>
          {halls.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <button className="btn btn-secondary" onClick={load}>
          ↻ Refresh
        </button>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {filtered.length} / {seating.length} records
        </span>
      </div>

      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <span className="spinner" style={{ width: 28, height: 28 }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <div className="empty-state-icon">🪑</div>
              <p>{seating.length === 0
                ? 'No seating data yet. Go to Generate Seating to create a plan.'
                : 'No results match your filter.'}
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student ID</th>
                  <th>Section</th>
                  <th>Hall</th>
                  <th>Seat No.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => {
                  // Extract section prefix (everything before the first digit)
                  const section = s.studentId?.replace(/\d+$/, '') || '—';
                  return (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: 500 }}>{s.studentId}</td>
                      <td>
                        <span className="hall-badge" style={{ background: 'rgba(58,74,94,0.15)', borderColor: 'rgba(58,74,94,0.3)', color: 'var(--info-text)' }}>
                          {section}
                        </span>
                      </td>
                      <td><span className="hall-badge">{s.hallId}</span></td>
                      <td><span className="seat-num">{s.seatNumber}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <div className="table-meta">
            Showing {filtered.length} seat{filtered.length !== 1 ? 's' : ''} across {new Set(filtered.map(s => s.hallId)).size} hall(s)
          </div>
        )}
      </div>
    </div>
  );
}
