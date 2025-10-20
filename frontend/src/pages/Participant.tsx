import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function Participant() {
  const [token, setToken] = useState<string>('');
  const [details, setDetails] = useState<{ subject: string; details: string; id: string } | null>(null);
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get('token') || '';
    console.log('[Participant] Extracted token:', t);
    setToken(t);
    if (t) {
      load(t);
    } else {
      setError('No invitation token found in URL');
      setLoading(false);
    }
  }, []);

  async function load(t: string) {
    try {
      setLoading(true);
      setError('');
      console.log('[Participant] Fetching participant data...');
      const { data } = await axios.get('/api/participant', { params: { token: t } });
      console.log('[Participant] Received data:', data);
      setDetails({ subject: data.subject, details: data.details, id: data.meetingId });
      if (data.hasSubmitted) setSubmitted(true);
    } catch (err: any) {
      console.error('[Participant] Error loading:', err);
      setError(err.response?.data?.error || 'Failed to load invitation. Please check your link.');
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    try {
      await axios.post('/api/participant/submit', { token, content });
      setSubmitted(true);
    } catch (err: any) {
      console.error('[Participant] Error submitting:', err);
      setError(err.response?.data?.error || 'Failed to submit. Please try again.');
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <div style={{ color: 'red', padding: 20 }}><p>Error: {error}</p></div>;
  if (!details) return <p>No meeting details available</p>;

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
