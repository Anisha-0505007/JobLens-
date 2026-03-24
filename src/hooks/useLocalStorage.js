import { useState, useEffect } from 'react'

/**
 * useLocalStorage
 * Drop-in replacement for useState that syncs with localStorage.
 *
 * @param {string} key       - localStorage key
 * @param {*}      initial   - default value if nothing is stored yet
 */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage quota exceeded or private mode — silently ignore
    }
  }, [key, value])

  return [value, setValue]
}
