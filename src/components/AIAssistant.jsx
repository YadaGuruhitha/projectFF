import React, { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../api';

// ─── Local name extractor (no API key needed) ─────────────────────────────────
// Reads CSV or plain text and pulls out student names automatically.
function extractNamesLocally(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const names = [];

  // Try to detect if it's a CSV with headers
  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes('name') ||
    firstLine.includes('student') ||
    firstLine.includes('id');

  if (firstLine.includes(',')) {
    // CSV format — find which column is the name column
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameCol = headers.findIndex(h =>
      h === 'name' || h === 'student name' || h === 'full name' || h === 'studentname'
    );

    const startRow = hasHeader ? 1 : 0;

    for (let i = startRow; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (nameCol >= 0 && cols[nameCol]) {
        // Use detected name column
        const name = cols[nameCol].replace(/^"|"$/g, '').trim();
        if (name && !name.toLowerCase().includes('@') && isNaN(Number(name))) {
          names.push(name);
        }
      } else {
        // No name column found — try each column that looks like a name
        for (const col of cols) {
          const val = col.replace(/^"|"$/g, '').trim();
          if (
            val &&
            val.length > 2 &&
            !val.includes('@') &&
            isNaN(Number(val)) &&
            /^[A-Za-z]/.test(val) &&
            !['id', 'name', 'section', 'email', 'roll', 'no', 'number'].includes(val.toLowerCase())
          ) {
            names.push(val);
            break;
          }
        }
      }
    }
  } else {
    // Plain text — each line may be a name (skip header-like lines)
    for (let i = hasHeader ? 1 : 0; i < lines.length; i++) {
      const line = lines[i]
        .replace(/^\d+[\.\):\-\s]+/, '') // remove leading numbers like "1. " or "1) "
        .trim();
      if (
        line &&
        line.length > 2 &&
        !line.includes('@') &&
        /^[A-Za-z]/.test(line)
      ) {
        names.push(line);
      }
    }
  }

  return [...new Set(names)]; // remove duplicates
}

