import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import SubsplashUpdatesForm from './SubsplashUpdatesForm.jsx'

export default function UpdatesModal({ isOpen, onClose }) {
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

            <SubsplashUpdatesForm active={isOpen} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
