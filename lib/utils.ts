import type { Task } from './types'

export function today(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function todayStr(): string {
  return today().toISOString().split('T')[0]
}

export function daysFromNow(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today().getTime()) / 86400000)
}

export function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' })
}

export function getRisk(task: Task): { level: 'ok' | 'overdue' | 'soon'; label: string } {
  const d = daysFromNow(task.due_date)
  if (task.status === 'done') return { level: 'ok', label: '✓ Done' }
  if (d === null) return { level: 'ok', label: '—' }
  if (d < 0) return { level: 'overdue', label: `${Math.abs(d)}d overdue` }
  if (d <= 3) return { level: 'soon', label: `Due in ${d}d` }
  return { level: 'ok', label: fmtDate(task.due_date) }
}

export function fmtLastComms(lastDate: string | null | undefined): string {
  if (!lastDate) return '—'
  const ago = -(daysFromNow(lastDate) ?? 0)
  if (ago === 0) return 'Today'
  if (ago === 1) return 'Yesterday'
  return `${ago}d ago`
}

export const CAT_LABELS: Record<string, string> = {
  Campaigns: 'Campaigns',
  Automations: 'Automations',
  Stakeholder: 'Stakeholder',
  Projects: 'Projects',
  AdHoc: 'Ad Hoc',
}

export const STATUS_LABELS: Record<string, string> = {
  todo: 'Not Started',
  inprogress: 'In Progress',
  waiting: 'Waiting',
  done: 'Done',
  blocked: 'Blocked',
}

export function exportTasksCSV(tasks: Task[], lastCommsMap: Record<string, string | null>) {
  const headers = ['Task', 'Category', 'Status', 'Stakeholder', 'Due Date', 'Last Comms', 'Risk']
  const rows = tasks.map(t => {
    const risk = getRisk(t)
    return [
      `"${t.name.replace(/"/g, '""')}"`,
      t.category,
      STATUS_LABELS[t.status] ?? t.status,
      t.stakeholder ?? '',
      fmtDate(t.due_date),
      fmtLastComms(lastCommsMap[t.id]),
      risk.label,
    ]
  })
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const a = document.createElement('a')
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  a.download = 'dispatch-tasks.csv'
  a.click()
}
