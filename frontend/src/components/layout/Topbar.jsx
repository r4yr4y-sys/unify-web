import { useEffect, useRef } from 'react'
import { animate, stagger, splitText } from 'animejs'
import { Bell, Search } from 'lucide-react'
import { IconButton } from '../ui'

export default function Topbar() {
  const greetingRef = useRef(null)

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

  return <header className="topbar"><div className="topbar__welcome"><p>Student workspace</p><span>Stay on top of your semester</span></div><div className="topbar__actions"><button className="search-trigger" type="button"><Search size={18} /><span>Search your workspace</span><kbd>⌘ K</kbd></button><IconButton label="Notifications"><Bell size={19} /></IconButton><span ref={greetingRef} className="topbar__greeting">Hello, Jayed!</span><button className="user-avatar" type="button" aria-label="Open profile">JS</button></div></header>
}
