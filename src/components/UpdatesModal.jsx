import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'

// Subsplash embedded signup form — values pulled from the dashboard embed snippet.
const FORM_TARGET_ID = 'subsplash-embed-form-cbfa9dab-16be-4dbd-a29e-16efc91bffcd'
const FORM_PATH = 'u/-3C6262/forms/d/cbfa9dab-16be-4dbd-a29e-16efc91bffcd?embed=1'
const SUBSPLASH_ORIGIN = 'https://subsplash.com'
const EMBED_SCRIPT_SRC =
  'https://dashboard.static.subsplash.com/production/web-client/external/embed-1.1.0.js'

export default function UpdatesModal({ isOpen, onClose }) {
  const containerRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Lock body scroll while the modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Load Subsplash's embed loader and render the form into the modal.
  // Mirrors the official dashboard snippet: load embed-1.1.0.js, then call
  // window.subsplashEmbed(path, origin, targetElementId). The Subsplash loader
  // *replaces* the target node with its iframe, so we hand it a node we create
  // imperatively inside a React-owned wrapper — that way React never tracks the
  // node Subsplash mutates, and unmount/reopen stays clean.
  useEffect(() => {
    if (!isOpen) return
    const wrapper = containerRef.current
    if (!wrapper) return

    const target = document.createElement('div')
    target.id = FORM_TARGET_ID
    target.style.minHeight = '360px'
    wrapper.appendChild(target)

    const renderForm = () => {
      if (typeof window.subsplashEmbed === 'function') {
        window.subsplashEmbed(FORM_PATH, SUBSPLASH_ORIGIN, FORM_TARGET_ID)
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
      // Clear whatever Subsplash left behind so a reopen starts fresh.
      wrapper.replaceChildren()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[200] bg-[#0A1A10]/75 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 18, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className="bg-[#F5F0E8] rounded-4xl p-7 md:p-8 max-w-lg w-full shadow-[0_32px_64px_-12px_rgba(10,26,16,0.45)] max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Sign up for updates"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="font-mono text-[#4A7A62] text-xs tracking-widest uppercase mb-2">
                  Stay connected
                </p>
                <h3 className="text-[#1C3A2A] font-bold text-2xl md:text-3xl tracking-tight leading-tight">
                  Follow the <span className="font-display italic text-[#C4572B]">journey.</span>
                </h3>
                <p className="text-[#2E5240]/70 text-sm leading-relaxed mt-3 max-w-sm">
                  Get prayer points and updates as we carry this mandate across all 46 counties.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1C3A2A]/15 text-[#6B6B5A] hover:bg-[#1C3A2A]/8 transition-colors flex-shrink-0 mt-1"
              >
                <X size={14} weight="bold" />
              </button>
            </div>

            {/* Subsplash embedded form renders into a node we create imperatively
                inside this React-owned wrapper (see effect above). */}
            <div ref={containerRef} className="min-h-[360px]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
