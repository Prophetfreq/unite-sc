import React, { useState, useEffect, useRef, useContext } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowRight, Circle, X } from '@phosphor-icons/react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import contentFallback from './content.json'
import { getSiteSettings, getBrandSettings } from './sanityClient'
import { supabase } from './supabase.js'
import { WebGLShader } from './components/ui/web-gl-shader.jsx'

// ─── Data ────────────────────────────────────────────────────────────────────

const COUNTIES = {
  Midlands: {
    desc: 'Central SC — 14 counties',
    counties: ['Aiken', 'Edgefield', 'McCormick', 'Saluda', 'Newberry', 'Lexington', 'Richland', 'Fairfield', 'Kershaw', 'Sumter', 'Lee', 'Clarendon', 'Calhoun', 'Orangeburg'],
  },
  Lowcountry: {
    desc: 'Coastal SC — 10 counties',
    counties: ['Colleton', 'Dorchester', 'Berkeley', 'Charleston', 'Beaufort', 'Jasper', 'Hampton', 'Allendale', 'Bamberg', 'Barnwell'],
  },
  'Pee Dee': {
    desc: 'Eastern SC — 9 counties',
    counties: ['Williamsburg', 'Georgetown', 'Horry', 'Marion', 'Dillon', 'Marlboro', 'Chesterfield', 'Darlington', 'Florence'],
  },
  Upstate: {
    desc: 'Upstate SC — 13 counties',
    counties: ['Lancaster', 'Chester', 'Union', 'York', 'Cherokee', 'Spartanburg', 'Greenville', 'Laurens', 'Greenwood', 'Abbeville', 'Anderson', 'Oconee', 'Pickens'],
  },
}

const REGION_COLORS = {
  Midlands: '#2E5240',
  Lowcountry: '#4A7A62',
  'Pee Dee': '#8A7355',
  Upstate: '#C4572B',
}


// SC county FIPS → name
const FIPS_TO_COUNTY = {
  '45001': 'Abbeville', '45003': 'Aiken',       '45005': 'Allendale',
  '45007': 'Anderson',  '45009': 'Bamberg',     '45011': 'Barnwell',
  '45013': 'Beaufort',  '45015': 'Berkeley',    '45017': 'Calhoun',
  '45019': 'Charleston','45021': 'Cherokee',    '45023': 'Chester',
  '45025': 'Chesterfield','45027': 'Clarendon', '45029': 'Colleton',
  '45031': 'Darlington','45033': 'Dillon',      '45035': 'Dorchester',
  '45037': 'Edgefield', '45039': 'Fairfield',   '45041': 'Florence',
  '45043': 'Georgetown','45045': 'Greenville',  '45047': 'Greenwood',
  '45049': 'Hampton',   '45051': 'Horry',       '45053': 'Jasper',
  '45055': 'Kershaw',   '45057': 'Lancaster',   '45059': 'Laurens',
  '45061': 'Lee',       '45063': 'Lexington',   '45065': 'McCormick',
  '45067': 'Marion',    '45069': 'Marlboro',    '45071': 'Newberry',
  '45073': 'Oconee',    '45075': 'Orangeburg',  '45077': 'Pickens',
  '45079': 'Richland',  '45081': 'Saluda',      '45083': 'Spartanburg',
  '45085': 'Sumter',    '45087': 'Union',       '45089': 'Williamsburg',
  '45091': 'York',
}

function getRegionForCounty(name) {
  for (const [region, data] of Object.entries(COUNTIES)) {
    if (data.counties.includes(name)) return region
  }
  return null
}

// County visits are fetched live from Supabase — see CountyTracker component.

const DEFAULT_SENTINEL_TRAITS = [
  {
    label: 'Territorial authority',
    desc: 'When they pray, the county moves. People inside and outside their congregation respect the weight they carry.',
  },
  {
    label: 'Cross-stream trust',
    desc: 'Pastors from different denominations and backgrounds trust them — not just their own tribe.',
  },
  {
    label: 'A posture of receiving',
    desc: 'They are not territorial about influence. They can receive a word from someone they did not send for.',
  },
  {
    label: 'Already carrying something',
    desc: 'You will often find they have already been praying for county-wide breakthrough — before you ever called.',
  },
  {
    label: 'Willingness to host',
    desc: 'They have a space — physical or relational — where they can gather people to receive what you carry.',
  },
]

// Hook to access site content from Sanity (or fallback JSON)
function useContent() {
  return useContext(ContentContext)
}

const SCRIPTURES = contentFallback.scriptures

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

// ─── Noise Overlay ────────────────────────────────────────────────────────────

