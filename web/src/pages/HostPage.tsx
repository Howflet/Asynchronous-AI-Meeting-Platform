import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export function HostPage(){
  const [subject, setSubject] = useState('')
  const [details, setDetails] = useState('')
  const [emails, setEmails] = useState('')
  const [created, setCreated] = useState<any>(null)

  async function createMeeting(){
    const participants = emails.split(/[,\n]/).map((e: string)=>e.trim()).filter(Boolean)
    const participantBaseUrl = window.location.origin + '/p'
    const res = await fetch(`${API_BASE}/api/meetings`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({subject, details, participants, participantBaseUrl})})
    const data = await res.json()
    setCreated(data)
  }

  return (
    <div style={{maxWidth:800, margin:'20px auto', padding:20}}>
      <h2>Create Meeting</h2>
      <label>Subject</label>
      <input value={subject} onChange={(e: any)=>setSubject(e.target.value)} style={{width:'100%', padding:8}}/>
      <label>Details / Topics</label>
      <textarea value={details} onChange={(e: any)=>setDetails(e.target.value)} style={{width:'100%', height:120}}/>
      <label>Participant Emails (comma or newline)</label>
      <textarea value={emails} onChange={(e: any)=>setEmails(e.target.value)} style={{width:'100%', height:100}}/>
      <button onClick={createMeeting} style={{marginTop:10}}>Create & Send Invites</button>

      {created && (
        <div style={{marginTop:20}}>
          <h3>Meeting Created!</h3>
          <p><strong>Subject:</strong> {created.subject}</p>
          <p><strong>Meeting ID:</strong> {created.id}</p>
          <p><strong>Participants:</strong> {created.participants?.map((p: any) => p.email).join(', ')}</p>
          <p>Invitation emails have been sent to all participants.</p>
          <div>
            <a href={`/live/${created.id}`} style={{padding:10, backgroundColor:'#007bff', color:'white', textDecoration:'none', borderRadius:4}}>Open Live View</a>
          </div>
        </div>
      )}
    </div>
  )
}
