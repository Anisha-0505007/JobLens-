import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import {
  useJobs,
  STATUS,
  LOCATION_TYPE,
} from '../context/JobsContext'
import CompanyLogo from '../components/CompanyLogo'
import {
  MdArrowBack, MdEdit, MdCheck, MdClose,
  MdDelete, MdOpenInNew, MdCalendarToday,
  MdWork, MdBusiness, MdLink, MdNotes,
  MdLocationOn, MdAttachMoney, MdLanguage, MdEvent,
  MdBookmark, MdBookmarkBorder, MdExplore,
} from 'react-icons/md'

/* ── Status config ── */
const STATUS_META = {
  [STATUS.WISHLIST]:  { color: 'var(--text-muted)', bg: 'rgba(160,168,192,0.1)' },
  [STATUS.APPLIED]:   { color: 'var(--blue)',        bg: 'var(--blue-dim)'       },
  [STATUS.INTERVIEW]: { color: 'var(--amber)',       bg: 'var(--amber-dim)'      },
  [STATUS.OFFER]:     { color: 'var(--green)',       bg: 'var(--green-dim)'      },
  [STATUS.REJECTED]:  { color: 'var(--red)',         bg: 'var(--red-dim)'        },
}

const STATUS_OPTIONS = Object.values(STATUS)

const schema = yup.object({
  company: yup.string().trim().required('Required'),
  role:    yup.string().trim().required('Required'),
  status:  yup.string().oneOf(Object.values(STATUS)).required(),
  date:    yup.string().required('Required'),
  interviewDate: yup.string().nullable(),
  location:      yup.string().trim().nullable(),
  locationType:  yup.string().oneOf(Object.values(LOCATION_TYPE)).required(),
  salary:        yup.string().trim().nullable(),
  platform:      yup.string().trim().nullable(),
  link:    yup.string().url('Must be a valid URL').nullable().transform(v => v || null),
  notes:   yup.string().max(500).nullable(),
})

/* ── Sub-components ── */
function DetailField({ icon, label, value, href }) {
  return (
    <div className="detail-field">
      <span className="detail-field__label">
        {icon} {label}
      </span>
      {href
        ? <a className="detail-field__value detail-field__link" href={href} target="_blank" rel="noreferrer">
            {value} <MdOpenInNew size={13} />
          </a>
        : <span className="detail-field__value">{value || <em className="detail-empty">—</em>}</span>
      }
    </div>
  )
}

