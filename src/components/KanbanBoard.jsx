import { useNavigate } from 'react-router-dom'
import { useJobs, STATUS } from '../context/JobsContext'
import CompanyLogo from './CompanyLogo'
import { MdAdd, MdOpenInNew } from 'react-icons/md'

const COLUMNS = [
  { status: STATUS.WISHLIST,  label: 'Wishlist',   color: 'var(--text-muted)', bg: 'rgba(160,168,192,0.08)' },
  { status: STATUS.APPLIED,   label: 'Applied',    color: 'var(--blue)',        bg: 'var(--blue-dim)'        },
  { status: STATUS.INTERVIEW, label: 'Interview',  color: 'var(--amber)',       bg: 'var(--amber-dim)'       },
  { status: STATUS.OFFER,     label: 'Offer',      color: 'var(--green)',       bg: 'var(--green-dim)'       },
  { status: STATUS.REJECTED,  label: 'Rejected',   color: 'var(--red)',         bg: 'var(--red-dim)'         },
]

function JobCard({ job, onClick }) {
  const date = new Date(job.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return (
    <div className="kb-card" onClick={onClick}>
      <div className="kb-card__top">
        <CompanyLogo company={job.company} domain={job.domain} size={28} />
        <div className="kb-card__info">
          <span className="kb-card__company">{job.company}</span>
          <span className="kb-card__role">{job.role}</span>
        </div>
      </div>
      <div className="kb-card__footer">
        <span className="kb-card__date">{date}</span>
        {job.link && (
          <a
            href={job.link}
            target="_blank"
            rel="noreferrer"
            className="kb-card__link"
            onClick={e => e.stopPropagation()}
            title="Open job posting"
          >
            <MdOpenInNew size={13} />
          </a>
        )}
      </div>
      {job.notes && (
        <p className="kb-card__notes">{job.notes}</p>
      )}
    </div>
  )
}

function Column({ status, label, color, bg, jobs }) {
  const navigate = useNavigate()
  return (
    <div className="kb-col" style={{ '--kb-col-color': color }}>
      {/* Column header */}
      <div className="kb-col__header">
        <div className="kb-col__title-row">
          <span className="kb-col__dot" style={{ background: color }} />
          <span className="kb-col__label">{label}</span>
          <span className="kb-col__count" style={{ color, background: bg }}>{jobs.length}</span>
        </div>
      </div>

      {/* Cards */}
      <div className="kb-col__body">
        {jobs.length === 0 ? (
          <div className="kb-empty">No applications yet</div>
        ) : (
          jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => navigate(`/jobs/${job.id}`)}
            />
          ))
        )}

        {/* Add button at bottom of each column */}
        <button
          className="kb-add-btn"
          onClick={() => navigate('/jobs/new')}
          title={`Add ${label} application`}
        >
          <MdAdd size={15} /> Add
        </button>
      </div>
    </div>
  )
}

export default function KanbanBoard({ jobs }) {
  const visibleColumns = COLUMNS.filter(col => 
    jobs.some(j => j.status === col.status)
  )

  return (
    <div className="kb-board">
      {visibleColumns.map(col => (
        <Column
          key={col.status}
          {...col}
          jobs={jobs.filter(j => j.status === col.status)}
        />
      ))}
    </div>
  )
}
