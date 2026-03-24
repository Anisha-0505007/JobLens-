import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  useJobs,
  STATUS,
  LOCATION_TYPE,
} from '../context/JobsContext'
import {
  MdBusiness,
  MdWork,
  MdCalendarToday,
  MdLink,
  MdNotes,
  MdArrowBack,
  MdCheck,
  MdLocationOn,
  MdAttachMoney,
  MdLanguage,
  MdExplore,
  MdEvent,
} from 'react-icons/md'

/* ── Validation schema ── */
const schema = yup.object({
  company:  yup.string().trim().required('Company name is required'),
  role:     yup.string().trim().required('Job role is required'),
  status:   yup.string().oneOf(Object.values(STATUS)).required(),
  date:          yup.string().required('Application date is required'),
  interviewDate: yup.string().nullable(),
  location:      yup.string().trim().nullable(),
  locationType:  yup.string().oneOf(Object.values(LOCATION_TYPE)).required(),
  salary:        yup.string().trim().nullable(),
  platform:      yup.string().trim().nullable(),
  link:          yup.string().url('Must be a valid URL').nullable().transform(v => v || null),
  notes:         yup.string().max(500, 'Max 500 characters').nullable(),
})

const STATUS_OPTIONS = [
  { value: STATUS.WISHLIST,  label: '🔖  Wishlist',   color: 'var(--text-muted)' },
  { value: STATUS.APPLIED,   label: '📨  Applied',    color: 'var(--blue)'       },
  { value: STATUS.INTERVIEW, label: '🎯  Interview',  color: 'var(--amber)'      },
  { value: STATUS.OFFER,     label: '🌟  Offer',      color: 'var(--green)'      },
  { value: STATUS.REJECTED,  label: '✖   Rejected',   color: 'var(--red)'        },
]

function Field({ label, error, required, children }) {
  return (
    <div className={'form-field' + (error ? ' form-field--error' : '')}>
      <label className="form-label">
        {label}
        {required && <span className="form-required">*</span>}
      </label>
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

export default function AddJob() {
  const { addJob } = useJobs()
  const navigate   = useNavigate()
  const today      = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      status:        STATUS.APPLIED,
      date:          today,
      interviewDate: '',
      location:      '',
      locationType:  LOCATION_TYPE.REMOTE,
      salary:        '',
      platform:      '',
    },
  })

  const selectedStatus = watch('status')
  const statusMeta = STATUS_OPTIONS.find(o => o.value === selectedStatus)

  const onSubmit = async (data) => {
    const logo = (data.company.trim()[0] || '?').toUpperCase()
    addJob({
      ...data,
      logo,
      link:          data.link || '',
      notes:         data.notes || '',
      location:      data.location || '',
      salary:        data.salary || '',
      platform:      data.platform || '',
      interviewDate: data.interviewDate || '',
    })
    toast.success(`"${data.role}" at ${data.company} added!`)
    navigate('/jobs')
  }

  return (
    <div className="page">
      <div className="page-header addJob-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <MdArrowBack /> Back
        </button>
        <div>
          <h1 className="page-title">Add Job Application</h1>
          <p className="page-subtitle">Track a new role you're pursuing</p>
        </div>
      </div>

      <div className="addJob-layout">
        {/* ── Form card ── */}
        <form className="card addJob-form" onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Row 1: Company + Role */}
          <div className="form-row">
            <Field label="Company" required error={errors.company?.message}>
              <div className="input-wrap">
                <MdBusiness className="input-icon" />
                <input
                  className="form-input"
                  placeholder="e.g. Google, Stripe, Notion"
                  {...register('company')}
                />
              </div>
            </Field>
            <Field label="Job Role" required error={errors.role?.message}>
              <div className="input-wrap">
                <MdWork className="input-icon" />
                <input
                  className="form-input"
                  placeholder="e.g. Frontend Engineer"
                  {...register('role')}
                />
              </div>
            </Field>
          </div>

          {/* Row 2: Status + Date */}
          <div className="form-row">
            <Field label="Status" required error={errors.status?.message}>
              <div className="input-wrap">
                <span
                  className="input-icon input-icon--dot"
                  style={{ background: statusMeta?.color }}
                />
                <select className="form-input form-select" {...register('status')}>
                  {STATUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="Date Applied" required error={errors.date?.message}>
              <div className="input-wrap">
                <MdCalendarToday className="input-icon" />
                <input
                  type="date"
                  className="form-input"
                  max={today}
                  {...register('date')}
                />
              </div>
            </Field>
          </div>

          {/* Row 3: Location + Salary */}
          <div className="form-row">
            <Field label="Location (City/Office)" error={errors.location?.message}>
              <div className="input-wrap">
                <MdLocationOn className="input-icon" />
                <input
                  className="form-input"
                  placeholder="e.g. New York, NY"
                  {...register('location')}
                />
              </div>
            </Field>
            <Field label="Location Type" required error={errors.locationType?.message}>
              <div className="input-wrap">
                <MdExplore className="input-icon" />
                <select className="form-input form-select" {...register('locationType')}>
                  {Object.values(LOCATION_TYPE).map(lt => (
                    <option key={lt} value={lt}>{lt}</option>
                  ))}
                </select>
              </div>
            </Field>
          </div>

          <div className="form-row">
            <Field label="Salary Range" error={errors.salary?.message}>
              <div className="input-wrap">
                <MdAttachMoney className="input-icon" />
                <input
                  className="form-input"
                  placeholder="e.g. $120k - $150k"
                  {...register('salary')}
                />
              </div>
            </Field>
            <Field label="Application Platform" error={errors.platform?.message}>
              <div className="input-wrap">
                <MdLanguage className="input-icon" />
                <input
                  className="form-input"
                  placeholder="e.g. LinkedIn, Referral"
                  {...register('platform')}
                />
              </div>
            </Field>
          </div>

          {/* Job URL */}
          <Field label="Job Posting URL" error={errors.link?.message}>
            <div className="input-wrap">
              <MdLink className="input-icon" />
              <input
                type="url"
                className="form-input"
                placeholder="https://..."
                {...register('link')}
              />
            </div>
          </Field>

          {/* Notes */}
          <Field label="Notes" error={errors.notes?.message}>
            <div className="input-wrap input-wrap--textarea">
              <MdNotes className="input-icon input-icon--textarea" />
              <textarea
                className="form-input form-textarea"
                placeholder="Recruiter name, salary range, anything worth noting..."
                rows={4}
                {...register('notes')}
              />
            </div>
          </Field>

          {/* Submit */}
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              <MdCheck size={17} />
              {isSubmitting ? 'Saving…' : 'Save Application'}
            </button>
          </div>
        </form>

        {/* ── Side tip card ── */}
        <aside className="addJob-tips card">
          <h3 className="tips-title">💡 Tips</h3>
          <ul className="tips-list">
            <li>Use <strong>Wishlist</strong> for roles you want to apply to later.</li>
            <li>Add the job posting URL so you can revisit requirements.</li>
            <li>Note the recruiter's name and any salary info upfront.</li>
            <li>Update the status as you progress through stages.</li>
          </ul>

          <div className="tips-status-legend">
            <p className="tips-legend-title">Status guide</p>
            {STATUS_OPTIONS.map(o => (
              <div key={o.value} className="tips-status-row">
                <span className="tips-dot" style={{ background: o.color }} />
                <span>{o.label.replace(/^[^ ]+ +/, '')}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
