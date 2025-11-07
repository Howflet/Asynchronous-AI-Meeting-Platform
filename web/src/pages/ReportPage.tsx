import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import mermaid from 'mermaid'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export function ReportPage(){
  const { meetingId } = useParams()
  const [report, setReport] = useState<any>(null)
  const [svg, setSvg] = useState('')

  useEffect(()=>{ mermaid.initialize({ startOnLoad: false }) },[])

  useEffect(()=>{
    fetch(`${API_BASE}/api/meetings/${meetingId}/report`)
      .then(r=>r.json())
      .then(async d=>{
        setReport(d)
        try {
          // The backend returns visualMap as the mermaid diagram
          const { svg } = await mermaid.render('graph1', d.visualMap)
          setSvg(svg)
        } catch (e) {
          console.error('Failed to render mermaid diagram:', e)
        }
      })
      .catch(() => {
        setReport({ error: 'Report not ready yet' })
      })
  },[meetingId])

  if (!report) return <div style={{padding:20}}>Generating report…</div>

  if (report.error) return <div style={{padding:20, color:'orange'}}>Report not ready yet. Please wait for the meeting to complete.</div>

  return (
    <div style={{maxWidth:900, margin:'20px auto', padding:20}}>
      <h2>Meeting Report</h2>
      <p>{report.summary}</p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <List title="Highlights" items={report.highlights} />
        <List title="Decisions" items={report.decisions} />
      </div>
      <List title="Action Items" items={report.actionItems} />

      <h3>Conversation Map</h3>
      <div dangerouslySetInnerHTML={{__html: svg}} />
    </div>
  )
}

function List({title, items}:{title:string, items:string[]}){
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {items?.map((x,i)=> <li key={i}>{x}</li>)}
      </ul>
    </div>
  )
}
