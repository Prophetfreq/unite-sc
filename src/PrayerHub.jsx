import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, FileText, ArrowUpRight, ArrowLeft, NavigationArrow, BookOpen, Warning, UsersThree } from '@phosphor-icons/react'

// ─── Region colors (matches the homepage map) ────────────────────────────────
const REGION_COLORS = {
  Midlands:   '#2E5240',
  Lowcountry: '#4A7A62',
  'Pee Dee':  '#8A7355',
  Upstate:    '#C4572B',
}

// ─── Shared on-site instructions ─────────────────────────────────────────────
// One set of steps for EVERY assignment. Edit here and it updates everywhere.
const HOW_TO_STEPS = [
  {
    title: 'We pray together',
    body: 'One group, one voice. We move through the stops as a team — never on our own.',
  },
  {
    title: 'Follow the leaders’ direction',
    body: 'When the team gathers, the Unite SC leaders give the instructions and show how each stop is prayed. Nothing happens ahead of their word.',
  },
  {
    title: 'Pray on-site — when the instruction is given',
    body: 'On the leaders’ word, pray over the place out loud together, using the prayer focus in the guide for that stop.',
  },
  {
    title: 'Mark it when it’s done — when the instruction is given',
    body: 'When the leaders say a stop is covered, mark it done so we can track the whole route together.',
  },
]

// ─── The active assignment ───────────────────────────────────────────────────
// This is the ONE assignment people see. To run a new week, replace this object:
//   - edit title / subtitle / region
//   - point `guide` at the new PDF in /public/prayer/
//   - replace the `stops` list (gps gives a precise directions pin; omit to use address)
const ASSIGNMENT = {
  eyebrow: 'Unity Assignment',
  title: 'Edgefield County',
  subtitle: 'Downtown out to Horn’s Creek',
  region: 'Midlands',
  guide: '/prayer/edgefield-unity-assignment.pdf',
  stops: [
    {
      id: 'town-square',
      name: 'Edgefield Town Square & Courthouse Square',
      address: 'Town Square, Edgefield, SC 29824',
      gps: '33.78945,-81.92952',
      focus: 'Government, justice & breaking old political pride',
    },
    {
      id: 'macedonia',
      name: 'Macedonia Baptist Church & Cemetery',
      address: 'Edgefield, SC 29824',
      gps: '33.79122,-81.92292',
      focus: 'Racial unity & honoring the faithful',
    },
    {
      id: 'slade-lake',
      name: 'Slade Lake',
      address: '90 Water Works Rd, Edgefield, SC 29824 (fishing pier)',
      gps: '33.78123,-81.91861',
      focus: 'Living water & future leaders',
    },
    {
      id: 'kendall-mill',
      name: 'Old Kendall Mill',
      address: '100 CTC Dr, Edgefield, SC 29824',
      gps: '33.78590,-81.92601',
      focus: 'The economy & rebuilding the town',
    },
    {
      id: 'horns-creek',
      name: 'Horn’s Creek Baptist Church',
      address: 'Old Stage Road, Trenton, SC 29847',
      gps: '33.72121,-81.93623',
      focus: 'Re-digging the old well of revival',
      note: 'The gate is often locked and the building is old and fragile — pray from the grounds.',
    },
  ],
}

