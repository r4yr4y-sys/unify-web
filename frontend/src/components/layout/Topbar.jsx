import { useEffect, useRef, useState } from 'react'
import { animate, stagger, splitText } from 'animejs'
import { Bell, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IconButton } from '../ui'
import profilePicture from '../../assets/Profile_pic.jpg'

export default function Topbar() {
  const greetingRef = useRef(null)
  const [name, setName] = useState('there')

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return undefined
    let active = true
    const loadProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (response.ok && active) setName(result.user.profile?.name || 'there')
      } catch (_error) {
        // The profile page will show a request error if the API remains unavailable.
      }
    }
    const handleProfileUpdate = (event) => setName(event.detail?.profile?.name || 'there')
    loadProfile()
    window.addEventListener('unify-profile-updated', handleProfileUpdate)
    return () => { active = false; window.removeEventListener('unify-profile-updated', handleProfileUpdate) }
  }, [])

  useEffect(() => {
    const greeting = greetingRef.current
    if (!greeting || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const text = splitText(greeting, { chars: true })
    const animation = animate(text.chars, {
      y: [0, -7, 0],
      rotate: [0, -4, 0],
      duration: 620,
      delay: stagger(50),
      ease: 'outExpo',
    })

    return () => {
      animation.revert()
      text.revert()
    }
  }, [])

  return <header className="topbar"><div className="topbar__welcome"><p>Student workspace</p><span>Stay on top of your semester</span></div><div className="topbar__actions"><button className="search-trigger" type="button"><Search size={18} /><span>Search your workspace</span><kbd>⌘ K</kbd></button><IconButton label="Notifications"><Bell size={19} /></IconButton><span ref={greetingRef} className="topbar__greeting">Hello, {name}!</span><Link className="user-avatar" to="/profile" aria-label="Open profile"><img src={profilePicture} alt="Default profile" /></Link></div></header>
}
