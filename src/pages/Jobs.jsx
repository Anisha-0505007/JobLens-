import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJobs, STATUS, LOCATION_TYPE } from '../context/JobsContext'
import { useDebounce } from '../hooks/useDebounce'
import CompanyLogo from '../components/CompanyLogo'
import KanbanBoard from '../components/KanbanBoard'
import {
  MdAdd, MdSearch, MdArrowUpward, MdArrowDownward,
  MdUnfoldMore, MdWork, MdViewList, MdViewKanban,
  MdFilterList, MdClose, MdEdit, MdDelete,
  MdBookmark, MdBookmarkBorder, MdLanguage, MdExplore,
} from 'react-icons/md'

const STATUS_META = {
  [STATUS.WISHLIST]:  { color: 'var(--text-muted)', bg: 'rgba(160,168,192,0.1)' },
  [STATUS.APPLIED]:   { color: 'var(--blue)',        bg: 'var(--blue-dim)'       },
  [STATUS.INTERVIEW]: { color: 'var(--amber)',       bg: 'var(--amber-dim)'      },
  [STATUS.OFFER]:     { color: 'var(--green)',       bg: 'var(--green-dim)'      },
  [STATUS.REJECTED]:  { color: 'var(--red)',         bg: 'var(--red-dim)'        },
}

const TABS = ['All', ...Object.values(STATUS)]

const TABLE_COLS = [
  { key: 'company', label: 'Company'      },
  { key: 'role',    label: 'Role'         },
  { key: 'status',  label: 'Status'       },
  { key: 'salary',  label: 'Salary Range' },
  { key: 'date',    label: 'Date Applied' },
]

function SortIcon({ col, sortKey, dir }) {
  if (sortKey !== col) return <MdUnfoldMore className="sort-icon sort-icon--idle" />
  return dir === 'asc'
    ? <MdArrowUpward   className="sort-icon sort-icon--active" />
    : <MdArrowDownward className="sort-icon sort-icon--active" />
}

