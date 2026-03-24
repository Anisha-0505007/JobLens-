import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  MdDashboard,
  MdWork,
  MdBarChart,
  MdAdd,
  MdLocationOn,
  MdSchool,
  MdDescription
} from 'react-icons/md'

const navItems = [
  { to: '/', label: 'Dashboard', icon: <MdDashboard /> },
  { to: '/jobs', label: 'Jobs', icon: <MdWork /> },
  { to: '/analytics', label: 'Analytics', icon: <MdBarChart /> },
]

export default function Navbar() {
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef()

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="navbar">
      {/* ── Logo ── */}
      <NavLink to="/" className="navbar__logo">
        <img
          src="/logo.png"
          alt="JobLens logo"
          className="navbar__logo-img"
        />
        <span className="navbar__logo-wordmark">
          Job<em>Lens</em>
        </span>
      </NavLink>

      <div className="navbar__divider" />

      {/* ── Nav links — LinkedIn column-style ── */}
      <ul className="navbar__nav">
        {navItems.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                'navbar__link' + (isActive ? ' active' : '')
              }
            >
              {icon}
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* ── Actions ── */}
      <div className="navbar__actions">
        <button
          className="btn-add"
          onClick={() => navigate('/jobs/new')}
        >
          <MdAdd size={16} />
          Add Job
        </button>

        <div className="navbar__user" ref={profileRef}>
          <div
            className="navbar__avatar"
            title="Profile"
            onClick={() => setShowProfile(!showProfile)}
          >
            AG
          </div>

          {showProfile && (
            <div className="profile-dropdown card">
              <div className="profile-header">
                <div className="profile-avatar-large">AG</div>
                <div className="profile-info">
                  <h4>Anisha Ghosh</h4>
                  <p>JobLens User</p>
                </div>
              </div>
              <div className="profile-body">
                <div className="profile-item">
                  <MdWork size={16} className="text-muted" />
                  <span><strong>Working:</strong> Frontend Engineer at TechCorp</span>
                </div>
                <div className="profile-item">
                  <MdLocationOn size={16} className="text-muted" />
                  <span><strong>Address:</strong> San Francisco, CA</span>
                </div>
                <div className="profile-item">
                  <MdSchool size={16} className="text-muted" />
                  <span><strong>Education:</strong> B.S. Computer Science</span>
                </div>
              </div>
              <div className="profile-footer">
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowProfile(false)}>
                  <MdDescription size={16} /> View Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
