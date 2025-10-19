import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function Participant() {
  const [token, setToken] = useState<string>('');
  const [details, setDetails] = useState<{ subject: string; details: string; id: string } | null>(null);
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get('token') || '';
    setToken(t);
    if (t) load(t);
  }, []);

  async function load(t: string) {
    const { data } = await axios.get('/api/participant', { params: { token: t } });
    setDetails({ subject: data.subject, details: data.details, id: data.meetingId });
    if (data.hasSubmitted) setSubmitted(true);
  }

  async function submit() {
    await axios.post('/api/participant/submit', { token, content });
    setSubmitted(true);
  }

  if (!details) return <p>Loading...</p>;

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 700 }}>
      <h3>{details.subject}</h3>
      <p>{details.details}</p>
      {submitted ? (
        <p>Thanks! You can close this tab.</p>
      ) : (
        <>
          <textarea rows={10} placeholder="Your initial input" value={content} onChange={(e) => setContent(e.target.value)} />
          <button onClick={submit} disabled={!content.trim()}>Submit</button>
        </>
      )}
    </div>
  );
}
