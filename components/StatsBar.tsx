import type { Task } from '@/lib/types'
import { getRisk } from '@/lib/utils'

export default function StatsBar({ tasks }: { tasks: Task[] }) {
  const active = tasks.filter(t => t.status !== 'done').length
  const overdue = tasks.filter(t => getRisk(t).level === 'overdue').length
  const soon = tasks.filter(t => getRisk(t).level === 'soon').length
  const waiting = tasks.filter(t => t.status === 'waiting').length
  const done = tasks.filter(t => t.status === 'done').length

  return (
    <div style={{
      display: 'flex', gap: '12px', padding: '16px 24px',
      borderBottom: '1px solid var(--border)', background: 'var(--surface)',
      overflowX: 'auto',
    }}>
      <Stat label="Total Active" value={active} />
      <Stat label="Overdue" value={overdue} variant="risk" />
      <Stat label="Due ≤ 3 Days" value={soon} variant="warn" />
      <Stat label="Waiting on Others" value={waiting} />
      <Stat label="Completed" value={done} />
    </div>
  )
}

function Stat({ label, value, variant }: { label: string; value: number; variant?: 'risk' | 'warn' }) {
  const base: React.CSSProperties = {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '12px 16px', minWidth: '120px', flexShrink: 0,
  }
  const riskStyle: React.CSSProperties = { ...base, borderColor: 'rgba(255,92,92,0.3)', background: 'var(--red-soft)' }
  const warnStyle: React.CSSProperties = { ...base, borderColor: 'rgba(245,166,35,0.3)', background: 'var(--amber-soft)' }
  const valueColor = variant === 'risk' ? 'var(--red)' : variant === 'warn' ? 'var(--amber)' : 'var(--text)'

  return (
    <div style={variant === 'risk' ? riskStyle : variant === 'warn' ? warnStyle : base}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: valueColor }}>{value}</div>
    </div>
  )
}