function EditField({ label, error, children }) {
  return (
    <div className={'form-field' + (error ? ' form-field--error' : '')}>
      <label className="form-label">{label}</label>
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

/* ── Delete modal ── */
function DeleteModal({ company, role, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">Delete Application?</h3>
        <p className="modal-body">
          This will permanently remove <strong>{role}</strong> at <strong>{company}</strong>.
          This cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>
            <MdDelete size={16} /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function JobDetail() {
  const { id }         = useParams()
  const [searchParams] = useSearchParams()
  const { jobs, updateJob, deleteJob, toggleBookmark } = useJobs()
  const navigate       = useNavigate()
  const [editing, setEditing]     = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setEditing(true)
    }
  }, [searchParams])

  const job = jobs.find(j => j.id === id)

  /* ── Edit form ── */
  const {
    register, handleSubmit, reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      company: job?.company || '',
      role:    job?.role || '',
      status:  job?.status || STATUS.WISHLIST,
      date:    job?.date || '',
      interviewDate: job?.interviewDate || '',
      location:      job?.location || '',
      locationType:  job?.locationType || LOCATION_TYPE.REMOTE,
      salary:        job?.salary || '',
      platform:      job?.platform || '',
      link:    job?.link || '',
      notes:   job?.notes || '',
    },
  })

  const watching = watch('status')

  /* Job not found (either invalid ID or just deleted) */
  if (!job) {
    return (
      <div className="page">
        <div className="placeholder-block card">
          <p>Job not found.</p>
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/jobs')}>
            Back to Jobs
          </button>
        </div>
      </div>
    )
  }

  const meta = STATUS_META[job.status]
  const editMeta = STATUS_META[watching || job.status]

  const onSave = (data) => {
    updateJob(id, {
      ...data,
      link:          data.link || '',
      notes:         data.notes || '',
      location:      data.location || '',
      salary:        data.salary || '',
      platform:      data.platform || '',
      interviewDate: data.interviewDate || '',
    })
    toast.success('Application updated!')
    setEditing(false)
  }

  const onDelete = () => {
    deleteJob(id)
    toast.success('Application deleted.')
    navigate('/jobs')
  }

  const cancelEdit = () => { reset(); setEditing(false) }
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="page">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/jobs')}>
          <MdArrowBack /> Jobs
        </button>

        <div className="detail-actions">
          {!editing ? (
            <>
              <button className="btn-ghost detail-delete-btn" onClick={() => setShowDelete(true)}>
                <MdDelete size={16} /> Delete
              </button>
              <button
                className={'btn-ghost' + (job.bookmarked ? ' is-active' : '')}
                onClick={() => toggleBookmark(job.id)}
                title={job.bookmarked ? 'Unbookmark' : 'Bookmark'}
                style={{ color: job.bookmarked ? 'var(--amber)' : 'inherit' }}
              >
                {job.bookmarked ? <MdBookmark size={18} /> : <MdBookmarkBorder size={18} />}
              </button>
              <button className="btn-primary" onClick={() => setEditing(true)}>
                <MdEdit size={16} /> Edit
              </button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={cancelEdit}>
                <MdClose size={16} /> Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit(onSave)}
                disabled={!isDirty}
              >
                <MdCheck size={16} /> Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div className="detail-layout">
        {/* ── Left: main content ── */}
        <div className="detail-main">

          {/* Hero card */}
          <div className="card detail-hero">
            <CompanyLogo company={editing ? watch('company') || job.company : job.company} size={52} />
            {!editing ? (
              <div>
                <h2 className="detail-company">{job.company}</h2>
                <p className="detail-role">{job.role}</p>
              </div>
            ) : (
              <div className="detail-hero-inputs">
                <EditField label="Company" error={errors.company?.message}>
                  <div className="input-wrap">
                    <MdBusiness className="input-icon" />
                    <input className="form-input" {...register('company')} />
                  </div>
                </EditField>
                <EditField label="Role" error={errors.role?.message}>
                  <div className="input-wrap">
                    <MdWork className="input-icon" />
                    <input className="form-input" {...register('role')} />
                  </div>
                </EditField>
              </div>
            )}
            {!editing && (
              <span className="status-badge detail-status-badge" style={{ color: meta.color, background: meta.bg }}>
                {job.status}
              </span>
            )}
          </div>

          {/* Details card */}
          {!editing ? (
            <div className="card detail-fields">
              <div className="detail-fields-grid">
                <DetailField icon={<MdWork size={14}/>}         label="Role"         value={job.role} />
                <DetailField icon={<MdCalendarToday size={14}/>} label="Date Applied" value={new Date(job.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                <DetailField icon={<MdLocationOn size={14}/>}    label="Location"     value={job.location} />
                <DetailField icon={<MdExplore size={14}/>}       label="Type"         value={job.locationType} />
                <DetailField icon={<MdAttachMoney size={14}/>}   label="Salary Range" value={job.salary} />
                <DetailField icon={<MdLanguage size={14}/>}      label="Platform"     value={job.platform} />
                <DetailField icon={<MdEvent size={14}/>}         label="Interview"    value={job.interviewDate ? new Date(job.interviewDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} />
                <DetailField
                  icon={<MdLink size={14}/>}
                  label="Job Posting"
                  value={job.link ? 'Open link' : null}
                  href={job.link || null}
                />
              </div>
              <DetailField icon={<MdNotes size={14}/>} label="Notes" value={job.notes} />
            </div>
          ) : (
            <div className="card detail-fields">
              <div className="form-row">
                <EditField label="Status" error={errors.status?.message}>
                  <div className="input-wrap">
                    <span className="input-icon input-icon--dot" style={{ background: editMeta?.color }} />
                    <select className="form-input form-select" {...register('status')}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </EditField>
                <EditField label="Date Applied" error={errors.date?.message}>
                  <div className="input-wrap">
                    <MdCalendarToday className="input-icon" />
                    <input type="date" className="form-input" max={today} {...register('date')} />
                  </div>
                </EditField>
              </div>

              <div className="form-row">
                <EditField label="Location (City/Office)" error={errors.location?.message}>
                  <div className="input-wrap">
                    <MdLocationOn className="input-icon" />
                    <input className="form-input" {...register('location')} placeholder="e.g. Remote" />
                  </div>
                </EditField>
                <EditField label="Location Type" error={errors.locationType?.message}>
                  <div className="input-wrap">
                    <MdExplore className="input-icon" />
                    <select className="form-input form-select" {...register('locationType')}>
                      {Object.values(LOCATION_TYPE).map(lt => <option key={lt} value={lt}>{lt}</option>)}
                    </select>
                  </div>
                </EditField>
              </div>

              <div className="form-row">
                <EditField label="Application Platform" error={errors.platform?.message}>
                  <div className="input-wrap">
                    <MdLanguage className="input-icon" />
                    <input className="form-input" {...register('platform')} placeholder="e.g. LinkedIn" />
                  </div>
                </EditField>
                <EditField label="Interview Date" error={errors.interviewDate?.message}>
                  <div className="input-wrap">
                    <MdEvent className="input-icon" />
                    <input type="date" className="form-input" {...register('interviewDate')} />
                  </div>
                </EditField>
              </div>

              <EditField label="Job Posting URL" error={errors.link?.message}>
                <div className="input-wrap">
                  <MdLink className="input-icon" />
                  <input type="url" className="form-input" placeholder="https://..." {...register('link')} />
                </div>
              </EditField>
              <EditField label="Notes" error={errors.notes?.message}>
                <div className="input-wrap input-wrap--textarea">
                  <MdNotes className="input-icon input-icon--textarea" />
                  <textarea className="form-input form-textarea" rows={4} {...register('notes')} />
                </div>
              </EditField>
            </div>
          )}
        </div>

        {/* ── Right: sidebar ── */}
        <aside className="detail-sidebar">
          <div className="card detail-meta-card">
            <p className="detail-meta-label">Status</p>
            <span className="status-badge" style={{ color: meta.color, background: meta.bg, fontSize: 13 }}>
              {job.status}
            </span>

            <p className="detail-meta-label" style={{ marginTop: 18 }}>Applied</p>
            <span className="detail-meta-value">
              {new Date(job.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>

            {job.link && (
              <>
                <p className="detail-meta-label" style={{ marginTop: 18 }}>Posting</p>
                <a href={job.link} target="_blank" rel="noreferrer" className="detail-link-btn">
                  View Job <MdOpenInNew size={13} />
                </a>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Delete modal */}
      {showDelete && (
        <DeleteModal
          company={job.company}
          role={job.role}
          onConfirm={onDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  )
}