// ─── Insert names into MySQL via Spring Boot ──────────────────────────────────
async function insertStudents(names) {
  return apiFetch('/students/batch', {
    method: 'POST',
    body: JSON.stringify({ names }),
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const [pastedText, setPastedText]       = useState('');
  const [extractedNames, setExtractedNames] = useState([]);
  const [messages, setMessages]           = useState([
    { role: 'system', text: '🤖 AI assistant ready. Paste student names or upload a CSV/text file, then click Extract.' },
  ]);
  const [extracting, setExtracting]       = useState(false);
  const [dbLoading, setDbLoading]         = useState(false);
  const [dragOver, setDragOver]           = useState(false);
  const chatRef    = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const addMessage = (role, text) => setMessages(m => [...m, { role, text }]);

  const handleExtract = () => {
    if (!pastedText.trim()) {
      addMessage('system', '⚠ Please paste some text or upload a file first.');
      return;
    }
    setExtracting(true);
    addMessage('user', `Extracting names from: "${pastedText.slice(0, 60)}${pastedText.length > 60 ? '…' : ''}"`);

    // Small timeout so the UI updates before processing
    setTimeout(() => {
      try {
        const names = extractNamesLocally(pastedText);
        if (!names.length) {
          addMessage('assistant', 'No names found. Make sure your file has a "name" column or each line is a student name.');
          setExtractedNames([]);
        } else {
          setExtractedNames(names);
          addMessage(
            'assistant',
            `Found ${names.length} name${names.length !== 1 ? 's' : ''}:\n` +
            `${names.slice(0, 8).join(', ')}${names.length > 8 ? ` … and ${names.length - 8} more` : ''}\n\n` +
            `Review below and click "Insert into Database" when ready.`
          );
        }
      } catch (err) {
        addMessage('assistant', `⚠ Extraction failed: ${err.message}`);
      } finally {
        setExtracting(false);
      }
    }, 300);
  };

  const handleInsert = async () => {
    if (!extractedNames.length) {
      addMessage('system', '⚠ No names to insert yet.');
      return;
    }
    setDbLoading(true);
    addMessage('user', `Inserting ${extractedNames.length} students into MySQL…`);
    try {
      const result = await insertStudents(extractedNames);
      addMessage('assistant', `✅ ${result.message || `${result.inserted} students inserted successfully!`}`);
      setExtractedNames([]);
      setPastedText('');
    } catch (err) {
      addMessage('assistant', `⚠ Database insertion failed: ${err.message}`);
    } finally {
      setDbLoading(false);
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      setPastedText(e.target.result);
      addMessage('system', `📄 File loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    };
    reader.onerror = () => addMessage('system', '⚠ Failed to read file.');
    reader.readAsText(file);
  };

  const removeName = (i) => setExtractedNames(n => n.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="section-header">
        <p className="section-eyebrow">Smart Import</p>
        <h1 className="section-title">Student <em>Name</em> Assistant</h1>
        <p className="section-desc">
          Upload a CSV or paste a list of names — the assistant extracts them
          and inserts directly into MySQL. No API key needed.
        </p>
      </div>

      <div className="ai-panel">
        {/* Left: Input + Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="card-title">
              <span className="card-title-icon">📝</span>
              Input Text / CSV
            </div>

            <textarea
              className="form-input"
              placeholder={
                `Paste names or upload a CSV file.\n\nExamples:\n` +
                `  CSV:  id,name,section\n` +
                `        1,Alice Johnson,A\n\n` +
                `  List: Alice Johnson\n` +
                `        Bob Smith`
              }
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              style={{ minHeight: 160 }}
            />

            {/* File upload zone */}
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              style={{ marginTop: '0.75rem' }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.text"
                onChange={e => handleFile(e.target.files[0])}
              />
              📄 Drop a .csv or .txt file here, or click to upload
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleExtract}
                disabled={extracting || !pastedText.trim()}
                style={{ flex: 1 }}
              >
                {extracting
                  ? <><span className="spinner" /> Extracting…</>
                  : '🔍 Extract Names'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => { setPastedText(''); setExtractedNames([]); }}
                disabled={extracting}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Extracted names review */}
          {extractedNames.length > 0 && (
            <div className="card">
              <div className="card-title">
                <span className="card-title-icon">✅</span>
                Extracted Names ({extractedNames.length})
              </div>

              <div className="name-chips" style={{ marginBottom: '1rem' }}>
                {extractedNames.map((name, i) => (
                  <span className="name-chip" key={i}>
                    {name}
                    <button
                      className="name-chip-remove"
                      onClick={() => removeName(i)}
                      title="Remove"
                    >×</button>
                  </span>
                ))}
              </div>

              <button
                className="btn btn-primary"
                onClick={handleInsert}
                disabled={dbLoading}
                style={{ width: '100%' }}
              >
                {dbLoading
                  ? <><span className="spinner" /> Inserting into MySQL…</>
                  : `💾 Insert ${extractedNames.length} Student${extractedNames.length !== 1 ? 's' : ''} into Database`}
              </button>
            </div>
          )}
        </div>

        {/* Right: Chat log */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="card-title">
            <span className="card-title-icon">💬</span>
            Assistant Log
          </div>

          <div className="chat-history" ref={chatRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>
                {m.text.split('\n').map((line, j) => (
                  <React.Fragment key={j}>
                    {line}{j < m.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            ))}
            {(extracting || dbLoading) && (
              <div className="chat-bubble system">
                <span className="spinner" style={{ width: 12, height: 12, marginRight: 6 }} />
                {extracting ? 'Extracting names…' : 'Writing to database…'}
              </div>
            )}
          </div>

          <div style={{
            padding: '10px', background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
          }}>
            <p style={{
              fontSize: '0.72rem', color: 'var(--text-muted)',
              lineHeight: 1.7, fontFamily: 'var(--font-mono)',
            }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Supported formats:</strong><br />
              CSV with a "name" column<br />
              Plain text — one name per line<br />
              Numbered lists — 1. Alice, 2. Bob<br />
              Works offline — no API key needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}