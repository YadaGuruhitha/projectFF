import React, { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../api';

function extractNamesLocally(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const names = [];

  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes('name') ||
    firstLine.includes('student') ||
    firstLine.includes('id');

  if (firstLine.includes(',')) {
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const nameCol = headers.findIndex(h =>
      h === 'name' ||
      h === 'student name' ||
      h === 'full name' ||
      h === 'studentname'
    );

    const startRow = hasHeader ? 1 : 0;

    for (let i = startRow; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());

      if (nameCol >= 0 && cols[nameCol]) {
        const name = cols[nameCol].replace(/^"|"$/g, '').trim();

        if (name && !name.toLowerCase().includes('@') && isNaN(Number(name))) {
          names.push(name);
        }

      } else {
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
    for (let i = hasHeader ? 1 : 0; i < lines.length; i++) {

      const line = lines[i]
        .replace(/^\d+[.):\-\s]+/, '') 
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

  return [...new Set(names)];
}

async function insertStudents(names) {
  return apiFetch('/students/batch', {
    method: 'POST',
    body: JSON.stringify({ names }),
  });
}

export default function AIAssistant() {

  const [pastedText, setPastedText] = useState('');
  const [extractedNames, setExtractedNames] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'system', text: '🤖 AI assistant ready. Paste student names or upload a CSV/text file.' },
  ]);

  const [extracting, setExtracting] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const chatRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const addMessage = (role, text) =>
    setMessages(m => [...m, { role, text }]);

  const handleExtract = () => {

    if (!pastedText.trim()) {
      addMessage('system', '⚠ Please paste text or upload a file first.');
      return;
    }

    setExtracting(true);

    setTimeout(() => {

      try {

        const names = extractNamesLocally(pastedText);

        if (!names.length) {

          addMessage('assistant', 'No names found.');

        } else {

          setExtractedNames(names);

          addMessage(
            'assistant',
            `Found ${names.length} names:\n${names.slice(0,5).join(', ')}`
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

      addMessage('system', '⚠ No names to insert.');

      return;
    }

    setDbLoading(true);

    try {

      const result = await insertStudents(extractedNames);

      addMessage(
        'assistant',
        `✅ ${result.message || "Students inserted successfully"}`
      );

      setExtractedNames([]);
      setPastedText('');

    } catch (err) {

      addMessage(
        'assistant',
        `⚠ Database insertion failed: ${err.message}`
      );

    } finally {

      setDbLoading(false);

    }

  };

  const handleFile = (file) => {

    if (!file) return;

    const reader = new FileReader();

    reader.onload = e => {

      setPastedText(e.target.result);

      addMessage('system', `📄 File loaded: ${file.name}`);

    };

    reader.readAsText(file);

  };

  return (
    <div>

      <h2>Student Name Assistant</h2>

      <textarea
        placeholder="Paste names here..."
        value={pastedText}
        onChange={e => setPastedText(e.target.value)}
        style={{width:'100%',height:150}}
      />

      <br/><br/>

      <button onClick={handleExtract} disabled={extracting}>
        {extracting ? 'Extracting...' : 'Extract Names'}
      </button>

      <button onClick={() => {
        setPastedText('');
        setExtractedNames([]);
      }}>
        Clear
      </button>

      {extractedNames.length > 0 && (
        <div>

          <h3>Extracted Names</h3>

          <ul>
            {extractedNames.map((name,i)=>(
              <li key={i}>{name}</li>
            ))}
          </ul>

          <button onClick={handleInsert} disabled={dbLoading}>
            {dbLoading ? 'Inserting...' : 'Insert into Database'}
          </button>

        </div>
      )}

      <h3>Assistant Log</h3>

      <div style={{border:'1px solid gray',padding:10,height:200,overflow:'auto'}} ref={chatRef}>

        {messages.map((m,i)=>(
          <div key={i}><b>{m.role}:</b> {m.text}</div>
        ))}

      </div>

    </div>
  );

}