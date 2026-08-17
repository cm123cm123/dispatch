'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Task, CommEntry } from '@/lib/types'
import { getRisk, fmtDate, CAT_LABELS, STATUS_LABELS } from '@/lib/utils'

interface Props {
  tasks: Task[]
  comms: Record<string, CommEntry[]>
  onClose: () => void
}

type Section = {
  heading: string
  emoji: string
  tasks: Task[]
}

function buildEmail(tasks: Task[], comms: Record<string, CommEntry[]>): string {
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const active = tasks.filter(t => t.status !== 'done')
  const done = tasks.filter(t => t.status === 'done')

  const needsAttention = active.filter(t => getRisk(t).level === 'overdue' || t.status === 'blocked')
  const dueSoon = active.filter(t => getRisk(t).level === 'soon' && !needsAttention.includes(t))
  const inProgress = active.filter(t => t.status === 'inprogress' && !needsAttention.includes(t) && !dueSoon.includes(t))
  const waiting = active.filter(t => t.status === 'waiting' && !needsAttention.includes(t))
  const notStarted = active.filter(t => t.status === 'todo' && !needsAttention.includes(t) && !dueSoon.includes(t))

  const sections: Section[] = [
    { heading: 'NEEDS ATTENTION', emoji: '⚠️', tasks: needsAttention },
    { heading: 'DUE THIS WEEK', emoji: '🗓️', tasks: dueSoon },
    { heading: 'IN PROGRESS', emoji: '🚀', tasks: inProgress },
    { heading: 'WAITING ON OTHERS', emoji: '⏳', tasks: waiting },
    { heading: 'NOT STARTED', emoji: '📋', tasks: notStarted },
    { heading: 'COMPLETED', emoji: '✅', tasks: done },
  ].filter(s => s.tasks.length > 0)

  function formatTask(t: Task): string {
    const risk = getRisk(t)
    const lastComm = comms[t.id]?.[0]
    const lines: string[] = []

    const meta: string[] = []
    meta.push(`Status: ${STATUS_LABELS[t.status] ?? t.status}`)
    if (t.due_date) meta.push(`Due: ${fmtDate(t.due_date)}`)
    if (t.stakeholder) meta.push(`Stakeholder: ${t.stakeholder}`)
    if (risk.level === 'overdue') meta.push(`⚠ ${risk.label}`)

    lines.push(`• ${t.name}`)
    lines.push(`  ${meta.join(' | ')}`)
    if (lastComm) {
      lines.push(`  Last update: ${lastComm.body}`)
    }
    return lines.join('\n')
  }

  const body: string[] = []
  body.push(`Weekly Update — ${dateStr}`)
  body.push('')
  body.push('Hi team,')
  body.push('')
  body.push(`Here's a quick rundown of where things stand heading into the weekend.`)
  body.push('')

  sections.forEach(section => {
    body.push('---')
    body.push('')
    body.push(`${section.emoji} ${section.heading}`)
    body.push('')
    section.tasks.forEach(t => {
      body.push(formatTask(t))
      body.push('')
    })
  })

  body.push('---')
  body.push('')
  body.push('Let me know if you have any questions.')
  body.push('')
  body.push('Tim')

  return body.join('\n')
}

export default function WeeklyUpdateModal({ tasks, comms, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const emailText = useMemo(() => buildEmail(tasks, comms), [tasks, comms])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function copyToClipboard() {
    await navigator.clipboard.writeText(emailText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeTasks = tasks.filter(t => t.status !== 'done')
  const overdueCount = tasks.filter(t => getRisk(t).level === 'overdue').length
  const waitingCount = tasks.filter(t => t.status === 'waiting').length

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(2px)', padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
        width: '680px', maxWidth: '95vw', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px', flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Weekly Update Email</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Pill color="var(--text-muted)">{activeTasks.length} active tasks</Pill>
              {overdueCount > 0 && <Pill color="var(--red)">⚠ {overdueCount} overdue</Pill>}
              {waitingCount > 0 && <Pill color="var(--amber)">⏳ {waitingCount} waiting</Pill>}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Hint */}
        <div style={{ padding: '10px 24px', background: 'var(--accent-soft)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <p style={{ fontSize: '12px', color: 'var(--accent)', lineHeight: 1.5 }}>
            Copy the text below and paste it into Outlook. Edit before sending — especially the opener and any tasks where the last update needs more context.
          </p>
        </div>

        {/* Email text */}
        <textarea
          readOnly
          value={emailText}
          style={{
            flex: 1, background: 'var(--surface2)', border: 'none', padding: '16px 24px',
            color: 'var(--text)', fontSize: '13px', lineHeight: 1.7, fontFamily: 'monospace',
            resize: 'none', outline: 'none', minHeight: 0,
          }}
        />

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '8px', flexShrink: 0 }}>
          <button onClick={onClose} style={ghostBtnStyle}>Close</button>
          <button
            onClick={copyToClipboard}
            style={{
              padding: '7px 16px', borderRadius: '6px', border: 'none',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font)',
              background: copied ? 'var(--green)' : 'var(--accent)', color: '#fff',
              transition: 'background 0.2s',
            }}
          >
            {copied ? '✓ Copied!' : 'Copy to clipboard'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ fontSize: '11px', color, fontWeight: 500 }}>{children}</span>
  )
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '7px 14px', borderRadius: '6px', border: '1px solid var(--border)',
  cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font)',
  background: 'transparent', color: 'var(--text-muted)',
}