// Build a turn-by-turn directions link that opens the phone's maps app.
function directionsUrl(stop) {
  const dest = stop.gps || stop.address
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`
}

export default function PrayerHub() {
  const { eyebrow, title, subtitle, region, guide, stops } = ASSIGNMENT
  const accent = REGION_COLORS[region] || '#2E5240'

  return (
    <div className="min-h-screen bg-cream text-charcoal font-sans">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F0E8]/90 backdrop-blur-xl border border-[#1C3A2A]/12 text-sm font-medium text-forest hover:-translate-y-px transition-transform"
        >
          <ArrowLeft size={15} weight="bold" />
          Unite SC
        </a>
        <div className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#0A1A10]/40 backdrop-blur-sm border border-white/10">
          <span className="font-bold text-sm tracking-[0.12em] text-cream">UNITE</span>
          <span className="font-light text-xs tracking-[0.18em] text-cream/55">SC</span>
          <span className="text-clay font-bold text-sm ml-0.5">+</span>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest text-cream pt-32 pb-20 px-6">
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_30%_20%,#C4572B_0,transparent_45%),radial-gradient(circle_at_80%_60%,#4A7A62_0,transparent_50%)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-mono uppercase tracking-[0.3em] text-clay mb-5"
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-5xl md:text-7xl leading-[0.95] mb-5"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="text-cream/75 text-lg leading-relaxed max-w-xl mx-auto"
          >
            {subtitle}
          </motion.p>

          {guide && (
            <motion.a
              href={guide}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-clay text-cream text-sm font-semibold hover:scale-[1.03] active:scale-[0.98] transition-transform"
            >
              <FileText size={17} weight="fill" />
              Download the full prayer guide (PDF)
            </motion.a>
          )}
          <p className="mt-4 text-cream/55 text-sm">{stops.length} stops · pray each one on-site</p>
        </div>
      </section>

      {/* ── How to pray on-site ─────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-4xl border border-forest/10 shadow-[0_12px_40px_-12px_rgba(28,58,42,0.18)] p-7 md:p-10">
          <div className="flex items-center gap-3 mb-7">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-pine/10 text-pine">
              <BookOpen size={20} weight="duotone" />
            </span>
            <div>
              <h2 className="font-display text-2xl text-forest leading-none">How to pray on-site</h2>
              <p className="text-sm text-stone mt-1">We pray together — the leaders give the direction on the day.</p>
            </div>
          </div>

          {/* Group-required notice — nothing here is done solo */}
          <div className="mb-7 flex items-start gap-3 p-5 rounded-3xl bg-clay/10 border border-clay/30">
            <UsersThree size={24} weight="duotone" className="mt-0.5 shrink-0 text-clay" />
            <p className="text-[15px] text-forest leading-relaxed">
              <span className="font-bold">Go as a group — never alone.</span> None of this is done on your
              own. We go out only <span className="font-semibold">with a team</span> and with the
              <span className="font-semibold"> approval and direction of Unite SC leaders</span>. Wait for
              the group before you go.
            </p>
          </div>

          <ol className="grid sm:grid-cols-2 gap-4">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i} className="flex gap-4 p-4 rounded-3xl bg-cream/60 border border-forest/[0.06]">
                <span className="shrink-0 w-7 h-7 rounded-full bg-clay text-cream text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-forest text-[15px]">{step.title}</p>
                  <p className="text-sm text-stone leading-relaxed mt-0.5">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── The stops ───────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 mt-14 pb-24">
        <h2 className="font-display text-3xl text-forest mb-6">The route</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {stops.map((stop, i) => (
            <motion.article
              key={stop.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: (i % 2) * 0.05 }}
              className="group bg-white rounded-4xl border border-forest/10 p-6 flex flex-col hover:shadow-[0_16px_44px_-16px_rgba(28,58,42,0.25)] hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="shrink-0 w-8 h-8 rounded-full text-cream text-sm font-bold flex items-center justify-center"
                  style={{ backgroundColor: accent }}
                >
                  {i + 1}
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone">
                  Stop {i + 1} of {stops.length}
                </span>
              </div>

              <h3 className="font-display text-2xl text-forest leading-tight">{stop.name}</h3>
              {stop.focus && <p className="text-sm text-clay font-medium mt-1">{stop.focus}</p>}

              <p className="flex items-start gap-1.5 text-sm text-stone mt-3 leading-snug">
                <MapPin size={15} weight="fill" className="mt-0.5 shrink-0 text-moss" />
                {stop.address}
              </p>

              {stop.note && (
                <p className="flex items-start gap-1.5 text-sm text-clay/90 mt-2 leading-snug">
                  <Warning size={15} weight="fill" className="mt-0.5 shrink-0" />
                  {stop.note}
                </p>
              )}

              <div className="flex gap-2.5 mt-5 pt-5 border-t border-forest/[0.07]">
                <a
                  href={directionsUrl(stop)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-forest text-cream text-sm font-semibold hover:bg-pine transition-colors"
                >
                  <NavigationArrow size={15} weight="fill" />
                  Get Directions
                </a>
                {guide && (
                  <a
                    href={guide}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-clay/10 text-clay text-sm font-semibold hover:bg-clay hover:text-cream transition-colors"
                  >
                    <FileText size={15} weight="fill" />
                    Prayer Guide
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-forest text-cream/60 text-center text-sm py-10 px-6">
        <p className="font-display text-cream text-lg mb-1">Unite SC</p>
        <p>One movement. Every county covered in prayer.</p>
      </footer>
    </div>
  )
}
