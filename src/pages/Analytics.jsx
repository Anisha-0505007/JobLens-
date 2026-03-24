import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { useJobs, STATUS } from '../context/JobsContext'

const STATUS_COLORS = {
  [STATUS.WISHLIST]: '#6b7280',
  [STATUS.APPLIED]: '#0A84FF',
  [STATUS.INTERVIEW]: '#f59e0b',
  [STATUS.OFFER]: '#22c55e',
  [STATUS.REJECTED]: '#ef4444',
}

const card = {
  background: '#1a1d27',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 12,
  padding: '28px',
}

const axisProps = {
  tick: { fill: 'rgba(255,255,255,0.3)', fontSize: 11 },
  axisLine: false,
  tickLine: false,
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1e2235',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '10px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      {label && (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill, fontSize: 13, fontWeight: 600 }}>
          {p.name}: <span style={{ color: '#fff' }}>{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#1a1d27',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'rgba(255,255,255,0.3)',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 34,
        fontWeight: 700,
        color,
        lineHeight: 1,
      }}>
        {value}
      </span>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div style={card}>
      <p style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'rgba(255,255,255,0.35)',
        marginBottom: 24,
      }}>
        {title}
      </p>
      {children}
    </div>
  )
}

export default function Analytics() {
  const { jobs, stats } = useJobs()

  const pieData = Object.values(STATUS)
    .map(s => ({ name: s, value: jobs.filter(j => j.status === s).length }))
    .filter(d => d.value > 0)

  const byMonth = jobs.reduce((acc, job) => {
    const key = new Date(job.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const timelineData = Object.entries(byMonth)
    .sort(([a], [b]) => new Date('1 ' + a) - new Date('1 ' + b))
    .map(([month, count]) => ({ month, Applications: count }))

  const barData = Object.values(STATUS).map(s => ({
    status: s,
    count: jobs.filter(j => j.status === s).length,
  }))

  const responseRate = stats.total
    ? Math.round(((stats.interview + stats.offer) / stats.total) * 100)
    : 0

  if (jobs.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Insights into your job search</p>
        </div>
        <div className="placeholder-block card">
          <p>Add some job applications to see analytics.</p>
        </div>
      </div>
    )
  }

  const STAT_META = [
    { label: 'Total Applications', value: stats.total, color: '#e8edf8' },
    { label: 'Interviewing', value: stats.interview, color: '#f59e0b' },
    { label: 'Offers Received', value: stats.offer, color: '#22c55e' },
    { label: 'Response Rate', value: `${responseRate}%`, color: '#0A84FF' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Insights across {stats.total} applications</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        {STAT_META.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: 20,
        marginBottom: 20,
      }}>
        <ChartCard title="Applications by Status">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={38} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="status" {...axisProps} />
              <YAxis allowDecimals={false} width={28} {...axisProps} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 6 }} />
              <Bar dataKey="count" name="Jobs" radius={[8, 8, 0, 0]}>
                {barData.map(entry => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status Distribution">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map(entry => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                formatter={v => <span style={{ color: 'rgba(255,255,255,0.45)' }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Month Wise Applications">
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={timelineData} barSize={34}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis allowDecimals={false} width={28} {...axisProps} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="Applications" radius={[8, 8, 0, 0]} fill="#6c63ff" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
