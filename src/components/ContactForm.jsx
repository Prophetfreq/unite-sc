import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabase'
import { SC_COUNTIES } from '../data/scCounties'

const FORMSPREE_ENDPOINT =
  import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/mpqkplga'

const inputClass =
  'w-full bg-[#1C3A2A] border border-[#2E5240] rounded-2xl px-4 py-3 text-[#E8DCC8] text-sm placeholder-[#E8DCC8]/35 focus:outline-none focus:border-[#C4572B]/60 focus:ring-2 focus:ring-[#C4572B]/15 transition-colors'

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    county: '',
    website: '',
  })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      county: form.county,
      website: form.website.trim() || null,
    }

    const [dbResult, emailResult] = await Promise.allSettled([
      supabase.from('contacts').insert(payload),
      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      }),
    ])

    const dbOk = dbResult.status === 'fulfilled' && !dbResult.value?.error
    const emailOk = emailResult.status === 'fulfilled' && emailResult.value?.ok

    if (!dbOk && !emailOk) {
      const reason =
        dbResult.value?.error?.message ||
        (dbResult.status === 'rejected' && dbResult.reason?.message) ||
        'Something went wrong. Please try again or email us directly.'
      setStatus('error')
      setError(reason)
      return
    }

    setStatus('sent')
  }

  return (
    <section id="contact" className="px-6 md:px-16 py-24 bg-[#1C3A2A]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-2xl mx-auto"
      >
        <div className="w-8 h-px bg-[#C4572B] mb-6" />
        <h2 className="font-display italic text-[#E8DCC8] text-3xl md:text-4xl leading-tight mb-3">
          Reach out if interested.
        </h2>
        <p className="text-[#E8DCC8]/60 text-sm md:text-base mb-10 max-w-lg">
          If this mandate stirs something in you, leave your details and Reuben &amp; Grace will be in touch.
        </p>

        {status === 'sent' ? (
          <div className="border border-[#2E5240] rounded-4xl p-8 md:p-10 text-center">
            <div className="w-8 h-px bg-[#C4572B] mx-auto mb-5" />
            <p className="font-display italic text-[#E8DCC8] text-xl md:text-2xl leading-relaxed">
              Thanks — we received your message. We&apos;ll be in touch soon.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="border border-[#2E5240] rounded-4xl p-6 md:p-8 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Name" required>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={update('name')}
                  className={inputClass}
                  autoComplete="name"
                  placeholder="Your name"
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={update('email')}
                  className={inputClass}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Phone" required>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={update('phone')}
                  className={inputClass}
                  autoComplete="tel"
                  placeholder="(555) 555-5555"
                />
              </Field>
              <Field label="County" required>
                <select
                  required
                  value={form.county}
                  onChange={update('county')}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="" disabled>Select your county</option>
                  {SC_COUNTIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Website (optional)">
              <input
                type="url"
                value={form.website}
                onChange={update('website')}
                className={inputClass}
                autoComplete="url"
                placeholder="https://"
              />
            </Field>

            {error && (
              <p className="text-[#C4572B] text-xs font-mono">{error}</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#C4572B] text-[#F5F0E8] text-sm font-semibold tracking-wide hover:bg-[#B04E26] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </motion.div>
    </section>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-[#E8DCC8]/70 text-[11px] uppercase tracking-[0.14em] mb-2">
        {label}
        {required && <span className="text-[#C4572B] ml-1">*</span>}
      </span>
      {children}
    </label>
  )
}
