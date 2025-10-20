import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ConversationTurn {
  id: string;
  speaker: string;
  message: string;
  createdAt: string;
}

export function Host() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [emails, setEmails] = useState('');
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [inviteLinks, setInviteLinks] = useState<Array<{ email: string; url: string }>>([]);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);

  // Poll for conversation updates
  useEffect(() => {
    if (!meetingId || !token) return;
    
    const fetchConversation = async () => {
      try {
        const { data } = await axios.get(`/api/meetings/${meetingId}/status`);
        setConversation(data.history || []);
        setStatus(data.status);
      } catch (err) {
        console.error('Failed to fetch conversation:', err);
      }
    };

    // Initial fetch
    fetchConversation();

    // Poll every 2 seconds
    const interval = setInterval(fetchConversation, 2000);
    return () => clearInterval(interval);
  }, [meetingId, token]);

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
    
    // Fetch participant tokens to display invite links
    await fetchInviteLinks(data.id);
  }

  async function fetchInviteLinks(meetingId: string) {
    if (!token) return;
    try {
      const { data } = await axios.get(`/api/meetings/${meetingId}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const links = data.participants.map((p: any) => ({
        email: p.email,
        url: `${window.location.origin}/p?token=${p.token}`
      }));
      setInviteLinks(links);
    } catch (err) {
      console.error('Failed to fetch invite links:', err);
    }
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
              
              {inviteLinks.length > 0 && (
                <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                  <h4>Participant Invite Links:</h4>
                  {inviteLinks.map((link, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <strong>{link.email}:</strong>
                      <br />
                      <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, wordBreak: 'break-all' }}>
                        {link.url}
                      </a>
                      <button 
                        onClick={() => navigator.clipboard.writeText(link.url)} 
                        style={{ marginLeft: 8, fontSize: 11, padding: '2px 6px' }}
                      >
                        📋 Copy
                      </button>
                    </div>
                  ))}
                  <p style={{ fontSize: 12, marginTop: 8, color: '#666' }}>
                    Share these links with participants to submit their input.
                  </p>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={pause}>Pause</button>
                <button onClick={resume}>Resume</button>
                <button onClick={advance}>Advance one turn</button>
              </div>
              
              {/* Conversation Display */}
              {conversation.length > 0 && (
                <div style={{ marginTop: 24, padding: 12, background: '#f9f9f9', borderRadius: 4, maxHeight: 500, overflowY: 'auto' }}>
                  <h4>Conversation ({conversation.length} turns)</h4>
                  {conversation.map((turn, i) => (
                    <div key={turn.id} style={{ 
                      marginBottom: 12, 
                      padding: 8, 
                      background: turn.speaker.startsWith('AI:') ? '#e3f2fd' : '#fff3e0',
                      borderLeft: `3px solid ${turn.speaker.startsWith('AI:') ? '#2196f3' : '#ff9800'}`,
                      borderRadius: 4
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 4 }}>
                        Turn {i + 1} - {turn.speaker}
                      </div>
                      <div style={{ fontSize: 14 }}>{turn.message}</div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                        {new Date(turn.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
