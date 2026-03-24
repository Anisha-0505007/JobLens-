import { useJobs, STATUS } from '../context/JobsContext'
import { useNavigate } from 'react-router-dom'
import CompanyLogo from '../components/CompanyLogo'
import { MdTrendingUp, MdWork, MdOutlineMarkEmailRead, MdStar, MdClose, MdBookmark, MdArrowForward } from 'react-icons/md'

const STATUS_META = {
  [STATUS.WISHLIST]:  { color: 'var(--text-muted)', bg: 'rgba(160,168,192,0.1)',  label: 'Wishlist'   },
  [STATUS.APPLIED]:   { color: 'var(--blue)',        bg: 'var(--blue-dim)',        label: 'Applied'    },
  [STATUS.INTERVIEW]: { color: 'var(--amber)',       bg: 'var(--amber-dim)',       label: 'Interview'  },
  [STATUS.OFFER]:     { color: 'var(--green)',       bg: 'var(--green-dim)',       label: 'Offer'      },
  [STATUS.REJECTED]:  { color: 'var(--red)',         bg: 'var(--red-dim)',         label: 'Rejected'   },
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card" style={{ '--c': color }}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
        {sub && <span className="stat-card__sub">{sub}</span>}
      </div>
      <div className="stat-card__glow" />
    </div>
  )
}

function ActivityRow({ job }) {
  const meta = STATUS_META[job.status]
  const formatted = new Date(job.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })
  return (
    <div className="activity-row">
      <CompanyLogo company={job.company} domain={job.domain} jobLink={job.link} size={36} />
      <div className="activity-info">
        <span className="activity-company">{job.company}</span>
        <span className="activity-role">{job.role}</span>
      </div>
      <span
        className="activity-badge"
        style={{ color: meta.color, background: meta.bg }}
      >
        {meta.label}
      </span>
      <span className="activity-date">{formatted}</span>
    </div>
  )
}

export default function Dashboard() {
  const { stats, jobs } = useJobs()
  const navigate = useNavigate()

  const recent = [...jobs]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const activeRate = stats.total
    ? Math.round(((stats.applied + stats.interview + stats.offer) / stats.total) * 100)
    : 0

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your job search at a glance</p>
      </div>

      {/* ── Stats grid ── */}
      <div className="stats-grid">
        <StatCard
          icon={<MdWork />}
          label="Total Apps"
          value={stats.total}
          sub={`${activeRate}% active`}
          color="var(--accent)"
        />
        <StatCard
          icon={<MdOutlineMarkEmailRead />}
          label="Applied"
          value={stats.applied}
          color="var(--blue)"
        />
        <StatCard
          icon={<MdTrendingUp />}
          label="Interviewing"
          value={stats.interview}
          color="var(--amber)"
        />
        <StatCard
          icon={<MdStar />}
          label="Offers"
          value={stats.offer}
          color="var(--green)"
        />
        <StatCard
          icon={<MdClose />}
          label="Rejected"
          value={stats.rejected}
          color="var(--red)"
        />
        <StatCard
          icon={<MdBookmark />}
          label="Wishlist"
          value={stats.wishlist}
          color="var(--text-muted)"
        />
      </div>

      {/* ── Progress bar ── */}
      <div className="pipeline-bar-wrap">
        <span className="pipeline-bar-label">Application Pipeline</span>
        <div className="pipeline-bar">
          {stats.wishlist  > 0 && <div className="pipeline-seg" style={{ flex: stats.wishlist,  background: 'var(--text-subtle)' }} title={`Wishlist: ${stats.wishlist}`} />}
          {stats.applied   > 0 && <div className="pipeline-seg" style={{ flex: stats.applied,   background: 'var(--blue)'       }} title={`Applied: ${stats.applied}`} />}
          {stats.interview > 0 && <div className="pipeline-seg" style={{ flex: stats.interview,  background: 'var(--amber)'      }} title={`Interview: ${stats.interview}`} />}
          {stats.offer     > 0 && <div className="pipeline-seg" style={{ flex: stats.offer,     background: 'var(--green)'      }} title={`Offer: ${stats.offer}`} />}
          {stats.rejected  > 0 && <div className="pipeline-seg" style={{ flex: stats.rejected,  background: 'var(--red)'        }} title={`Rejected: ${stats.rejected}`} />}
        </div>
        <div className="pipeline-legend">
          {[
            ['Wishlist','var(--text-subtle)'],
            ['Applied','var(--blue)'],
            ['Interview','var(--amber)'],
            ['Offer','var(--green)'],
            ['Rejected','var(--red)'],
          ].map(([l, c]) => (
            <span key={l} className="legend-item">
              <i style={{ background: c }} />
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* ── Recent activity ── */}
      <div className="section-header">
        <h2 className="section-title">Recent Activity</h2>
        <button className="link-btn" onClick={() => navigate('/jobs')}>
          View all <MdArrowForward />
        </button>
      </div>

      <div className="activity-list card">
        {recent.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
            No applications yet. Add your first job!
          </p>
        ) : (
          recent.map((job) => <ActivityRow key={job.id} job={job} />)
        )}
      </div>
    </div>
  )
}
