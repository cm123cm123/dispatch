export type Category = 'Campaigns' | 'Automations' | 'Stakeholder' | 'Projects' | 'AdHoc'
export type Status = 'todo' | 'inprogress' | 'waiting' | 'done' | 'blocked'
export type CommType = 'email' | 'note' | 'meeting'

export interface Task {
  id: string
  created_at: string
  name: string
  description: string | null
  category: Category
  status: Status
  stakeholder: string | null
  due_date: string | null
  user_id: string
}

export interface CommEntry {
  id: string
  task_id: string
  created_at: string
  type: CommType
  entry_date: string
  body: string
  source: 'manual' | 'graph_api'
}

export interface EmailScanLog {
  id: string
  scanned_at: string
  emails_found: number
  tasks_created: number
  tasks_updated: number
  raw_summary: string | null
}
