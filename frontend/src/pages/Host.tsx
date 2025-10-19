import React, { useState } from 'react';
import axios from 'axios';

export function Host() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [emails, setEmails] = useState('');
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  async function login() {
    const { data } = await axios.post('/api/auth/login', { password });
    setToken(data.token);
  }

  async function createMeeting() {
    if (!token) return;
    const { data } = await axios.post(
      '/api/meetings',
      {
        subject,
        details,
        participants: emails.split(/[,\n\s]+/).filter(Boolean),
        participantBaseUrl: window.location.origin + '/p'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMeetingId(data.id);
    setStatus('awaiting_inputs');
  }

  async function pause() {
    if (!token || !meetingId) return;
    const { data } = await axios.post(`/api/meetings/${meetingId}/pause`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setStatus(data.status);
  }

  async function resume() {
    if (!token || !meetingId) return;
    const { data } = await axios.post(`/api/meetings/${meetingId}/resume`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setStatus(data.status);
  }

  async function advance() {
    if (!token || !meetingId) return;
    const { data } = await axios.post(`/api/meetings/${meetingId}/advance`, {}, { headers: { Authorization: `Bearer ${token}` } });
    if (data.concluded) alert('Meeting concluded and report generated');
  }

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 600 }}>
      {!token ? (
        <div>
          <h3>Host Login</h3>
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <div>
          <h3>Create Meeting</h3>
          <input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <textarea placeholder="Details/Topics" value={details} onChange={(e) => setDetails(e.target.value)} />
          <textarea placeholder="Participant Emails (comma or newline)" value={emails} onChange={(e) => setEmails(e.target.value)} />
          <button onClick={createMeeting}>Create</button>
          {meetingId && (
            <div>
              <p>Meeting created. ID: {meetingId}</p>
              <p>Status: {status}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={pause}>Pause</button>
                <button onClick={resume}>Resume</button>
                <button onClick={advance}>Advance one turn</button>
              </div>
              <p>Share the invitation emails' unique URLs sent automatically.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
