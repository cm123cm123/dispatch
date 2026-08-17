interface Props {
  filterCat: string
  setFilterCat: (v: string) => void
  filterStatus: string
  setFilterStatus: (v: string) => void
  filterRisk: boolean
  setFilterRisk: (v: boolean) => void
  search: string
  setSearch: (v: string) => void
}

const CATS = [
  { value: 'All', label: 'All' },
  { value: 'Campaigns', label: 'Campaigns' },
  { value: 'Automations', label: 'Automations' },
  { value: 'Stakeholder', label: 'Stakeholder Requests' },
  { value: 'Projects', label: 'Projects' },
  { value: 'AdHoc', label: 'Ad Hoc' },
]

const STATUSES = [
  { value: 'All', label: 'All' },
  { value: 'todo', label: 'Not Started' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'done', label: 'Done' },
]

export default function FilterBar({ filterCat, setFilterCat, filterStatus, setFilterStatus, filterRisk, setFilterRisk, search, setSearch }: Props) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '4px' }}>Category</span>
      {CATS.map(c => (
        <button
          key={c.value}
          className={`chip${filterCat === c.value ? ' active' : ''}`}
          onClick={() => setFilterCat(c.value)}
        >
          {c.label}
        </button>
      ))}

      <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '4px' }}>Status</span>
      {STATUSES.map(s => (
        <button
          key={s.value}
          className={`chip${filterStatus === s.value ? ' active' : ''}`}
          onClick={() => setFilterStatus(s.value)}
        >
          {s.label}
        </button>
      ))}

      <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

      <button
        className={`chip${filterRisk ? ' active' : ''}`}
        onClick={() => setFilterRisk(!filterRisk)}
      >
        ⚠ At Risk Only
      </button>

      <div style={{ marginLeft: 'auto' }}>
        <input
          type="text"
          placeholder="Search tasks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '6px 12px', color: 'var(--text)',
            fontSize: '13px', width: '200px', fontFamily: 'var(--font)', outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>
    </div>
  )
}
