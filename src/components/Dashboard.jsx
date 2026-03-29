import React, { useState, useEffect } from 'react';

const API = '${API_BASE}';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({ students: 0, seats: 0, halls: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/students`).then(r => r.json()).catch(() => []),
      fetch(`${API}/seating/all`).then(r => r.json()).catch(() => []),
    ]).then(([students, seating]) => {
      const halls = new Set(seating.map(s => s.hallId)).size;
      setStats({ students: students.length, seats: seating.length, halls });
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="section-header">
        <p className="section-eyebrow">Overview</p>
        <h1 className="section-title">Smart<em>Seat</em> Dashboard</h1>
        <p className="section-desc">
          Intelligent exam seating allocation — distribute students across halls with precision.
        </p>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Students Registered', value: loading ? '…' : stats.students, sub: 'in database' },
          { label: 'Seats Allocated', value: loading ? '…' : stats.seats, sub: 'last generation' },
          { label: 'Exam Halls', value: loading ? '…' : stats.halls, sub: 'in use' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {[
          {
            icon: '🪑',
            title: 'Generate Seating',
            desc: 'Configure sections, halls, and capacity to produce a full seating plan instantly.',
            tab: 'generate',
            cta: 'Generate Now',
          },
          {
            icon: '🤖',
            title: 'AI Student Import',
            desc: 'Paste or upload a list of names — the AI extracts and inserts them into the database.',
            tab: 'ai',
            cta: 'Open AI Assistant',
          },
          {
            icon: '📋',
            title: 'View Seating',
            desc: 'Browse the complete seating chart with hall and seat assignments for every student.',
            tab: 'view',
            cta: 'View Chart',
          },
          {
            icon: '👥',
            title: 'Manage Students',
            desc: 'Browse, add, or remove student records stored in the database.',
            tab: 'students',
            cta: 'Manage Students',
          },
        ].map(card => (
          <div className="card" key={card.tab} style={{ cursor: 'default' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>{card.icon}</div>
            <div className="card-title" style={{ marginBottom: '0.5rem' }}>{card.title}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              {card.desc}
            </p>
            <button className="btn btn-ghost" onClick={() => onNavigate(card.tab)}>
              {card.cta} →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