function NoiseOverlay() {
  return <div className="noise-overlay" aria-hidden="true" />
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const content = useContent()
  const nav = content.navigation || {}
  const brand = useBrand()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: nav.nav1Label || 'The Mandate',  href: '#the-mandate' },
    { label: nav.nav2Label || 'Counties',      href: '#counties' },
    { label: nav.nav3Label || 'The Sentinel',  href: '#the-sentinel' },
    { label: nav.nav4Label || 'Support',       href: '#support' },
  ]

  return (
    <motion.nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center md:grid md:grid-cols-[auto_1fr_auto] px-5 py-3 md:px-6 md:py-3.5 rounded-full transition-all duration-500 md:min-w-[680px] ${
        scrolled
          ? 'bg-[#F5F0E8]/90 backdrop-blur-xl border border-[#1C3A2A]/12 shadow-[0_4px_24px_-4px_rgba(28,58,42,0.12)]'
          : 'bg-[#0A1A10]/40 backdrop-blur-sm border border-white/10'
      }`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Wordmark — left */}
      <div className="flex items-center gap-1 md:pr-6">
        <span className={`font-bold text-sm md:text-base tracking-[0.12em] transition-colors duration-400 ${
          scrolled ? 'text-[#1C3A2A]' : 'text-[#F5F0E8]'
        }`}>
          UNITE
        </span>
        <span className={`font-light text-xs md:text-sm tracking-[0.18em] transition-colors duration-400 ${
          scrolled ? 'text-[#1C3A2A]/60' : 'text-[#F5F0E8]/55'
        }`}>
          SC
        </span>
        <span className="text-[#C4572B] font-bold text-sm md:text-base ml-0.5">+</span>
      </div>

      {/* Nav links — centered, desktop only */}
      <div className="hidden md:flex items-center justify-center gap-7">
        {navLinks.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className={`text-sm font-medium transition-all duration-300 hover:-translate-y-px whitespace-nowrap ${
              scrolled ? 'text-[#6B6B5A] hover:text-[#1C3A2A]' : 'text-[#F5F0E8]/70 hover:text-[#F5F0E8]'
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {/* CTA — right (desktop) */}
      <a
        href="#counties"
        className={`hidden md:inline-flex ml-6 text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap ${
          scrolled
            ? 'bg-[#C4572B] text-[#F5F0E8]'
            : 'bg-[#F5F0E8]/12 border border-[#F5F0E8]/25 text-[#F5F0E8]'
        }`}
      >
        {nav.navCTALabel || 'View Counties'}
      </a>

      {/* Mobile CTA — compact */}
      <a
        href="#counties"
        className={`md:hidden ml-4 text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap ${
          scrolled
            ? 'bg-[#C4572B] text-[#F5F0E8]'
            : 'bg-[#F5F0E8]/12 border border-[#F5F0E8]/25 text-[#F5F0E8]'
        }`}
      >
        View
      </a>
    </motion.nav>
  )
}

// ─── Hero Progress Card ───────────────────────────────────────────────────────

