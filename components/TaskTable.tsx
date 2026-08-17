import type { Task, CommEntry } from '@/lib/types'
import { getRisk, fmtDate, fmtLastComms, CAT_LABELS, STATUS_LABELS } from '@/lib/utils'

interface Props {
  tasks: Task[]
  comms: Record<string, CommEntry[]>
  sortDir: 1 | -1
  onSort: () => void
  onRowClick: (id: string) => void
  loading: boolean
}

export default function TaskTable({ tasks, comms, sortDir, onSort, onRowClick, loading }: Props) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
        Loading…
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: 'var(--surface2)' }}>
          <tr>
            <Th style={{ width: '32%' }}>Task</Th>
            <Th>Category</Th>
            <Th>Status</Th>
            <Th>Stakeholder</Th>
            <Th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={onSort}
            >
              Due Date {sortDir === 1 ? '↑' : '↓'}
            </Th>
            <Th>Last Comms</Th>
            <Th>Risk</Th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
                No tasks match your filters
              </td>
            </tr>
          ) : (
            tasks.map((task, i) => <TaskRow key={task.id} task={task} comms={comms[task.id]} isLast={i === tasks.length - 1} onClick={() => onRowClick(task.id)} />)
          )}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <th
      onClick={onClick}
      style={{
        padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600,
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px',
        borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', ...style,
      }}
    >
      {children}
    </th>
  )
}

function TaskRow({ task, comms, isLast, onClick }: { task: Task; comms: CommEntry[] | undefined; isLast: boolean; onClick: () => void }) {
  const risk = getRisk(task)
  const lastDate = comms && comms.length > 0 ? comms[0].entry_date : null

  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        background: 'var(--surface)', cursor: 'pointer', transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
    >
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        <div style={{ fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{task.name}</div>
        {task.description && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {task.description.length > 80 ? task.description.substring(0, 80) + '…' : task.description}
          </div>
        )}
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        <span className={`cat cat-${task.category}`}>{CAT_LABELS[task.category] ?? task.category}</span>
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        <span className={`status-badge status-${task.status}`}>{STATUS_LABELS[task.status] ?? task.status}</span>
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle', fontSize: '12px', color: 'var(--text-muted)' }}>
        {task.stakeholder ?? '—'}
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle', fontSize: '12px', whiteSpace: 'nowrap' }}>
        {fmtDate(task.due_date)}
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {fmtLastComms(lastDate)}
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        {risk.level === 'overdue' ? (
          <span className="risk-overdue">⚠ {risk.label}</span>
        ) : risk.level === 'soon' ? (
          <span className="risk-soon">⏰ {risk.label}</span>
        ) : (
          <span className="risk-ok">{risk.label}</span>
        )}
      </td>
    </tr>
  )
}
