import { createContext, useContext, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const JobsContext = createContext(null)

export const STATUS = {
  WISHLIST:    'Wishlist',
  APPLIED:     'Applied',
  INTERVIEW:   'Interview',
  OFFER:       'Offer',
  REJECTED:    'Rejected',
}

export const LOCATION_TYPE = {
  REMOTE:  'Remote',
  HYBRID:  'Hybrid',
  ONSITE:  'On-site',
}

const MOCK_JOBS = [
  { id: '1',  company: 'Google',      domain: 'google.com',     role: 'Senior Software Engineer',    status: STATUS.INTERVIEW, date: '2026-03-22', link: 'https://google.com/careers', notes: 'Preparing for system design.',     logo: 'G', bookmarked: true,  location: 'Mountain View, CA', locationType: LOCATION_TYPE.ONSITE,  salary: '$180k - $240k', platform: 'LinkedIn',  interviewDate: '2026-03-28' },
  { id: '2',  company: 'Meta',        domain: 'meta.com',       role: 'Product Designer',            status: STATUS.APPLIED,   date: '2026-03-20', link: 'https://metacareers.com',    notes: 'Portfolio submitted.',            logo: 'M', bookmarked: false, location: 'Menlo Park, CA',    locationType: LOCATION_TYPE.HYBRID,  salary: '$160k - $210k', platform: 'Referral',  interviewDate: '' },
  { id: '3',  company: 'Netflix',     domain: 'netflix.com',    role: 'Senior UI Engineer',          status: STATUS.OFFER,     date: '2026-03-18', link: 'https://netflix.com/jobs',    notes: 'Received competitive offer!',     logo: 'N', bookmarked: true,  location: 'Los Gatos, CA',     locationType: LOCATION_TYPE.ONSITE,  salary: '$450k (Base)',  platform: 'LinkedIn',  interviewDate: '' },
  { id: '4',  company: 'Stripe',      domain: 'stripe.com',     role: 'Backend Developer',           status: STATUS.REJECTED,  date: '2026-03-15', link: 'https://stripe.com/jobs',     notes: 'Rejected after final round.',      logo: 'S', bookmarked: false, location: 'Remote',            locationType: LOCATION_TYPE.REMOTE,  salary: '$170k - $220k', platform: 'Wellfound', interviewDate: '' },
  { id: '5',  company: 'Vercel',      domain: 'vercel.com',     role: 'React Developer',             status: STATUS.WISHLIST,  date: '2026-03-12', link: 'https://vercel.com/careers', notes: 'Dream company!',                  logo: 'V', bookmarked: true,  location: 'Remote',            locationType: LOCATION_TYPE.REMOTE,  salary: '$140k - $190k', platform: 'Direct',    interviewDate: '' },
  { id: '6',  company: 'GitLab',      domain: 'gitlab.com',     role: 'DevOps Engineer',             status: STATUS.APPLIED,   date: '2026-03-10', link: 'https://about.gitlab.com',   notes: 'Remote-first culture.',           logo: 'G', bookmarked: false, location: 'Remote',            locationType: LOCATION_TYPE.REMOTE,  salary: '$150k - $190k', platform: 'Wellfound', interviewDate: '' },
  { id: '7',  company: 'Zapier',      domain: 'zapier.com',     role: 'Frontend Developer',          status: STATUS.INTERVIEW, date: '2026-03-08', link: 'https://zapier.com/jobs',     notes: 'Values-based interview.',         logo: 'Z', bookmarked: false, location: 'Remote',            locationType: LOCATION_TYPE.REMOTE,  salary: '$130k - $160k', platform: 'LinkedIn',  interviewDate: '2026-03-25' },
  { id: '8',  company: 'Airbnb',      domain: 'airbnb.com',     role: 'Data Scientist',              status: STATUS.WISHLIST,  date: '2026-03-05', link: 'https://airbnb.com/careers', notes: 'Checking for team match.',          logo: 'A', bookmarked: false, location: 'San Francisco, CA', locationType: LOCATION_TYPE.HYBRID,  salary: '$170k - $230k', platform: 'Direct',    interviewDate: '' },
  { id: '9',  company: 'Spotify',     domain: 'spotify.com',    role: 'Product Manager',             status: STATUS.APPLIED,   date: '2026-03-02', link: 'https://spotify.com/jobs',   notes: 'Applied for growth team.',        logo: 'S', bookmarked: false, location: 'New York, NY',      locationType: LOCATION_TYPE.ONSITE,  salary: '$155k - $200k', platform: 'LinkedIn',  interviewDate: '' },
  { id: '10', company: 'Slack',       domain: 'slack.com',      role: 'Security Researcher',         status: STATUS.OFFER,     date: '2026-02-28', link: 'https://slack.com/careers',  notes: 'Offer under negotiation.',        logo: 'S', bookmarked: true,  location: 'Remote',            locationType: LOCATION_TYPE.REMOTE,  salary: '$180k+',        platform: 'Referral',  interviewDate: '' },
  { id: '11', company: 'Notion',      domain: 'notion.so',      role: 'Full Stack Developer',        status: STATUS.INTERVIEW, date: '2026-02-25', link: 'https://notion.so/careers',   notes: 'Technical test pending.',         logo: 'N', bookmarked: false, location: 'San Francisco, CA', locationType: LOCATION_TYPE.ONSITE,  salary: '$165k - $210k', platform: 'LinkedIn',  interviewDate: '2026-03-27' },
  { id: '12', company: 'Linear',      domain: 'linear.app',     role: 'UI Designer',                 status: STATUS.APPLIED,   date: '2026-02-22', link: 'https://linear.app/jobs',    notes: 'Amazing craft focused team.',     logo: 'L', bookmarked: true,  location: 'Remote',            locationType: LOCATION_TYPE.REMOTE,  salary: '$140k - $180k', platform: 'Direct',    interviewDate: '' },
  { id: '13', company: 'Palantir',    domain: 'palantir.com',   role: 'Forward Deployed Engineer',   status: STATUS.REJECTED,  date: '2026-02-20', link: 'https://palantir.com/jobs',  notes: 'Deep tech focus.',                logo: 'P', bookmarked: false, location: 'London, UK',        locationType: LOCATION_TYPE.ONSITE,  salary: '£120k - £160k', platform: 'Indeed',    interviewDate: '' },
  { id: '14', company: 'Datadog',     domain: 'datadog.com',    role: 'Site Reliability Engineer',   status: STATUS.WISHLIST,  date: '2026-02-18', link: 'https://datadog.com/jobs',   notes: 'Infrastructure monitoring.',      logo: 'D', bookmarked: false, location: 'Remote',            locationType: LOCATION_TYPE.REMOTE,  salary: '$160k - $200k', platform: 'LinkedIn',  interviewDate: '' },
  { id: '15', company: 'Cloudflare',  domain: 'cloudflare.com', role: 'Systems Engineer',            status: STATUS.APPLIED,   date: '2026-02-15', link: 'https://cloudflare.com/jobs', notes: 'Edge computing focus.',          logo: 'C', bookmarked: false, location: 'Austin, TX',        locationType: LOCATION_TYPE.HYBRID,  salary: '$150k - $190k', platform: 'Direct',    interviewDate: '' },
]

export function JobsProvider({ children }) {
  // v6: Added location, platform, salary, and interviewDate to the tracking model
  const [jobs, setJobs] = useLocalStorage('joblens_jobs_v6', MOCK_JOBS)

  const addJob = (job) =>
    setJobs((prev) => [{ ...job, id: Date.now().toString(), bookmarked: false }, ...prev])

  const updateJob = (id, updates) =>
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)))

  const deleteJob = (id) =>
    setJobs((prev) => prev.filter((j) => j.id !== id))

  const toggleBookmark = (id) =>
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, bookmarked: !j.bookmarked } : j)))

  const stats = {
    total:     jobs.length,
    wishlist:  jobs.filter((j) => j.status === STATUS.WISHLIST).length,
    applied:   jobs.filter((j) => j.status === STATUS.APPLIED).length,
    interview: jobs.filter((j) => j.status === STATUS.INTERVIEW).length,
    offer:     jobs.filter((j) => j.status === STATUS.OFFER).length,
    rejected:  jobs.filter((j) => j.status === STATUS.REJECTED).length,
  }

  return (
    <JobsContext.Provider value={{ jobs, addJob, updateJob, deleteJob, toggleBookmark, stats }}>
      {children}
    </JobsContext.Provider>
  )
}

export const useJobs = () => useContext(JobsContext)
