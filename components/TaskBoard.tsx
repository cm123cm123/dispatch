'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, CommEntry } from '@/lib/types'
import { getRisk, exportTasksCSV } from '@/lib/utils'
import StatsBar from './StatsBar'
import FilterBar from './FilterBar'
import TaskTable from './TaskTable'
import TaskDetail from './TaskDetail'
import AddTaskModal from './AddTaskModal'
import WeeklyUpdateModal from './WeeklyUpdateModal'

export default function TaskBoard() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [comms, setComms] = useState<Record<string, CommEntry[]>>({})
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterRisk, setFilterRisk] = useState(false)
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState<1 | -1>(1)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showWeeklyUpdate, setShowWeeklyUpdate] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const { data: taskData } = await supabase.from('tasks').select('*')
    if (!taskData) { setLoading(false); return }
    setTasks(taskData)

    if (taskData.length > 0) {
      const { data: commsData } = await supabase
        .from('comms_log')
        .select('*')
        .in('task_id', taskData.map(t => t.id))
        .order('entry_date', { ascending: false })
      if (commsData) {
        const grouped: Record<string, CommEntry[]> = {}
        commsData.forEach(c => {
          if (!grouped[c.task_id]) grouped[c.task_id] = []
          grouped[c.task_id].push(c)
        })
        setComms(grouped)
      }
    }
    setLoading(false)
  }

  const filteredTasks = useMemo(() => {
    const q = search.toLowerCase()
    return tasks
      .filter(t => {
        if (filterCat !== 'All' && t.category !== filterCat) return false
        if (filterStatus !== 'All' && t.status !== filterStatus) return false
        if (filterRisk && getRisk(t).level === 'ok') return false
        if (q && !t.name.toLowerCase().includes(q) && !(t.stakeholder ?? '').toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => {
        const da = a.due_date ?? '9999', db = b.due_date ?? '9999'
        return sortDir * da.localeCompare(db)
      })
  }, [tasks, filterCat, filterStatus, filterRisk, search, sortDir])

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) ?? null : null
  const selectedComms = selectedTaskId ? (comms[selectedTaskId] ?? []) : []

  async function updateStatus(id: string, status: string) {
    await supabase.from('tasks').update({ status }).eq('id', id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: status as Task['status'] } : t))
  }

  async function updateDue(id: string, due_date: string) {
    await supabase.from('tasks').update({ due_date: due_date || null }).eq('id', id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, due_date: due_date || null } : t))
  }

  async function addComm(taskId: string, type: string, body: string) {
    const entryDate = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('comms_log')
      .insert({ task_id: taskId, type, body, entry_date: entryDate, source: 'manual' })
      .select()
      .single()
    if (data) {
      setComms(prev => ({ ...prev, [taskId]: [data, ...(prev[taskId] ?? [])] }))
    }
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
    setComms(prev => { const next = { ...prev }; delete next[id]; return next })
    setSelectedTaskId(null)
  }

  async function addTask(taskData: Omit<Task, 'id' | 'created_at' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .insert({ ...taskData, user_id: user.id })
      .select()
      .single()
    if (data) setTasks(prev => [...prev, data])
  }

  function handleExport() {
    const lastCommsMap: Record<string, string | null> = {}
    tasks.forEach(t => { lastCommsMap[t.id] = comms[t.id]?.[0]?.entry_date ?? null })
    exportTasksCSV(filteredTasks, lastCommsMap)
  }

  return (
    <>
      <header style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', display: 'flex', alignItems: 'center', gap: '20px',
        height: '56px', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.3px' }}>
          Dispatch<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <div className="header-title" style={{ fontSize: '13px', color: 'var(--text-muted)', borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
          Task &amp; Comms Tracker
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowWeeklyUpdate(true)} style={ghostBtn}>📧 Weekly Update</button>
          <button onClick={handleExport} style={ghostBtn}>Export</button>
          <button onClick={() => setShowAdd(true)} style={primaryBtn}>+ Add Task</button>
        </div>
      </header>

      <StatsBar tasks={tasks} />

      <div style={{ padding: '20px 24px' }}>
        <FilterBar
          filterCat={filterCat} setFilterCat={setFilterCat}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterRisk={filterRisk} setFilterRisk={setFilterRisk}
          search={search} setSearch={setSearch}
        />
        <TaskTable
          tasks={filteredTasks}
          comms={comms}
          sortDir={sortDir}
          onSort={() => setSortDir(d => (d === 1 ? -1 : 1))}
          onRowClick={id => setSelectedTaskId(id)}
          loading={loading}
        />
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'right', padding: '8px 0', marginTop: '1px' }}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} total · updated {new Date().toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      </div>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          comms={selectedComms}
          onClose={() => setSelectedTaskId(null)}
          onUpdateStatus={updateStatus}
          onUpdateDue={updateDue}
          onAddComm={addComm}
          onDelete={deleteTask}
        />
      )}

      {showAdd && (
        <AddTaskModal
          onClose={() => setShowAdd(false)}
          onAdd={addTask}
        />
      )}

      {showWeeklyUpdate && (
        <WeeklyUpdateModal
          tasks={tasks}
          comms={comms}
          onClose={() => setShowWeeklyUpdate(false)}
        />
      )}
    </>
  )
}

const ghostBtn: React.CSSProperties = {
  padding: '7px 14px', borderRadius: '6px', border: '1px solid var(--border)',
  cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font)',
  background: 'transparent', color: 'var(--text-muted)',
}

const primaryBtn: React.CSSProperties = {
  padding: '7px 14px', borderRadius: '6px', border: 'none',
  cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font)',
  background: 'var(--accent)', color: '#fff',
}
