import React, { useState, useEffect, useRef, useContext } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowRight, Circle, X } from '@phosphor-icons/react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import contentFallback from './content.json'
import { getSiteSettings } from './sanityClient'
import { supabase } from './supabase.js'

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
  const brand = content.brand || {}

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
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-5 py-3 rounded-full transition-all duration-500 ${
        scrolled
          ? 'bg-[#F5F0E8]/85 backdrop-blur-xl border border-[#1C3A2A]/12 shadow-[0_4px_24px_-4px_rgba(28,58,42,0.10)]'
          : 'bg-transparent'
      }`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo or brand name */}
      {brand.logoUrl ? (
        <img
          src={brand.logoUrl}
          alt={brand.brandName || 'Unite SC'}
          className="h-7 w-auto object-contain"
          style={{ filter: scrolled ? 'none' : 'brightness(0) invert(1)' }}
        />
      ) : (
        <span
          className={`font-bold tracking-tight text-sm transition-colors duration-400 ${
            scrolled ? 'text-[#1C3A2A]' : 'text-[#F5F0E8]'
          }`}
        >
          {brand.brandName || 'Unite SC'}
        </span>
      )}

      <div className="hidden md:flex items-center gap-5">
        {navLinks.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className={`text-xs font-medium transition-all duration-300 hover:-translate-y-px ${
              scrolled ? 'text-[#6B6B5A] hover:text-[#1C3A2A]' : 'text-[#F5F0E8]/65 hover:text-[#F5F0E8]'
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <a
        href="#counties"
        className={`text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${
          scrolled
            ? 'bg-[#C4572B] text-[#F5F0E8]'
            : 'bg-[#F5F0E8]/12 border border-[#F5F0E8]/25 text-[#F5F0E8]'
        }`}
      >
        {nav.navCTALabel || 'View Counties'}
      </a>
    </motion.nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const content = useContent()
  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-end pb-16 md:pb-20 px-6 md:px-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/seed/forestpath46/1600/900"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A10] via-[#1C3A2A]/88 to-[#1C3A2A]/40" />
        <div className="absolute inset-0 bg-[#0F2219]/35" />
      </div>

      <motion.div
        className="relative z-10 max-w-[1400px] mx-auto w-full"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={fadeUp}
          className="font-mono text-[#E8DCC8]/80 text-xs tracking-widest uppercase mb-5"
        >
          Reuben & Grace Kora — A Prophetic Mandate — 2026
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="text-[#F5F0E8] font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-none mb-1"
        >
          {content.hero.headline}
        </motion.h1>

        <motion.div variants={fadeUp}>
          <span className="font-display italic text-[#C4572B] text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-none block mb-6">
            {content.hero.subheadline}
          </span>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-[#E8DCC8] text-base md:text-lg max-w-[52ch] leading-relaxed mb-8 [text-shadow:0_1px_12px_rgba(10,26,16,0.6)]"
        >
          {content.hero.description}
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-3 items-center mb-12">
          <a
            href="#counties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C4572B] text-[#F5F0E8] rounded-full font-semibold text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            {content.hero.cta_primary}
            <ArrowRight weight="bold" size={14} />
          </a>
          <a
            href="#the-mandate"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#F5F0E8]/22 text-[#F5F0E8] rounded-full font-medium text-sm transition-all duration-300 hover:border-[#F5F0E8]/45 hover:-translate-y-px"
          >
            {content.hero.cta_secondary}
          </a>
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-8 md:gap-12">
          {[
            { value: '46', label: 'Counties' },
            { value: '4', label: 'Regions' },
            { value: '18', label: 'Months' },
            { value: '2', label: 'Sent Ones' },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-mono text-[#C4572B] text-2xl font-bold leading-none mb-1">{s.value}</div>
              <div className="text-[#E8DCC8]/45 text-xs tracking-widest uppercase font-mono">{s.label}</div>
            </div>
          ))}
        </motion.div>
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

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [siteContent, setSiteContent] = useState(null)

  useEffect(() => {
    getSiteSettings().then((data) => {
      if (data) {
        // Build logo URL from Sanity image asset if present
        const logoUrl = data.logo?.asset?._ref
          ? `https://cdn.sanity.io/images/ubyv53ok/production/${
              data.logo.asset._ref.replace('image-', '').replace(/-([a-z]+)$/, '.$1')
            }`
          : null

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
    <ContentContext.Provider value={content}>
      <NoiseOverlay />
      <Navbar />
      <main>
        <Hero />
        <MandateSection />
        <CountyTracker />
        <SentinelSection />
        <PrayerSection />
        <SupportSection />
      </main>
      <Footer />
    </ContentContext.Provider>
  )
}
