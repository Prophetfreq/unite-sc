import { useEffect, useRef } from 'react'

// Subsplash embedded signup form — values pulled from the dashboard embed snippet.
const FORM_PATH = 'u/-3C6262/forms/d/cbfa9dab-16be-4dbd-a29e-16efc91bffcd?embed=1'
const SUBSPLASH_ORIGIN = 'https://subsplash.com'
const EMBED_SCRIPT_SRC =
  'https://dashboard.static.subsplash.com/production/web-client/external/embed-1.1.0.js'

// The form can render in more than one place (navbar modal + contact section),
// so each instance needs its own target id for subsplashEmbed to aim at.
let instanceCounter = 0

// Loads Subsplash's embed loader and renders the signup form.
// Mirrors the official dashboard snippet: load embed-1.1.0.js, then call
// window.subsplashEmbed(path, origin, targetElementId). The Subsplash loader
// *replaces* the target node with its iframe, so we hand it a node we create
// imperatively inside a React-owned wrapper — that way React never tracks the
// node Subsplash mutates, and unmount/remount stays clean.
export default function SubsplashUpdatesForm({ active = true }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const wrapper = containerRef.current
    if (!wrapper) return

    const targetId = `subsplash-embed-form-cbfa9dab-16be-4dbd-a29e-16efc91bffcd-${++instanceCounter}`
    const target = document.createElement('div')
    target.id = targetId
    target.style.minHeight = '360px'
    wrapper.appendChild(target)

    const renderForm = () => {
      if (typeof window.subsplashEmbed === 'function') {
        window.subsplashEmbed(FORM_PATH, SUBSPLASH_ORIGIN, targetId)
      }
    }

    let scriptListener = null
    if (typeof window.subsplashEmbed === 'function') {
      renderForm()
    } else {
      const existing = document.querySelector(`script[src="${EMBED_SCRIPT_SRC}"]`)
      if (existing) {
        scriptListener = renderForm
        existing.addEventListener('load', renderForm)
      } else {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = EMBED_SCRIPT_SRC
        script.onload = renderForm
        document.body.appendChild(script)
      }
    }

    return () => {
      if (scriptListener) {
        const existing = document.querySelector(`script[src="${EMBED_SCRIPT_SRC}"]`)
        existing?.removeEventListener('load', scriptListener)
      }
      // Clear whatever Subsplash left behind so a remount starts fresh.
      wrapper.replaceChildren()
    }
  }, [active])

  return <div ref={containerRef} className="min-h-[360px]" />
}
