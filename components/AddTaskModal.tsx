'use client'

import { useState, useEffect, useRef } from 'react'
import type { Task, Category, Status } from '@/lib/types'

interface Props {
  onClose: () => void
  onAdd: (task: Omit<Task, 'id' | 'created_at' | 'user_id'>) => Promise<void>
}

export default function AddTaskModal({ onClose, onAdd }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('Campaigns')
  const [status, setStatus] = useState<Status>('todo')
  const [due_date, setDueDate] = useState('')
  const [stakeholder, setStakeholder] = useState('')
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { nameRef.current?.focus(); return }
    setSaving(true)
    await onAdd({
      name: name.trim(),
      description: description.trim() || null,
      category,
      status,
      due_date: due_date || null,
      stakeholder: stakeholder.trim() || null,
    })
    setSaving(false)
    onClose()
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
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Add New Task</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', padding: '2px 6px', borderRadius: '4px' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px 24px 24px' }}>
          <FormGroup label="Task Name" required>
            <input
              ref={nameRef}
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Q4 win-back campaign build"
              required
            />
          </FormGroup>

          <FormGroup label="Description / Source">
            <textarea
              className="form-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this task? Where did it come from? (email, project, meeting…)"
            />
          </FormGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormGroup label="Category" required>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value as Category)}>
                <option value="Campaigns">Campaigns</option>
                <option value="Automations">Automations</option>
                <option value="Stakeholder">Stakeholder Requests</option>
                <option value="Projects">Projects</option>
                <option value="AdHoc">Ad Hoc</option>
              </select>
            </FormGroup>

            <FormGroup label="Status">
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value as Status)}>
                <option value="todo">Not Started</option>
                <option value="inprogress">In Progress</option>
                <option value="waiting">Waiting on Others</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </FormGroup>

            <FormGroup label="Due Date">
              <input type="date" className="form-input" value={due_date} onChange={e => setDueDate(e.target.value)} />
            </FormGroup>

            <FormGroup label="Stakeholder">
              <input
                className="form-input"
                value={stakeholder}
                onChange={e => setStakeholder(e.target.value)}
                placeholder="e.g. Sarah Chen, Underwriting"
              />
            </FormGroup>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 14px', borderRadius: '6px', border: '1px solid var(--border)',
                cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font)',
                background: 'transparent', color: 'var(--text-muted)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '7px 14px', borderRadius: '6px', border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 500,
                fontFamily: 'var(--font)', background: 'var(--accent)', color: '#fff',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Adding…' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px' }}>
        {label} {required && <span style={{ color: 'var(--red)' }}>*</span>}
      </label>
      {children}
    </div>
  )
}
