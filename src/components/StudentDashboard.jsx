import React, { useState, useEffect } from 'react';

// Loads jsPDF from CDN
let jsPDFLoaded = false;
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function downloadSeatPDF(info) {
  if (!jsPDFLoaded) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    jsPDFLoaded = true;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });

  // Background
  doc.setFillColor(240, 241, 243);
  doc.rect(0, 0, 148, 210, 'F');

  // Header
  doc.setFillColor(74, 85, 104);
  doc.rect(0, 0, 148, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SmartSeat', 74, 12, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('EXAM SEATING CARD', 74, 20, { align: 'center' });

  // Card body
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 35, 128, 120, 4, 4, 'F');
  doc.setDrawColor(212, 215, 221);
  doc.roundedRect(10, 35, 128, 120, 4, 4, 'S');

  const row = (label, value, y) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 105, 115);
    doc.text(label.toUpperCase(), 20, y);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 32, 44);
    doc.text(String(value), 20, y + 7);
  };

  row('Student Name', info.fullName || info.username, 50);
  row('Student ID',   info.studentId,   72);
  row('Hall / Room',  info.hallId,       94);
  row('Seat Number',  info.seatNumber,  116);
  row('Exam',         info.examName,    138);

  // Exam time
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 105, 115);
  doc.text('EXAM DATE & TIME', 20, 157);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 106, 133);
  const examTime = info.examTime
    ? new Date(info.examTime).toLocaleString()
    : '—';
  doc.text(examTime, 20, 165);

  // Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 174, 192);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 74, 178, { align: 'center' });
  doc.text('Keep this card with you during the exam.', 74, 184, { align: 'center' });

  doc.save(`SeatingCard_${info.studentId}.pdf`);
}

export default function StudentDashboard({ info, onLogout }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [dlLoading, setDlLoading] = useState(false);

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      if (!info.examTime) return;
      const now  = new Date();
      const exam = new Date(info.examTime);
      const diff = exam - now;

      if (diff <= 0) {
        setTimeLeft('Exam has started');
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [info.examTime]);

  const handleDownload = async () => {
    setDlLoading(true);
    try { await downloadSeatPDF(info); }
    catch (err) { alert('PDF failed: ' + err.message); }
    finally { setDlLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, margin: '0 auto 0.75rem',
            background: 'linear-gradient(135deg, var(--accent-dark), var(--accent-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🪑</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem',
            fontWeight: 400, color: 'var(--text-primary)' }}>
            Your Seating Details
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)', marginTop: 4 }}>
            Welcome, {info.fullName || info.username}
          </p>
        </div>

        {/* Countdown */}
        {timeLeft && (
          <div className="banner banner-info" style={{ justifyContent: 'center',
            textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
            ⏱ Exam starts in: <strong style={{ marginLeft: 6 }}>{timeLeft}</strong>
          </div>
        )}

        {/* Seating Card */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-title">
            <span className="card-title-icon">🎫</span>
            Seating Card
          </div>

          {[
            { label: 'Student Name', value: info.fullName || info.username, icon: '👤' },
            { label: 'Student ID',   value: info.studentId,   icon: '🪪' },
            { label: 'Hall / Room',  value: info.hallId,       icon: '🏛️' },
            { label: 'Seat Number',  value: info.seatNumber,   icon: '💺' },
            { label: 'Exam',         value: info.examName,     icon: '📝' },
            { label: 'Date & Time',
              value: info.examTime
                ? new Date(info.examTime).toLocaleString()
                : '—',
              icon: '🕐' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '10px 12px',
              background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', marginBottom: 8,
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)' }}>
                {row.icon} {row.label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600,
                color: 'var(--accent-warm)', fontSize: '0.9rem' }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Download button */}
        <button className="btn btn-primary" onClick={handleDownload}
          disabled={dlLoading}
          style={{ width: '100%', padding: 13, fontSize: '0.9rem', marginBottom: 10 }}>
          {dlLoading
            ? <><span className="spinner" /> Generating PDF…</>
            : '📄 Download Seating Card PDF'}
        </button>

        {/* Logout */}
        <button className="btn btn-secondary" onClick={onLogout}
          style={{ width: '100%', padding: 10, fontSize: '0.82rem' }}>
          Sign Out
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem',
          color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          This page works offline after first load · SmartSeat v2.0
        </p>
      </div>
    </div>
  );
}