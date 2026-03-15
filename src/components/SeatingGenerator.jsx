import React, { useState, useRef } from 'react';
import { apiFetch } from '../api';

// ─── CDN script loader ────────────────────────────────────────────────────────
let jsPDFLoaded   = false;
let sheetJSLoaded = false;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── PDF download ─────────────────────────────────────────────────────────────
async function downloadPDF(seatingData, meta) {
  if (!jsPDFLoaded) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
    jsPDFLoaded = true;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Background
  doc.setFillColor(17, 17, 22);
  doc.rect(0, 0, 210, 297, 'F');

  // Header bar
  doc.setFillColor(74, 66, 50);
  doc.rect(0, 0, 210, 22, 'F');

  // Title
  doc.setTextColor(232, 220, 188);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('SmartSeat — Seating Allocation Report', 14, 14);

  // Date
  doc.setTextColor(168, 148, 104);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 196, 14, { align: 'right' });

  // Meta info
  doc.setFontSize(8.5);
  doc.setTextColor(200, 195, 185);
  const infos = [
    `Sections: ${meta.sections || '—'}`,
    `Total Students: ${meta.totalStudents || seatingData.length}`,
    `Room Prefix: ${meta.roomName || '—'}`,
    `Seats/Room: ${meta.capacity || '—'}`,
  ];
  infos.forEach((info, i) => doc.text(info, 14 + i * 48, 30));

  // Table
  doc.autoTable({
    startY: 38,
    head: [['#', 'Student ID', 'Section', 'Hall / Room', 'Seat No.']],
    body: seatingData.map((s, i) => [
      i + 1,
      s.studentId,
      s.studentId?.replace(/\d+$/, '') || '—',
      s.hallId,
      s.seatNumber,
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      textColor: [220, 215, 205],
      fillColor: [24, 24, 31],
      lineColor: [42, 42, 53],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [74, 66, 50],
      textColor: [232, 220, 188],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [32, 32, 42] },
    columnStyles: {
      0: { halign: 'right', cellWidth: 12 },
      4: { halign: 'center', cellWidth: 18, textColor: [168, 148, 104] },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(80, 75, 68);
    doc.setFontSize(7);
    doc.text(
      `SmartSeat Seating Report  ·  Page ${i} of ${pageCount}`,
      14, 292
    );
  }

  doc.save(`SmartSeat_Seating_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Excel download ───────────────────────────────────────────────────────────
async function downloadExcel(seatingData, meta) {
  if (!sheetJSLoaded) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    sheetJSLoaded = true;
  }

  const XLSX = window.XLSX;

  const rows = [
    ['SmartSeat — Seating Allocation Report'],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    [
      `Sections: ${meta.sections || '—'}`,
      '',
      `Total Students: ${meta.totalStudents || seatingData.length}`,
      '',
      `Room Prefix: ${meta.roomName || '—'}`,
    ],
    [],
    ['#', 'Student ID', 'Section', 'Hall / Room', 'Seat Number'],
    ...seatingData.map((s, i) => [
      i + 1,
      s.studentId,
      s.studentId?.replace(/\d+$/, '') || '—',
      s.hallId,
      s.seatNumber,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Seating Plan');
  XLSX.writeFile(wb, `SmartSeat_Seating_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SeatingGenerator() {
  const [form, setForm] = useState({
    sections:      '',
    totalStudents: '',
    roomName:      '',
    capacity:      '',
    rooms:         '',
  });
  const [status,    setStatus]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [dlLoading, setDlLoading] = useState(''); // 'pdf' | 'excel' | ''
  const lastMetaRef = useRef({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Live distribution preview
  const previewDist = () => {
    const sections = form.sections.split(',').map(s => s.trim()).filter(Boolean);
    const total    = parseInt(form.totalStudents) || 0;
    if (!sections.length || !total) return null;
    const base = Math.floor(total / sections.length);
    const rem  = total % sections.length;
    return sections.map((sec, i) => ({
      section: sec,
      count: base + (i < rem ? 1 : 0),
    }));
  };
  const dist = previewDist();

  // Generate seating plan
  const handleGenerate = async () => {
    const required = ['sections', 'totalStudents', 'roomName', 'capacity', 'rooms'];
    for (const k of required) {
      if (!form[k].toString().trim()) {
        setStatus({ type: 'error', message: `Please fill in: ${k}` });
        return;
      }
    }

    const sections = form.sections.split(',').map(s => s.trim()).filter(Boolean);
    if (!sections.length) {
      setStatus({ type: 'error', message: 'Enter at least one section.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const text = await apiFetch('/seating/generate', {
        method: 'POST',
        body: JSON.stringify({
          sections:      sections.join(','),
          totalStudents: String(parseInt(form.totalStudents)),
          roomName:      form.roomName.trim(),
          capacity:      String(parseInt(form.capacity)),
          rooms:         String(parseInt(form.rooms)),
        }),
      });

      // Save meta for use in downloads
      lastMetaRef.current = {
        sections:      sections.join(', '),
        totalStudents: form.totalStudents,
        roomName:      form.roomName,
        capacity:      form.capacity,
      };

      setStatus({
        type: 'success',
        message: `✓ ${text} — ${parseInt(form.totalStudents)} students across ${sections.length} section(s). Use the buttons below to download.`,
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Download handler (PDF or Excel)
  const handleDownload = async (type) => {
    setDlLoading(type);
    setStatus(null);
    try {
      const seating = await apiFetch('/seating/all');
      if (!seating || seating.length === 0) {
        setStatus({ type: 'error', message: 'No seating data found. Generate a plan first.' });
        return;
      }
      if (type === 'pdf')   await downloadPDF(seating,   lastMetaRef.current);
      if (type === 'excel') await downloadExcel(seating, lastMetaRef.current);
    } catch (err) {
      setStatus({ type: 'error', message: `Download failed: ${err.message}` });
    } finally {
      setDlLoading('');
    }
  };

  return (
    <div>

      {/* Page header */}
      <div className="section-header">
        <p className="section-eyebrow">Configuration</p>
        <h1 className="section-title">Generate <em>Seating</em></h1>
        <p className="section-desc">
          Fill in the parameters below. Students are distributed evenly across
          all sections then assigned to halls sequentially.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '1.5rem',
        alignItems: 'start',
      }}>

        {/* ── Left card: form ── */}
        <div className="card">
          <div className="card-title">
            <span className="card-title-icon">⚙️</span>
            Seating Parameters
          </div>

          <div className="form-grid" style={{ marginBottom: '1rem' }}>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Sections (comma-separated)</label>
              <input
                className="form-input"
                placeholder="e.g.  A, B, C   or   CSE-A, CSE-B"
                value={form.sections}
                onChange={e => set('sections', e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Students split evenly; remainders go to the first sections.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Total Students</label>
              <input
                className="form-input"
                type="number"
                min="1"
                placeholder="e.g. 120"
                value={form.totalStudents}
                onChange={e => set('totalStudents', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Room Name Prefix</label>
              <input
                className="form-input"
                placeholder="e.g. Hall"
                value={form.roomName}
                onChange={e => set('roomName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Seats Per Room</label>
              <input
                className="form-input"
                type="number"
                min="1"
                placeholder="e.g. 40"
                value={form.capacity}
                onChange={e => set('capacity', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Number of Rooms</label>
              <input
                className="form-input"
                type="number"
                min="1"
                placeholder="e.g. 3"
                value={form.rooms}
                onChange={e => set('rooms', e.target.value)}
              />
            </div>

          </div>

          {/* Status banner */}
          {status && (
            <div className={`banner banner-${status.type}`}>
              {status.message}
            </div>
          )}

          <div className="divider" />

          {/* Generate button */}
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading || dlLoading !== ''}
            style={{ width: '100%', padding: '12px', fontSize: '0.88rem', marginBottom: '0.75rem' }}
          >
            {loading
              ? <><span className="spinner" /> Generating…</>
              : '🪑 Generate Seating Plan'}
          </button>

          {/* Download buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              className="btn btn-ghost"
              onClick={() => handleDownload('pdf')}
              disabled={loading || dlLoading !== ''}
              style={{ padding: '10px 8px', fontSize: '0.8rem' }}
            >
              {dlLoading === 'pdf'
                ? <><span className="spinner" /> Preparing…</>
                : '📄 Download Seating PDF'}
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => handleDownload('excel')}
              disabled={loading || dlLoading !== ''}
              style={{ padding: '10px 8px', fontSize: '0.8rem' }}
            >
              {dlLoading === 'excel'
                ? <><span className="spinner" /> Preparing…</>
                : '📊 Download Excel'}
            </button>
          </div>

          <p style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: '0.5rem',
            fontFamily: 'var(--font-mono)',
          }}>
            Downloads fetch the latest generated data from the database.
          </p>
        </div>

        {/* ── Right card: distribution preview ── */}
        <div className="card">
          <div className="card-title">
            <span className="card-title-icon">📊</span>
            Distribution Preview
          </div>

          {dist ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

              {dist.map(({ section, count }) => (
                <div key={section} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'var(--bg-raised)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    color: 'var(--gideon-light)',
                  }}>
                    Section {section}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                  }}>
                    {count} students
                  </span>
                </div>
              ))}

              <div className="divider" style={{ margin: '0.25rem 0' }} />

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 12px',
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Total
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--gideon-warm)',
                  fontWeight: 500,
                }}>
                  {dist.reduce((a, d) => a + d.count, 0)}
                </span>
              </div>

              {form.capacity && form.rooms && (
                <div style={{ padding: '0 12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Rooms needed: ~{Math.ceil(
                    parseInt(form.totalStudents || 0) / parseInt(form.capacity || 1)
                  )}
                  {parseInt(form.rooms) < Math.ceil(
                    parseInt(form.totalStudents || 0) / parseInt(form.capacity || 1)
                  ) && (
                    <span style={{ color: 'var(--error-text)', display: 'block', marginTop: 4 }}>
                      ⚠ Extra halls will be created automatically.
                    </span>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <p>Enter sections and total students to see the distribution.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}