import { useState } from 'react'

// Deterministic color per company name
const COLORS = [
  ['#6c63ff', 'rgba(108,99,255,0.15)'],
  ['#0A84FF', 'rgba(10,132,255,0.15)'],
  ['#00d4aa', 'rgba(0,212,170,0.15)'],
  ['#f59e0b', 'rgba(245,158,11,0.15)'],
  ['#ef4444', 'rgba(239,68,68,0.15)'],
  ['#ec4899', 'rgba(236,72,153,0.15)'],
  ['#22c55e', 'rgba(34,197,94,0.15)'],
  ['#f97316', 'rgba(249,115,22,0.15)'],
]

function pickColor(name = '') {
  const letter = name.trim()[0]?.toLowerCase() ?? 'a'
  const position = letter.charCodeAt(0) - 97
  return COLORS[Math.abs(position) % COLORS.length]
}

function getDomain(company = '') {
  // Simple heuristic: clean name and add .com
  const clean = company.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim()
  if (!clean) return null
  return `${clean}.com`
}

export default function CompanyLogo({ company = '', domain: explicitDomain = '', size = 32, className = '' }) {
  const [imgError, setImgError] = useState(false)
  
  // Use explicit domain if provided, otherwise guess from company name
  const domain = (explicitDomain || getDomain(company))?.toLowerCase()
  const logoUrl = domain && !imgError ? `https://logos.hunter.io/${domain}` : null

  const letter = (company.trim()[0] ?? '?').toUpperCase()
  const [color, bg] = pickColor(company.toLowerCase())

  return (
    <div
      className={`company-logo ${className} ${logoUrl ? 'has-img' : ''}`}
      style={{
        '--logo-size': `${size}px`,
        '--logo-color': color,
        '--logo-bg': bg,
        fontSize: size * 0.38,
        overflow: 'hidden', // Ensure logo doesn't bleed
      }}
      title={company}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={company}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
        />
      ) : (
        letter
      )}
    </div>
  )
}
