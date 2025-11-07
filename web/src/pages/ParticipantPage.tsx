import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export function ParticipantPage(){
  const { code } = useParams()  // This is actually the token from the URL
  const [participant, setParticipant] = useState<any>(null)
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(()=>{
    if (code) {
      fetch(`${API_BASE}/api/participant?token=${code}`)
        .then(r => r.json())
        .then(d => {
          if (d.error) {
            setError(d.error)
          } else {
            setParticipant(d)
            setSubmitted(d.hasSubmitted)
          }
        })
        .catch(() => setError('Failed to load participant information'))
    }
  },[code])

  async function submit(){
    try {
      const res = await fetch(`${API_BASE}/api/participant/submit`, {
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({token: code, content: text, name: name.trim() || undefined})
      })
      
      if (res.ok) {
        setSubmitted(true)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to submit')
      }
    } catch {
      setError('Failed to submit. Please try again.')
    }
  }

  if (error) return <div style={{padding:20, color:'red'}}>Error: {error}</div>
  if (!participant) return <div style={{padding:20}}>Loading…</div>

  return (
    <div style={{maxWidth:800, margin:'20px auto', padding:20}}>
      <h2>{participant.subject}</h2>
      <p>{participant.details}</p>
      <p><strong>Participant:</strong> {participant.email}</p>
      
      {submitted ? (
        <div style={{background:'#d4edda', padding:15, borderRadius:4, border:'1px solid #c3e6cb'}}>
          <p>✅ Thanks! Your input has been submitted.</p>
          <p>You can close this tab or wait for the meeting to begin.</p>
        </div>
      ) : (
        <div>
          <label>Your Name (optional):</label>
          <input 
            value={name} 
            onChange={(e: any)=>setName(e.target.value)} 
            style={{width:'100%', padding:8, marginBottom:10}} 
            placeholder="Enter your preferred name for the meeting"
          />
          
          <label>Your Initial Input:</label>
          <textarea 
            value={text} 
            onChange={(e: any)=>setText(e.target.value)} 
            style={{width:'100%', height:200, marginBottom:10}} 
            placeholder="Share your thoughts, ideas, or questions for this meeting..."
            required
          />
          
          <button 
            onClick={submit} 
            disabled={!text.trim() || text.length < 10}
            style={{
              padding:10, 
              backgroundColor: text.length >= 10 ? '#007bff' : '#ccc', 
              color:'white', 
              border:'none', 
              borderRadius:4,
              cursor: text.length >= 10 ? 'pointer' : 'not-allowed'
            }}
          >
            Submit Input
          </button>
          
          {text.length < 10 && text.length > 0 && (
            <p style={{color:'orange', fontSize:'0.9em'}}>Please provide at least 10 characters</p>
          )}
        </div>
      )}
    </div>
  )
}