export default function Jobs() {
  const { jobs, deleteJob, toggleBookmark, loading } = useJobs()
  const navigate  = useNavigate()

  const [tab,       setTab]       = useState('All')
  const [search,    setSearch]    = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [sortKey,   setSortKey]   = useState('date')
  const [sortDir,   setSortDir]   = useState('desc')
  const [view,      setView]      = useState('list')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [showDates, setShowDates] = useState(false)

  const [platform,     setPlatform]     = useState('All')
  const [locationType, setLocationType] = useState('All')
  const [onlyBookmarked, setOnlyBookmarked] = useState(false)

  /* ── Derived filter options ── */
  const platforms = useMemo(() => {
    const set = new Set(jobs.map(j => j.platform).filter(Boolean))
    return ['All', ...Array.from(set).sort()]
  }, [jobs])

  const locationTypes = ['All', ...Object.values(LOCATION_TYPE)]

  /* ── Derived filter state ── */
  const hasActiveFilters = search || dateFrom || dateTo || tab !== 'All' || platform !== 'All' || locationType !== 'All' || onlyBookmarked

  const clearAll = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setTab('All')
    setPlatform('All')
    setLocationType('All')
    setOnlyBookmarked(false)
    setShowDates(false)
  }

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    let list = tab === 'All' ? jobs : jobs.filter(j => j.status === tab)

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter(j =>
        j.company.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q)
      )
    }

    if (dateFrom) list = list.filter(j => j.date >= dateFrom)
    if (dateTo)   list = list.filter(j => j.date <= dateTo)

    if (platform !== 'All') {
      list = list.filter(j => j.platform === platform)
    }
    if (locationType !== 'All') {
      list = list.filter(j => j.locationType === locationType)
    }
    if (onlyBookmarked) {
      list = list.filter(j => j.bookmarked)
    }

    return [...list].sort((a, b) => {
      let va = a[sortKey] ?? '', vb = b[sortKey] ?? ''
      if (sortKey === 'date') { va = new Date(va); vb = new Date(vb) }
      else { va = (va || '').toString().toLowerCase(); vb = (vb || '').toString().toLowerCase() }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [jobs, tab, debouncedSearch, sortKey, sortDir, dateFrom, dateTo, platform, locationType, onlyBookmarked])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const count = (t) => t === 'All'
    ? jobs.length
    : jobs.filter(j => j.status === t).length

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header jobs-header">
        <div>
          <h1 className="page-title">Job Applications</h1>
          <p className="page-subtitle">{jobs.length} total applications tracked</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/jobs/new')}>
          <MdAdd size={17} /> Add Job
        </button>
      </div>

      {/* Status tabs */}
      <div className="jobs-tabs">
        {TABS.map(t => (
          <button
            key={t}
            className={'jobs-tab' + (tab === t ? ' jobs-tab--active' : '')}
            onClick={() => setTab(t)}
            style={tab === t && t !== 'All'
              ? { color: STATUS_META[t]?.color, borderBottomColor: STATUS_META[t]?.color }
              : {}
            }
          >
            {t}
            <span className="jobs-tab-count">{count(t)}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="jobs-toolbar">
        {/* Search */}
        <div className="search-wrap">
          <MdSearch className="search-icon" />
          <input
            className="search-input"
            placeholder="Search by company or role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Platform Filter */}
        <div className="filter-select-wrap">
          <MdLanguage className="filter-select-icon" />
          <select
            className={'filter-select' + (platform !== 'All' ? ' filter-select--active' : '')}
            value={platform}
            onChange={e => setPlatform(e.target.value)}
          >
            <option value="All">Platform</option>
            {platforms.filter(p => p !== 'All').map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Location Type Filter */}
        <div className="filter-select-wrap">
          <MdExplore className="filter-select-icon" />
          <select
            className={'filter-select' + (locationType !== 'All' ? ' filter-select--active' : '')}
            value={locationType}
            onChange={e => setLocationType(e.target.value)}
          >
            <option value="All">Location Type</option>
            {locationTypes.filter(lt => lt !== 'All').map(lt => (
              <option key={lt} value={lt}>{lt}</option>
            ))}
          </select>
        </div>

        {/* Date filter toggle */}
        <button
          className={'filter-btn' + (showDates ? ' filter-btn--active' : '')}
          onClick={() => setShowDates(v => !v)}
          title="Filter by date"
        >
          <MdFilterList size={16} />
          Date
          {(dateFrom || dateTo) && <span className="filter-dot" />}
        </button>

        {/* Bookmarked Filter */}
        <button
          className={'filter-btn' + (onlyBookmarked ? ' filter-btn--active' : '')}
          onClick={() => setOnlyBookmarked(v => !v)}
          title="Show bookmarked jobs only"
          style={{ color: onlyBookmarked ? 'var(--amber)' : 'inherit' }}
        >
          {onlyBookmarked ? <MdBookmark size={17} /> : <MdBookmarkBorder size={17} />}
          Starred
        </button>

        {/* Clear all */}
        {hasActiveFilters && (
          <button className="filter-clear-btn" onClick={clearAll}>
            <MdClose size={14} /> Clear filters
          </button>
        )}

        <span className="jobs-count-label" style={{ marginLeft: 'auto' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>

        {/* View toggle */}
        <div className="view-toggle">
          <button
            className={'view-toggle__btn' + (view === 'list'  ? ' active' : '')}
            onClick={() => setView('list')}
            title="List view"
          >
            <MdViewList size={18} />
          </button>
          <button
            className={'view-toggle__btn' + (view === 'board' ? ' active' : '')}
            onClick={() => setView('board')}
            title="Board view"
          >
            <MdViewKanban size={18} />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="placeholder-block" style={{ minHeight: 220 }}>
          <p>Seeding premium mock data...</p>
        </div>
      )}

      {/* Date range row — shown when filter open */}
      {!loading && showDates && (
        <div className="date-filter-row">
          <div className="date-filter-field">
            <label className="date-filter-label">From</label>
            <input
              type="date"
              className="form-input"
              style={{ paddingLeft: 14 }}
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              max={dateTo || undefined}
            />
          </div>
          <div className="date-filter-field">
            <label className="date-filter-label">To</label>
            <input
              type="date"
              className="form-input"
              style={{ paddingLeft: 14 }}
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              min={dateFrom || undefined}
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              className="filter-clear-btn"
              onClick={() => { setDateFrom(''); setDateTo('') }}
            >
              <MdClose size={13} /> Clear dates
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {!loading && hasActiveFilters && (
        <div className="filter-chips">
          {tab !== 'All' && (
            <span className="filter-chip" style={{ color: STATUS_META[tab]?.color, background: STATUS_META[tab]?.bg }}>
              {tab} <button onClick={() => setTab('All')}>✕</button>
            </span>
          )}
          {search && (
            <span className="filter-chip">
              "{search}" <button onClick={() => setSearch('')}>✕</button>
            </span>
          )}
          {dateFrom && (
            <span className="filter-chip">
              From: {formatDate(dateFrom)} <button onClick={() => setDateFrom('')}>✕</button>
            </span>
          )}
          {dateTo && (
            <span className="filter-chip">
              To: {formatDate(dateTo)} <button onClick={() => setDateTo('')}>✕</button>
            </span>
          )}
          {platform !== 'All' && (
            <span className="filter-chip">
              Platform: {platform} <button onClick={() => setPlatform('All')}>✕</button>
            </span>
          )}
          {locationType !== 'All' && (
            <span className="filter-chip">
              Type: {locationType} <button onClick={() => setLocationType('All')}>✕</button>
            </span>
          )}
          {onlyBookmarked && (
            <span className="filter-chip" style={{ color: 'var(--amber)', background: 'rgba(255,193,7,0.07)' }}>
              Starred <button onClick={() => setOnlyBookmarked(false)}>✕</button>
            </span>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {!loading && (
        <>
          {filtered.length === 0 ? (
            <div className="card">
              <div className="placeholder-block" style={{ minHeight: 220 }}>
                <MdWork style={{ width: 40, height: 40, opacity: 0.2 }} />
                <p>No applications match your filters</p>
                <button className="link-btn" onClick={clearAll}>Clear all filters</button>
              </div>
            </div>
          ) : (
            <>
              {view === 'list' && (
                <div className="jobs-table-wrap card">
                  <table className="jobs-table">
                    <thead>
                      <tr>
                        {TABLE_COLS.map(col => (
                          <th key={col.key} className="jobs-th" onClick={() => toggleSort(col.key)}>
                            <span>{col.label}</span>
                            <SortIcon col={col.key} sortKey={sortKey} dir={sortDir} />
                          </th>
                        ))}
                        <th className="jobs-th jobs-th--actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(job => {
                        const meta = STATUS_META[job.status]
                        return (
                          <tr key={job.id} className="jobs-row" onClick={() => navigate(`/jobs/${job.id}`)}>
                            <td className="jobs-td">
                              <div className="job-company-cell">
                                <CompanyLogo company={job.company} domain={job.domain} size={32} />
                                <span className="job-company-name">{job.company}</span>
                              </div>
                            </td>
                            <td className="jobs-td"><span className="job-role">{job.role}</span></td>
                            <td className="jobs-td">
                              <span className="status-badge" style={{ color: meta.color, background: meta.bg }}>
                                {job.status}
                              </span>
                            </td>
                            <td className="jobs-td jobs-td--muted">{job.salary || <em className="detail-empty">—</em>}</td>
                            <td className="jobs-td jobs-td--muted">{formatDate(job.date)}</td>
                            <td className="jobs-td jobs-td--actions" onClick={e => e.stopPropagation()}>
                              <div className="row-actions-group">
                                <button
                                  className={'row-action-btn row-action-btn--bookmark' + (job.bookmarked ? ' is-active' : '')}
                                  onClick={() => toggleBookmark(job.id)}
                                  title={job.bookmarked ? 'Unbookmark' : 'Bookmark'}
                                >
                                  {job.bookmarked ? <MdBookmark size={18} /> : <MdBookmarkBorder size={18} />}
                                </button>
                                <button
                                  className="row-action-btn"
                                  onClick={() => navigate(`/jobs/${job.id}?edit=true`)}
                                  title="Edit"
                                >
                                  <MdEdit size={18} />
                                </button>
                                <button
                                  className="row-action-btn row-action-btn--danger"
                                  onClick={() => {
                                    if (window.confirm(`Delete ${job.role} at ${job.company}?`)) {
                                      deleteJob(job.id)
                                    }
                                  }}
                                  title="Delete"
                                >
                                  <MdDelete size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {view === 'board' && <KanbanBoard jobs={filtered} />}
            </>
          )}
        </>
      )}
    </div>
  )
}
