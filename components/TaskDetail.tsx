'use client'

import { useState, useRef, useEffect } from 'react'
import type { Task, CommEntry, CommType } from '@/lib/types'
import { getRisk, fmtDate, fmtLastComms, CAT_LABELS, STATUS_LABELS } from '@/lib/utils'

interface Props {
  task: Task
  comms: CommEntry[]
  onClose: () => void
  onUpdateStatus: (id: string, status: string) => Promise<void>
  onUpdateDue: (id: string, due: string) => Promise<void>
  onAddComm: (taskId: string, type: string, body: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function TaskDetail({ task, comms, onClose, onUpdateStatus, onUpdateDue, onAddComm, onDelete }: Props) {
  const [commText, setCommText] = useState('')
  const [commType, setCommType] = useState<CommType>('note')
  const [loggingComm, setLoggingComm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const risk = getRisk(task)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleAddComm() {
    if (!commText.trim()) return
    setLoggingComm(true)
    await onAddComm(task.id, commType, commText.trim())
    setCommText('')
    setLoggingComm(false)
    inputRef.current?.focus()
  }

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
        width: '560px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.4 }}>{task.name}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span className={`cat cat-${task.category}`}>{CAT_LABELS[task.category] ?? task.category}</span>
            <span className={`status-badge status-${task.status}`}>{STATUS_LABELS[task.status] ?? task.status}</span>
            {risk.level === 'overdue' && <span className="risk-overdue">⚠ {risk.label}</span>}
            {risk.level === 'soon' && <span className="risk-soon">⏰ {risk.label}</span>}
          </div>

          {/* Description */}
          {task.description && (
            <div style={{ marginBottom: '16px' }}>
              <SectionTitle>Description</SectionTitle>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{task.description}</div>
            </div>
          )}

          {/* Stakeholder + Due */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <SectionTitle>Stakeholder</SectionTitle>
              <div style={{ fontSize: '13px' }}>{task.stakeholder ?? '—'}</div>
            </div>
            <div>
              <SectionTitle>Due Date</SectionTitle>
              <div style={{ fontSize: '13px' }}>{fmtDate(task.due_date)}</div>
            </div>
          </div>

          {/* Inline edits */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px' }}>Update Status</label>
              <select
                className="form-select"
                defaultValue={task.status}
                onChange={e => onUpdateStatus(task.id, e.target.value)}
              >
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px' }}>Update Due Date</label>
              <input
                type="date"
                className="form-input"
                defaultValue={task.due_date ?? ''}
                onChange={e => onUpdateDue(task.id, e.target.value)}
              />
            </div>
          </div>

          {/* Comms log */}
          <div>
            <SectionTitle>Communications Log</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              {comms.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>No communications logged yet.</div>
              ) : (
                comms.map(c => (
                  <div key={c.id} className={`comm-item ${c.type}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`comm-type ${c.type}`}>{c.type}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fmtDate(c.entry_date)}</span>
                      {c.source === 'graph_api' && (
                        <span style={{ fontSize: '10px', color: 'var(--accent)', marginLeft: 'auto' }}>auto</span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>{c.body}</div>
                  </div>
                ))
              )}
            </div>

            {/* Add comm */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={commType}
                onChange={e => setCommType(e.target.value as CommType)}
                style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',
                  padding: '7px 10px', color: 'var(--text)', fontSize: '12px', fontFamily: 'var(--font)', outline: 'none',
                }}
              >
                <option value="note">Note</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
              </select>
              <input
                ref={inputRef}
                type="text"
                value={commText}
                onChange={e => setCommText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddComm() }}
                placeholder="Add a note or log comms…"
                style={{
                  flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '6px', padding: '7px 11px', color: 'var(--text)',
                  fontSize: '12px', fontFamily: 'var(--font)', outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                onClick={handleAddComm}
                disabled={loggingComm}
                style={{
                  padding: '7px 12px', background: 'var(--accent)', color: '#fff',
                  border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                  cursor: loggingComm ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)',
                }}
              >
                Log
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            {confirmDelete ? (
              <>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', alignSelf: 'center' }}>Delete this task?</span>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{ ...ghostBtnStyle }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  style={{ ...ghostBtnStyle, color: 'var(--red)', borderColor: 'rgba(255,92,92,0.3)' }}
                >
                  Yes, delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{ ...ghostBtnStyle, color: 'var(--red)', borderColor: 'rgba(255,92,92,0.3)' }}
                >
                  Delete
                </button>
                <button onClick={onClose} style={ghostBtnStyle}>Close</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
      {children}
    </div>
  )
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '7px 14px', borderRadius: '6px', border: '1px solid var(--border)',
  cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font)',
  background: 'transparent', color: 'var(--text-muted)',
}