function HeroProgressCard() {
  const [visited, setVisited] = useState(0)
  const [regionCounts, setRegionCounts] = useState({})
  const TOTAL = 46

  useEffect(() => {
    supabase
      .from('county_visits')
      .select('county')
      .then(({ data }) => {
        if (!data) return
        const names = data.map(r => r.county)
        setVisited(names.length)
        const rc = {}
        for (const [region, info] of Object.entries(COUNTIES)) {
          rc[region] = info.counties.filter(c => names.includes(c)).length
        }
        setRegionCounts(rc)
      })
  }, [])

  const pct = Math.round((visited / TOTAL) * 100)
  const circumference = 2 * Math.PI * 38
  const dashOffset = circumference - (circumference * pct) / 100

  const SCRIPTURE = {
    verse: '"He made from one man every nation of mankind to live on all the face of the earth, having determined allotted periods and the boundaries of their dwelling place."',
    ref: 'Acts 17:26',
  }

  return (
    <motion.div
      variants={fadeUp}
      className="lg:mb-0 mb-0"
    >
      {/* Progress ring card */}
      <div
        className="rounded-[1.75rem] p-6 border border-white/12 backdrop-blur-md mb-4"
        style={{ background: 'rgba(10, 26, 16, 0.55)' }}
      >
        <p className="font-mono text-[#4A7A62] text-[0.6rem] tracking-[0.25em] uppercase mb-4">
          County Coverage
        </p>

        <div className="flex items-center gap-6 mb-5">
          {/* SVG ring */}
          <div className="relative flex-shrink-0">
            <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
              {/* Track */}
              <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              {/* Progress */}
              <motion.circle
                cx="48" cy="48" r="38"
                fill="none"
                stroke="#C4572B"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="font-mono text-white font-bold text-xl leading-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                {pct}%
              </motion.span>
              <span className="font-mono text-white/35 text-[0.5rem] tracking-widest mt-0.5">done</span>
            </div>
          </div>

          {/* Counts */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <span className="font-mono text-white font-bold text-3xl leading-none">{visited}</span>
              <span className="font-mono text-white/35 text-sm">/ {TOTAL}</span>
            </div>
            <p className="text-[#E8DCC8]/55 text-xs leading-snug">counties visited</p>

            {/* Region breakdown */}
            <div className="mt-3 space-y-1.5">
              {Object.entries(COUNTIES).map(([region, info]) => {
                const count = regionCounts[region] || 0
                const total = info.counties.length
                const pctR = (count / total) * 100
                return (
                  <div key={region}>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-white/40 text-[0.6rem] font-mono tracking-wider">{region}</span>
                      <span className="text-white/40 text-[0.6rem] font-mono">{count}/{total}</span>
                    </div>
                    <div className="h-[3px] rounded-full bg-white/8 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: REGION_COLORS[region] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pctR}%` }}
                        transition={{ duration: 1.2, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Pulsing status */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7A62] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A7A62]" />
          </span>
          <span className="font-mono text-[#4A7A62] text-[0.6rem] tracking-wider">Mission active — 2026</span>
        </div>
      </div>

      {/* Scripture card */}
      <div
        className="rounded-[1.75rem] p-5 border border-white/8"
        style={{ background: 'rgba(10, 26, 16, 0.35)' }}
      >
        <p className="text-[#E8DCC8]/60 text-xs italic leading-relaxed mb-2">
          {SCRIPTURE.verse}
        </p>
        <p className="font-mono text-[#C4572B]/80 text-[0.6rem] tracking-[0.2em] uppercase">
          {SCRIPTURE.ref}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background — forest image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1511497584788-876760111969?w=1800&q=85&fit=crop"
          alt=""
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060F09] via-[#0F2219]/80 to-[#0F2219]/50" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1A10]/55 via-transparent to-transparent" />
      </div>

      {/* Cinematic Logo — perfectly centered */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Top accent line */}
        <motion.div
          className="h-px mb-8"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
          initial={{ width: 0 }}
          animate={{ width: 'clamp(80px, 16vw, 200px)' }}
          transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* UNITE · SC + */}
        <div className="flex items-baseline gap-3 md:gap-5">
          {/* U N I T E */}
          <div className="flex items-baseline">
            {'UNITE'.split('').map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 48, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="text-white font-bold leading-none"
                style={{ fontSize: 'clamp(3.5rem, 8vw, 9rem)', letterSpacing: '0.05em' }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* · divider */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="text-white/20 font-thin leading-none self-center"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 3.5rem)' }}
          >
            ·
          </motion.span>

          {/* SC */}
          <motion.span
            initial={{ opacity: 0, y: 48, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/50 font-light leading-none"
            style={{ fontSize: 'clamp(3rem, 6.5vw, 7.5rem)', letterSpacing: '0.18em' }}
          >
            SC
          </motion.span>

          {/* + */}
          <motion.span
            initial={{ opacity: 0, scale: 0.2, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.82, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-[#C4572B] font-bold leading-none"
            style={{
              fontSize: 'clamp(3rem, 6vw, 7rem)',
              textShadow: '0 0 30px rgba(196,87,43,1), 0 0 70px rgba(196,87,43,0.5)',
              animation: 'logoPulse 3s ease-in-out infinite',
              animationDelay: '1.6s',
            }}
          >
            +
          </motion.span>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="font-mono text-white/30 uppercase mt-6 text-center"
          style={{ fontSize: 'clamp(0.55rem, 1.2vw, 0.75rem)', letterSpacing: '0.35em' }}
        >
          South Carolina &nbsp;·&nbsp; 46 Counties &nbsp;·&nbsp; One Mandate
        </motion.p>

        {/* Bottom accent line */}
        <motion.div
          className="h-px mt-8"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
          initial={{ width: 0 }}
          animate={{ width: 'clamp(80px, 16vw, 200px)' }}
          transition={{ duration: 1.0, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="mt-16 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-10 bg-gradient-to-b from-white/0 via-white/30 to-white/0"
          />
        </motion.div>
      </div>
    </section>
  )
}

// ─── Animated SC Map ──────────────────────────────────────────────────────────

const BRIGHT_COLORS = {
  Midlands:    '#4A8C68',
  Lowcountry:  '#6BAE88',
  'Pee Dee':   '#C4A46B',
  Upstate:     '#D4703A',
}

// All 46 SC county names for the random pulse
const ALL_COUNTIES = Object.values(FIPS_TO_COUNTY)

function AnimatedSCMap() {
  // Set of currently "lit" counties
  const [lit, setLit] = useState(new Set())

  useEffect(() => {
    // Every 600ms, randomly light up 1-2 counties and extinguish others
    const interval = setInterval(() => {
      setLit(prev => {
        const next = new Set(prev)

        // Extinguish 1-3 random lit counties
        const litArr = [...next]
        const toOff = litArr.slice(0, Math.ceil(Math.random() * 3))
        toOff.forEach(c => next.delete(c))

        // Light up 1-2 random new counties
        const count = Math.random() > 0.4 ? 2 : 1
        for (let i = 0; i < count; i++) {
          const pick = ALL_COUNTIES[Math.floor(Math.random() * ALL_COUNTIES.length)]
          next.add(pick)
        }

        return next
      })
    }, 550)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full max-w-[420px]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 6200, center: [-80.9, 33.7] }}
        width={800}
        height={460}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter(geo => geo.id.startsWith('45'))
              .map(geo => {
                const name = FIPS_TO_COUNTY[geo.id]
                if (!name) return null
                const region = getRegionForCounty(name)
                const base = BRIGHT_COLORS[region] || '#4A8C68'
                const isLit = lit.has(name)

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isLit ? '#F5F0E8' : base}
                    stroke="#060F09"
                    strokeWidth={2}
                    style={{
                      default: {
                        outline: 'none',
                        transition: 'fill 0.4s ease',
                        filter: isLit ? 'drop-shadow(0 0 6px rgba(245,240,232,0.8))' : 'none',
                      },
                      hover:   { outline: 'none', fill: '#C4572B' },
                      pressed: { outline: 'none' },
                    }}
                  />
                )
              })
          }
        </Geographies>
      </ComposableMap>

      {/* Region legend */}
      <div className="flex justify-center gap-4 flex-wrap mt-1">
        {Object.entries(BRIGHT_COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            <span className="font-mono text-[#E8DCC8]/45 text-[0.55rem] tracking-wider">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Intro Section — 3-column minimalist layout ───────────────────────────────

function IntroSection() {
  const content = useContent()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="bg-[#060F09] min-h-screen flex flex-col justify-between py-12 md:py-16 px-6 md:px-12 overflow-hidden"
    >
      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="font-mono text-[#4A7A62] text-[0.6rem] tracking-[0.3em] uppercase text-center"
      >
        Reuben & Grace Kora &nbsp;·&nbsp; A Prophetic Mandate &nbsp;·&nbsp; 2026
      </motion.p>

      {/* 3-column main grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr_1fr] gap-8 lg:gap-4 items-center max-w-[1400px] mx-auto w-full py-8">

        {/* ── LEFT: description + CTAs + stats ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6 lg:pr-8"
        >
          <p className="text-[#E8DCC8]/70 text-sm md:text-base leading-relaxed max-w-[38ch]">
            {content.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <a
              href="#counties"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C4572B] text-[#F5F0E8] rounded-full font-semibold text-xs transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] w-fit"
            >
              {content.hero.cta_primary}
              <ArrowRight weight="bold" size={12} />
            </a>
            <a
              href="#the-mandate"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#F5F0E8]/15 text-[#F5F0E8]/70 rounded-full font-medium text-xs transition-all duration-300 hover:border-[#F5F0E8]/35 hover:text-[#F5F0E8] w-fit"
            >
              {content.hero.cta_secondary}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              { value: '46', label: 'Counties' },
              { value: '4',  label: 'Regions' },
              { value: '18', label: 'Months' },
              { value: '2',  label: 'Sent Ones' },
            ].map((s) => (
              <div key={s.label} className="border border-[#1C3A2A]/60 rounded-2xl p-4">
                <div className="font-mono text-[#C4572B] text-2xl font-bold leading-none mb-1">{s.value}</div>
                <div className="text-[#E8DCC8]/40 text-[0.6rem] tracking-widest uppercase font-mono">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CENTER: SC Map ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.0, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center relative order-first lg:order-none"
        >
          {/* Glowing circle behind map */}
          <div
            className="absolute w-[360px] h-[360px] md:w-[460px] md:h-[460px] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(44,90,64,0.35) 0%, rgba(6,15,9,0) 72%)',
              boxShadow: '0 0 100px 30px rgba(74,140,104,0.18)',
            }}
          />

          {/* SC Map — animated */}
          <AnimatedSCMap />
        </motion.div>

        {/* ── RIGHT: Big headline ── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center lg:justify-start lg:pl-4"
        >
          <h1
            className="font-bold text-[#F5F0E8] leading-[0.9] tracking-tight text-center lg:text-left"
            style={{ fontSize: 'clamp(3rem, 6vw, 6.5rem)' }}
          >
            {content.hero.headline}
            <br />
            <span
              className="font-display italic text-[#C4572B] block"
              style={{ fontSize: 'clamp(2.2rem, 4.5vw, 5rem)' }}
            >
              {content.hero.subheadline}
            </span>
          </h1>
        </motion.div>
      </div>

      {/* Bottom strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="flex items-center justify-between max-w-[1400px] mx-auto w-full pt-4 border-t border-[#1C3A2A]/40"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7A62] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A7A62]" />
          </span>
          <span className="font-mono text-[#4A7A62] text-[0.6rem] tracking-wider">Mission active — 2026</span>
        </div>
        <span className="font-mono text-[#E8DCC8]/30 text-[0.6rem] tracking-wider">South Carolina, USA</span>
      </motion.div>
    </section>
  )
}

// ─── Mandate ──────────────────────────────────────────────────────────────────

function MandateSection() {
  const content = useContent()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const contrasts = content.mandate.contrasts

  return (
    <section id="the-mandate" ref={ref} className="bg-[#1C3A2A] py-24 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-12 md:gap-20 items-start"
        >
          {/* Left column */}
          <div>
            <motion.p variants={fadeUp} className="font-mono text-[#4A7A62] text-xs tracking-widest uppercase mb-5">
              {content.mandate.eyebrow}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-[#F5F0E8] font-bold text-3xl md:text-5xl tracking-tight leading-tight mb-5"
            >
              {content.mandate.headline}
              <br />
              <span className="font-display italic text-[#C4572B]">{content.mandate.headline_italic}</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#E8DCC8]/65 text-base leading-relaxed max-w-[58ch] mb-10">
              {content.mandate.body}
            </motion.p>

            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contrasts.map((item) => (
                <motion.div
                  key={item.not}
                  variants={fadeUp}
                  className="border border-[#2E5240] rounded-3xl p-5 hover:border-[#4A7A62]/50 transition-colors duration-300"
                >
                  <div className="text-[#4A7A62]/70 text-xs mb-2 line-through">{item.not}</div>
                  <div className="text-[#E8DCC8] text-sm font-medium leading-snug">{item.is}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right column — pull quotes */}
          <motion.div variants={stagger} className="md:pt-12 space-y-4">
            <motion.div variants={fadeUp} className="border border-[#2E5240] rounded-4xl p-7">
              <div className="w-8 h-px bg-[#C4572B] mb-5" />
              <p className="font-display italic text-[#E8DCC8] text-xl md:text-2xl leading-relaxed mb-5">
                {content.mandate.pull_quote}
              </p>
              <div className="font-mono text-[#4A7A62] text-xs">{content.mandate.pull_quote_ref}</div>
            </motion.div>

            <motion.div variants={fadeUp} className="border border-[#2E5240] rounded-4xl p-6">
              <div className="font-mono text-[#4A7A62] text-xs mb-3 uppercase tracking-widest">Sent from</div>
              <div className="text-[#E8DCC8] font-semibold text-sm mb-1">{content.mandate.sent_from_name}</div>
              <div className="text-[#E8DCC8]/45 text-xs">{content.mandate.sent_from_church}</div>
              <div className="text-[#E8DCC8]/45 text-xs">{content.mandate.sent_from_org}</div>
              <div className="text-[#E8DCC8]/45 text-xs mt-1 font-mono">{content.mandate.sent_from_year}</div>
            </motion.div>

            <motion.div variants={fadeUp} className="border border-[#2E5240] rounded-4xl p-6">
              <div className="font-mono text-[#4A7A62] text-xs mb-3 uppercase tracking-widest">{content.mandate.model_heading}</div>
              <p className="text-[#E8DCC8]/70 text-sm leading-relaxed">{content.mandate.model_body}</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── County Tracker ───────────────────────────────────────────────────────────

// ─── SC Map ───────────────────────────────────────────────────────────────────

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json'

function SCMap({ activeRegion, onCountyClick, countyVisits = {} }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div className="relative">
      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key={hovered}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#F5F0E8] text-[#1A1A1A] px-4 py-2 rounded-full font-semibold text-sm pointer-events-none shadow-[0_4px_16px_-4px_rgba(10,26,16,0.25)] flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: REGION_COLORS[getRegionForCounty(hovered)] || '#4A7A62' }} />
            {hovered}
            <span className="font-mono text-[#6B6B5A] text-xs font-normal">{getRegionForCounty(hovered)}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 6200, center: [-80.9, 33.7] }}
        width={800}
        height={460}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter((geo) => geo.id.startsWith('45'))
              .map((geo) => {
                const county = FIPS_TO_COUNTY[geo.id]
                if (!county) return null
                const region = getRegionForCounty(county)
                const inActive = activeRegion === 'All' || region === activeRegion
                const isVisited = countyVisits[county]?.visited
                const isHovered = hovered === county

                const baseFill = isVisited
                  ? REGION_COLORS[region]
                  : inActive
                  ? '#2E5240'
                  : '#1A3228'

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onCountyClick(county)}
                    onMouseEnter={() => setHovered(county)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      default: {
                        fill: baseFill,
                        stroke: '#0F2219',
                        strokeWidth: 0.7,
                        opacity: inActive ? 1 : 0.35,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      hover: {
                        fill: '#C4572B',
                        stroke: '#0F2219',
                        strokeWidth: 0.7,
                        opacity: 1,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: '#A34224',
                        outline: 'none',
                      },
                    }}
                  />
                )
              })
          }
        </Geographies>
      </ComposableMap>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 px-2">
        {Object.entries(REGION_COLORS).map(([region, color]) => (
          <div key={region} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-mono text-[#E8DCC8]/60 text-xs">{region}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-2">
          <div className="w-3 h-3 rounded-full bg-[#C4572B]" />
          <span className="font-mono text-[#E8DCC8]/60 text-xs">Visited</span>
        </div>
      </div>
    </div>
  )
}

// ─── County Modal ─────────────────────────────────────────────────────────────

function CountyModal({ county, onClose, countyVisits = {} }) {
  const region = county ? getRegionForCounty(county) : null
  const visit = county ? (countyVisits[county] || { visited: false }) : null

  // Close on Escape
  useEffect(() => {
    if (!county) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [county, onClose])

  return (
    <AnimatePresence>
      {county && (
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
            className="bg-[#F5F0E8] rounded-4xl p-7 max-w-md w-full shadow-[0_32px_64px_-12px_rgba(10,26,16,0.45)] max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: REGION_COLORS[region] }} />
                  <span className="font-mono text-[#6B6B5A] text-xs uppercase tracking-widest">{region}</span>
                </div>
                <h3 className="font-bold text-[#1A1A1A] text-2xl tracking-tight">{county} County</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1C3A2A]/15 text-[#6B6B5A] hover:bg-[#1C3A2A]/8 transition-colors flex-shrink-0 mt-1"
              >
                <X size={14} weight="bold" />
              </button>
            </div>

            {visit?.visited ? (
              <div className="space-y-5">
                {/* Visit date */}
                {visit.date && (
                  <div className="font-mono text-[#6B6B5A] text-xs">Visited {visit.date}</div>
                )}

                {/* Church */}
                {visit.church && (
                  <div className="border border-[#1C3A2A]/12 rounded-3xl p-4">
                    <div className="font-mono text-[#6B6B5A] text-xs uppercase tracking-widest mb-1">Church</div>
                    <div className="font-semibold text-[#1A1A1A] text-sm">{visit.church}</div>
                  </div>
                )}

                {/* Summary */}
                {visit.summary && (
                  <p className="text-[#6B6B5A] text-sm leading-relaxed">{visit.summary}</p>
                )}

                {/* Photos */}
                {visit.photos?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {visit.photos.map((photo, i) => (
                      <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#E8DCC8]">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full border border-[#1C3A2A]/12 flex items-center justify-center mx-auto mb-4">
                  <Circle size={22} weight="regular" className="text-[#C4572B]/35" />
                </div>
                <div className="text-[#1A1A1A] font-semibold text-sm mb-2">Not yet visited</div>
                <p className="text-[#6B6B5A] text-sm leading-relaxed max-w-[26ch] mx-auto">
                  This county is waiting to receive its prophetic visitation.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── County Tracker ───────────────────────────────────────────────────────────

function CountyTracker() {
  const [activeRegion, setActiveRegion] = useState('All')
  const [selectedCounty, setSelectedCounty] = useState(null)
  const [countyVisits, setCountyVisits] = useState({})
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  // Fetch visit data from Supabase on mount
  useEffect(() => {
    async function fetchVisits() {
      const { data, error } = await supabase
        .from('county_visits')
        .select('county_name, visited, visit_date, church_name, summary, photos')

      if (error) {
        console.error('Error fetching county visits:', error)
        setLoading(false)
        return
      }

      // Transform rows into a lookup object keyed by county name
      const visits = {}
      for (const row of data) {
        visits[row.county_name] = {
          visited: row.visited,
          date: row.visit_date,
          church: row.church_name,
          summary: row.summary,
          photos: row.photos || [],
        }
      }
      setCountyVisits(visits)
      setLoading(false)
    }

    fetchVisits()
  }, [])

  const visitedCount = Object.values(countyVisits).filter((v) => v.visited).length

  return (
    <section id="counties" ref={ref} className="bg-[#F5F0E8] py-24 px-6 md:px-16">
      <CountyModal county={selectedCounty} onClose={() => setSelectedCounty(null)} countyVisits={countyVisits} />

      <div className="max-w-[1400px] mx-auto">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <motion.p variants={fadeUp} className="font-mono text-[#6B6B5A] text-xs tracking-widest uppercase mb-4">
            46-County Tracker
          </motion.p>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <motion.h2
              variants={fadeUp}
              className="text-[#1A1A1A] font-bold text-3xl md:text-5xl tracking-tight leading-tight"
            >
              Every county.
              <span className="font-display italic text-[#2E5240]"> Every territory.</span>
            </motion.h2>

            {/* Region filter tabs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {['All', ...Object.keys(COUNTIES)].map((region) => (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${
                    activeRegion === region
                      ? 'bg-[#1C3A2A] text-[#F5F0E8]'
                      : 'bg-[#E8DCC8] text-[#6B6B5A] hover:bg-[#1C3A2A]/10 hover:text-[#1C3A2A]'
                  }`}
                >
                  {region}
                  {region !== 'All' && (
                    <span className="ml-2 font-mono opacity-50">{COUNTIES[region].counties.length}</span>
                  )}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Interactive Map */}
          <motion.div
            variants={fadeUp}
            className="bg-[#1C3A2A] rounded-4xl overflow-hidden mb-8 px-4 pt-6 pb-4 md:px-8 md:pt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[#4A7A62] text-xs">Click any county to view details</p>
              <p className="font-mono text-[#4A7A62]/70 text-xs">
                {visitedCount} <span className="text-[#4A7A62]/40">/ 46 visited</span>
              </p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-48 font-mono text-[#4A7A62] text-xs animate-pulse">
                Loading county data...
              </div>
            ) : (
              <SCMap
                activeRegion={activeRegion}
                onCountyClick={setSelectedCounty}
                countyVisits={countyVisits}
              />
            )}
          </motion.div>

          {/* Region summary cards */}
          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(COUNTIES).map(([region, data]) => (
              <motion.div
                key={region}
                variants={fadeUp}
                onClick={() => setActiveRegion(activeRegion === region ? 'All' : region)}
                className={`border rounded-3xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-px ${
                  activeRegion === region
                    ? 'border-[#1C3A2A]/30 bg-[#1C3A2A]/5'
                    : 'border-[#1C3A2A]/10 hover:border-[#1C3A2A]/22'
                }`}
              >
                <div className="w-3 h-3 rounded-full mb-3" style={{ backgroundColor: REGION_COLORS[region] }} />
                <div className="font-bold text-[#1A1A1A] text-sm mb-0.5">{region}</div>
                <div className="font-mono text-[#6B6B5A] text-xs">{data.counties.length} counties</div>
                <div className="font-mono text-[10px] text-[#6B6B5A]/50 mt-1">{data.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Sentinel ─────────────────────────────────────────────────────────────────

function SentinelSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const content = useContent()
  const s = content.sentinel || {}
  const traits = s.traits?.length ? s.traits : DEFAULT_SENTINEL_TRAITS

  return (
    <section
      id="the-sentinel"
      ref={ref}
      className="bg-[#F5F0E8] py-24 px-6 md:px-16 border-t border-[#1C3A2A]/8"
    >
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-12 md:gap-20 items-start"
        >
          {/* Sticky left */}
          <div className="md:sticky md:top-24">
            <motion.p variants={fadeUp} className="font-mono text-[#6B6B5A] text-xs tracking-widest uppercase mb-4">
              {s.eyebrow || 'Who You Are Looking For'}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-[#1A1A1A] font-bold text-3xl md:text-4xl tracking-tight leading-tight mb-5"
            >
              {s.headline || 'Not the most famous.'}
              <br />
              <span className="font-display italic text-[#2E5240]">{s.headlineItalic || 'The most faithful.'}</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B6B5A] text-sm leading-relaxed max-w-[38ch] mb-6">
              {s.body || 'In every county there is a person — a pastor, prophet, apostolic voice, or prayer leader — who holds the spiritual gate of that area. They may not be well known outside their county. But they are trusted across streams, and the territory responds when they move.'}
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="border border-[#1C3A2A]/12 rounded-3xl p-5"
            >
              <div className="w-6 h-px bg-[#C4572B] mb-4" />
              <p className="font-display italic text-[#1C3A2A] text-lg leading-relaxed">
                {s.pullQuote || '"Not the largest church. Not the biggest platform. The deepest root."'}
              </p>
            </motion.div>
          </div>

          {/* Trait list */}
          <motion.div variants={stagger} className="space-y-3">
            {traits.map((trait, i) => (
              <motion.div
                key={trait.label}
                variants={fadeUp}
                className="border border-[#1C3A2A]/10 rounded-3xl p-6 hover:border-[#1C3A2A]/20 transition-all duration-300 hover:-translate-y-px"
              >
                <div className="flex items-start gap-5">
                  <div className="font-mono text-[#C4572B]/45 text-xs mt-0.5 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A1A1A] text-sm mb-2">{trait.label}</div>
                    <div className="text-[#6B6B5A] text-sm leading-relaxed">{trait.desc}</div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* The ask */}
            <motion.div
              variants={fadeUp}
              className="bg-[#1C3A2A] rounded-3xl p-6"
            >
              <div className="font-mono text-[#4A7A62] text-xs uppercase tracking-widest mb-4">What You Are Asking</div>
              <div className="space-y-3">
                {[
                  'Host one gathering — size does not matter',
                  'Invite whoever the Spirit leads them to invite',
                  'Create space for worship, the word, and prophetic ministry',
                  'Receive what God releases for their county',
                  'Carry it forward — that is between them and God',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-[#C4572B] mt-2 flex-shrink-0" />
                    <span className="text-[#E8DCC8]/75 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-[#2E5240] font-mono text-[#4A7A62] text-xs">
                No requirements. No membership. No reporting structure.
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}


// ─── Prayer ───────────────────────────────────────────────────────────────────

function PrayerSection() {
  const content = useContent()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const prayerItems = content.prayer.prayer_items

  return (
    <section
      id="prayer"
      ref={ref}
      className="bg-[#F5F0E8] py-24 px-6 md:px-16 border-t border-[#1C3A2A]/8"
    >
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-16 md:gap-20"
        >
          {/* Left */}
          <div>
            <motion.p variants={fadeUp} className="font-mono text-[#6B6B5A] text-xs tracking-widest uppercase mb-4">
              {content.prayer.eyebrow}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-[#1A1A1A] font-bold text-3xl md:text-5xl tracking-tight leading-tight mb-5"
            >
              {content.prayer.headline}
              <span className="font-display italic text-[#2E5240]"> {content.prayer.headline_italic}</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B6B5A] text-base leading-relaxed max-w-[54ch] mb-10">
              {content.prayer.body}
            </motion.p>

            <motion.div variants={stagger} className="space-y-3">
              {prayerItems.map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-start gap-4">
                  <div className="font-mono text-[#C4572B] text-xs mt-0.5 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="text-[#1A1A1A] text-sm leading-relaxed">{item}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-10 border border-[#1C3A2A]/12 rounded-3xl p-6"
            >
              <div className="font-mono text-[#6B6B5A] text-xs uppercase tracking-widest mb-3">{content.prayer.intercession_heading}</div>
              <p className="text-[#6B6B5A] text-sm leading-relaxed">{content.prayer.intercession_body}</p>
            </motion.div>
          </div>

          {/* Scripture stack */}
          <motion.div variants={stagger} className="space-y-4 md:pt-16">
            {SCRIPTURES.map((s) => (
              <motion.div
                key={s.ref}
                variants={fadeUp}
                className="border border-[#1C3A2A]/12 rounded-3xl p-6 hover:border-[#1C3A2A]/22 transition-colors duration-300"
              >
                <div className="w-6 h-px bg-[#C4572B] mb-4" />
                <p className="font-display italic text-[#1C3A2A] text-lg leading-relaxed mb-3">{s.verse}</p>
                <div className="font-mono text-[#6B6B5A] text-xs">— {s.ref}</div>
              </motion.div>
            ))}

            {/* County declaration note */}
            <motion.div variants={fadeUp} className="bg-[#1C3A2A] rounded-3xl p-6">
              <div className="font-mono text-[#4A7A62] text-xs uppercase tracking-widest mb-3">What Is Left Behind</div>
              <div className="space-y-2">
                {content.prayer.left_behind_items.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-[#C4572B] mt-2 flex-shrink-0" />
                    <span className="text-[#E8DCC8]/65 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const content = useContent()
  return (
    <footer className="bg-[#1C3A2A] rounded-t-[4rem] px-6 md:px-16 pt-16 pb-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-10 md:gap-16 mb-14">
          <div>
            <div className="font-bold text-[#F5F0E8] text-lg tracking-tight mb-2">Unite South Carolina</div>
            <div className="font-display italic text-[#C4572B] text-xl mb-5">
              {content.footer.tagline}
            </div>
            <p className="text-[#E8DCC8]/45 text-sm leading-relaxed max-w-[42ch]">
              A prophetic traveling assignment carried by Reuben & Grace Kora from Aiken, SC —
              ministering county by county across all of South Carolina.
            </p>
          </div>

          <div>
            <div className="font-mono text-[#4A7A62] text-xs uppercase tracking-widest mb-5">Navigate</div>
            {[
              { label: 'The Mandate', href: '#the-mandate' },
              { label: 'Counties', href: '#counties' },
              { label: 'The Sentinel', href: '#the-sentinel' },
              { label: 'Prayer', href: '#prayer' },
              { label: 'Support', href: '#support' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="block text-[#E8DCC8]/50 text-sm mb-2.5 hover:text-[#E8DCC8] transition-all duration-200 hover:-translate-y-px"
              >
                {label}
              </a>
            ))}
          </div>

          <div>
            <div className="font-mono text-[#4A7A62] text-xs uppercase tracking-widest mb-5">Ministry</div>
            <div className="text-[#E8DCC8]/60 text-sm mb-2">Reuben & Grace Kora</div>
            <div className="text-[#E8DCC8]/60 text-sm mb-2">Glory City Church Aiken</div>
            <div className="text-[#E8DCC8]/60 text-sm mb-2">Radiant Eternity</div>
            <div className="text-[#E8DCC8]/60 text-sm mb-6">Aiken, South Carolina</div>
            <div className="font-mono text-[#C4572B] text-xs">2026 Mandate</div>
          </div>
        </div>

        {/* Status bar */}
        <div className="border-t border-[#2E5240] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[#4A7A62] text-xs">Mandate Active — 0 of 46 Counties Visited</span>
          </div>
          <div className="font-mono text-[#4A7A62]/40 text-xs">Unite SC — Radiant Eternity &copy; 2026</div>
        </div>
      </div>
    </footer>
  )
}

// ─── Support ─────────────────────────────────────────────────────────────────

const TIERS = [
  {
    name: 'Intercessor',
    amount: '$50',
    desc: 'Covers printing, county declaration materials, and communications for one county visit.',
    tag: 'Start here',
  },
  {
    name: 'Road Partner',
    amount: '$75',
    desc: 'Covers fuel and travel costs to reach one county — putting feet on the ground.',
    tag: 'Most popular',
    featured: true,
  },
  {
    name: 'County Sponsor',
    amount: '$185',
    desc: 'Fully sponsors one complete county visit — travel and overnight accommodation for Reuben & Grace.',
    tag: '46 counties × $185',
  },
  {
    name: 'Region Anchor',
    amount: '$500',
    desc: 'Anchors an entire regional cluster of county visits — a significant investment in the statewide mandate.',
    tag: 'High impact',
  },
]

function SupportSection() {
  const content = useContent()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="support"
      ref={ref}
      className="bg-[#1C3A2A] py-24 px-6 md:px-16"
    >
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 md:gap-20 mb-16">
            <div>
              <motion.p variants={fadeUp} className="font-mono text-[#4A7A62] text-xs tracking-widest uppercase mb-4">
                {content.support.eyebrow}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="text-[#F5F0E8] font-bold text-3xl md:text-5xl tracking-tight leading-tight mb-5"
              >
                {content.support.headline}
                <span className="font-display italic text-[#C4572B]"> {content.support.headline_italic}</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[#E8DCC8]/65 text-base leading-relaxed max-w-[54ch]">
                {content.support.body}
              </motion.p>
            </div>

            {/* Quote panel */}
            <motion.div variants={fadeUp} className="flex flex-col justify-center">
              <div className="border border-[#2E5240] rounded-4xl p-7">
                <div className="w-8 h-px bg-[#C4572B] mb-6" />
                <p className="font-display italic text-[#E8DCC8] text-xl md:text-2xl leading-relaxed mb-5">
                  "Every gift — large or small — puts Reuben & Grace one step closer to the next county."
                </p>
                <div className="space-y-2 pt-4 border-t border-[#2E5240]">
                  {['Travel & fuel', 'Overnight accommodation', 'Ministry materials & admin'].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-[#C4572B] flex-shrink-0" />
                      <span className="text-[#E8DCC8]/55 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tier cards — 2-col asymmetric grid */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {TIERS.map((tier) => (
              <motion.div
                key={tier.name}
                variants={fadeUp}
                className={`relative rounded-4xl p-7 flex flex-col gap-4 transition-all duration-300 ${
                  tier.featured
                    ? 'bg-[#C4572B] text-[#F5F0E8]'
                    : 'border border-[#2E5240] hover:border-[#4A7A62]/50'
                }`}
              >
                {/* Tag */}
                <div
                  className={`inline-flex self-start px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest ${
                    tier.featured
                      ? 'bg-[#F5F0E8]/20 text-[#F5F0E8]'
                      : 'bg-[#2E5240] text-[#4A7A62]'
                  }`}
                >
                  {tier.tag}
                </div>

                {/* Amount */}
                <div
                  className={`font-display italic text-5xl leading-none ${
                    tier.featured ? 'text-[#F5F0E8]' : 'text-[#C4572B]'
                  }`}
                >
                  {tier.amount}
                </div>

                {/* Name */}
                <div
                  className={`font-bold text-base ${
                    tier.featured ? 'text-[#F5F0E8]' : 'text-[#E8DCC8]'
                  }`}
                >
                  {tier.name}
                </div>

                {/* CTA */}
                <a
                  href={content.support.give_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs self-start transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${
                    tier.featured
                      ? 'bg-[#F5F0E8] text-[#C4572B]'
                      : 'border border-[#4A7A62]/40 text-[#E8DCC8] hover:border-[#4A7A62]'
                  }`}
                >
                  Give {tier.amount}
                  <ArrowRight weight="bold" size={12} />
                </a>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer note */}
          <motion.div
            variants={fadeUp}
            className="mt-8 border border-[#2E5240] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
          >
            <div>
              <div className="font-mono text-[#4A7A62] text-xs uppercase tracking-widest mb-1">Giving processed through</div>
              <div className="text-[#E8DCC8] font-semibold text-sm">Radiant Eternity — Unite SC Fund</div>
              <div className="text-[#E8DCC8]/45 text-xs mt-0.5">All gifts support travel, accommodation, and the costs of reaching every county.</div>
            </div>
            <a
              href={content.support.give_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-[#C4572B] text-[#F5F0E8] rounded-full font-semibold text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              Give Any Amount
              <ArrowRight weight="bold" size={13} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Content Context ─────────────────────────────────────────────────────────

export const ContentContext = React.createContext(contentFallback)
export const BrandContext = React.createContext({ logoUrl: null, brandName: 'Unite SC' })

function useBrand() { return useContext(BrandContext) }

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [siteContent, setSiteContent] = useState(null)
  const [brand, setBrand] = useState({ logoUrl: null, brandName: 'Unite SC' })

  useEffect(() => {
    // Fetch brand/logo independently — fast, isolated, can't be blocked by other field errors
    getBrandSettings().then(setBrand).catch(() => {})

    getSiteSettings().then((data) => {
      if (data) {
        // Get logo URL directly from expanded Sanity asset
        const logoUrl = data.logo?.asset?.url || null

        setSiteContent({
          brand: {
            logoUrl,
            brandName: data.brandName,
            brandTagline: data.brandTagline,
          },
          navigation: {
            nav1Label:   data.nav1Label,
            nav2Label:   data.nav2Label,
            nav3Label:   data.nav3Label,
            nav4Label:   data.nav4Label,
            navCTALabel: data.navCTALabel,
          },
          hero: {
            headline:      data.heroHeadline,
            subheadline:   data.heroSubheadline,
            description:   data.heroDescription,
            cta_primary:   data.heroCTAPrimary,
            cta_secondary: data.heroCTASecondary,
          },
          mandate: {
            eyebrow:          data.mandateEyebrow,
            headline:         data.mandateHeadline,
            headline_italic:  data.mandateHeadlineItalic,
            body:             data.mandateBody,
            pull_quote:       data.mandatePullQuote,
            pull_quote_ref:   data.mandatePullQuoteRef,
            sent_from_name:   data.mandateSentFromName,
            sent_from_church: data.mandateSentFromChurch,
            sent_from_org:    data.mandateSentFromOrg,
            sent_from_year:   data.mandateSentFromYear,
            model_heading:    data.mandateModelHeading,
            model_body:       data.mandateModelBody,
            contrasts:        data.mandateContrasts || [],
          },
          prayer: {
            eyebrow:              data.prayerEyebrow,
            headline:             data.prayerHeadline,
            headline_italic:      data.prayerHeadlineItalic,
            body:                 data.prayerBody,
            intercession_heading: data.prayerIntercessionHeading,
            intercession_body:    data.prayerIntercessionBody,
            prayer_items:         data.prayerItems || [],
            left_behind_items:    data.prayerLeftBehind || [],
          },
          sentinel: {
            eyebrow:       data.sentinelEyebrow,
            headline:      data.sentinelHeadline,
            headlineItalic: data.sentinelHeadlineItalic,
            body:          data.sentinelBody,
            pullQuote:     data.sentinelPullQuote,
            traits:        data.sentinelTraits || [],
          },
          support: {
            eyebrow:         data.supportEyebrow,
            headline:        data.supportHeadline,
            headline_italic: data.supportHeadlineItalic,
            body:            data.supportBody,
            give_url:        data.supportGiveUrl,
          },
          footer: {
            tagline:       data.footerTagline,
            contact_email: data.footerContactEmail,
          },
          scriptures: data.scriptures || [],
        })
      }
    }).catch(() => {})
  }, [])

  const content = siteContent || contentFallback

  return (
    <BrandContext.Provider value={brand}>
      <ContentContext.Provider value={content}>
        <NoiseOverlay />
        <Navbar />
        <main>
          <Hero />
          <IntroSection />
          <MandateSection />
          <CountyTracker />
          <SentinelSection />
          <PrayerSection />
          <SupportSection />
        </main>
        <Footer />
      </ContentContext.Provider>
    </BrandContext.Provider>
  )
}
