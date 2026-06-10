import { motion } from 'framer-motion'
import SubsplashUpdatesForm from './SubsplashUpdatesForm.jsx'

// The contact section is the Subsplash mailing-list signup. The old
// "Reach out" form (Supabase contacts + Formspree) was removed 2026-06-10 —
// the mailing list in Subsplash is the single point of contact now.
export default function ContactForm() {
  return (
    <section id="contact" className="px-6 md:px-16 py-24 bg-[#F5F0E8]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-2xl mx-auto"
      >
        <p className="font-mono text-[#4A7A62] text-xs tracking-widest uppercase mb-4">
          Stay connected
        </p>
        <h2 className="text-[#1C3A2A] font-bold text-3xl md:text-5xl tracking-tight leading-tight mb-4">
          Get
          <span className="font-display italic text-[#C4572B]"> updates.</span>
        </h2>
        <p className="text-[#2E5240]/70 text-base md:text-lg leading-relaxed mb-10 max-w-lg">
          Sign up to receive prayer points and updates as we carry this mandate across all 46 counties.
        </p>
        <div className="bg-white border border-[#1C3A2A]/10 rounded-4xl p-6 md:p-8 shadow-sm">
          <SubsplashUpdatesForm />
        </div>
      </motion.div>
    </section>
  )
}
