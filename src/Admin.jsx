import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, supabaseAdmin } from './supabase.js'

const ALL_COUNTIES = [
  'Abbeville','Aiken','Allendale','Anderson','Bamberg','Barnwell','Beaufort',
  'Berkeley','Calhoun','Charleston','Cherokee','Chester','Chesterfield',
  'Clarendon','Colleton','Darlington','Dillon','Dorchester','Edgefield',
  'Fairfield','Florence','Georgetown','Greenville','Greenwood','Hampton',
  'Horry','Jasper','Kershaw','Lancaster','Laurens','Lee','Lexington',
  'McCormick','Marion','Marlboro','Newberry','Oconee','Orangeburg','Pickens',
  'Richland','Saluda','Spartanburg','Sumter','Union','Williamsburg','York',
].sort()

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'uniteSC2026'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <label className="block font-mono text-[#2E5240] text-xs uppercase tracking-widest mb-2">
      {children}
    </label>
  )
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-white border border-[#1C3A2A]/15 rounded-2xl px-4 py-3 text-[#1A1A1A] text-sm placeholder-[#9A9A8A] focus:outline-none focus:border-[#2E5240]/50 focus:ring-2 focus:ring-[#2E5240]/10 transition-all ${className}`}
      {...props}
    />
  )
}

function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full bg-white border border-[#1C3A2A]/15 rounded-2xl px-4 py-3 text-[#1A1A1A] text-sm placeholder-[#9A9A8A] focus:outline-none focus:border-[#2E5240]/50 focus:ring-2 focus:ring-[#2E5240]/10 transition-all resize-none ${className}`}
      {...props}
    />
  )
}

function Toast({ message, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-semibold shadow-xl ${
        type === 'success'
          ? 'bg-[#2E5240] text-white'
          : 'bg-[#C4572B] text-white'
      }`}
    >
      {message}
    </motion.div>
  )
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      onLogin()
    } else {
      setError(true)
      setPassword('')
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0F2219] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-8">
          <p className="font-mono text-[#4A7A62] text-xs tracking-widest uppercase mb-3">
            Unite South Carolina
          </p>
          <h1 className="text-white font-bold text-3xl tracking-tight">Admin Panel</h1>
          <p className="text-[#E8DCC8]/50 text-sm mt-2">Log county visits and upload photos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Password</Label>
            <motion.div animate={error ? { x: [-6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.3 }}>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </motion.div>
            {error && (
              <p className="text-[#C4572B] text-xs font-mono mt-2">Incorrect password</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-[#2E5240] text-white font-semibold text-sm py-3.5 rounded-2xl hover:bg-[#3A6450] active:scale-[0.98] transition-all duration-200"
          >
            Enter
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// ─── County Card (in list) ────────────────────────────────────────────────────

function CountyCard({ visit, countyName, onEdit }) {
  return (
    <div
      onClick={() => onEdit(countyName, visit)}
      className="bg-white border border-[#1C3A2A]/10 rounded-3xl p-5 cursor-pointer hover:border-[#2E5240]/30 hover:shadow-sm active:scale-[0.99] transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${visit?.visited ? 'bg-[#2E5240]' : 'bg-[#D4CDB8]'}`} />
          <span className="font-bold text-[#1A1A1A] text-sm">{countyName}</span>
        </div>
        <span className="font-mono text-[#9A9A8A] text-xs">
          {visit?.visited ? visit.date || 'Visited' : 'Not yet'}
        </span>
      </div>
      {visit?.church && (
        <p className="text-[#6B6B5A] text-xs mt-1 truncate">{visit.church}</p>
      )}
      {visit?.photos?.length > 0 && (
        <p className="font-mono text-[#4A7A62] text-xs mt-2">
          {visit.photos.length} photo{visit.photos.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}

// ─── Visit Form ───────────────────────────────────────────────────────────────

function VisitForm({ countyName, existing, onSave, onCancel }) {
  const [form, setForm] = useState({
    county_name: countyName || '',
    visited: existing?.visited || false,
    visit_date: existing?.date || '',
    church_name: existing?.church || '',
    summary: existing?.summary || '',
  })
  const [photos, setPhotos] = useState(existing?.photos || [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handlePhotoUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)

    const uploaded = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress(`Uploading ${i + 1} of ${files.length}...`)

      // Sanitize filename
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `${form.county_name}/${fileName}`

      const { error } = await supabaseAdmin.storage
        .from('county-photos')
        .upload(path, file, { upsert: false })

      if (!error) {
        const { data: urlData } = supabaseAdmin.storage
          .from('county-photos')
          .getPublicUrl(path)
        uploaded.push(urlData.publicUrl)
      }
    }

    setPhotos((prev) => [...prev, ...uploaded])
    setUploading(false)
    setUploadProgress(null)
    e.target.value = ''
  }

  function removePhoto(url) {
    setPhotos((prev) => prev.filter((p) => p !== url))
  }

  async function handleSave() {
    if (!form.county_name) return
    setSaving(true)

    const payload = {
      county_name: form.county_name,
      visited: form.visited,
      visit_date: form.visit_date || null,
      church_name: form.church_name || null,
      summary: form.summary || null,
      photos,
    }

    const { error } = await supabaseAdmin
      .from('county_visits')
      .upsert(payload, { onConflict: 'county_name' })

    setSaving(false)
    if (error) {
      onSave(false, error.message)
    } else {
      onSave(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full"
    >
      {/* Form header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1C3A2A]/15 text-[#6B6B5A] hover:bg-[#1C3A2A]/6 transition-colors text-lg leading-none"
        >
          ←
        </button>
        <h2 className="font-bold text-[#1A1A1A] text-xl">
          {countyName ? `${countyName} County` : 'New Visit'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pb-4">
        {/* County select (only if no county pre-selected) */}
        {!countyName && (
          <div>
            <Label>County</Label>
            <select
              value={form.county_name}
              onChange={(e) => set('county_name', e.target.value)}
              className="w-full bg-white border border-[#1C3A2A]/15 rounded-2xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none focus:border-[#2E5240]/50 focus:ring-2 focus:ring-[#2E5240]/10 transition-all appearance-none"
            >
              <option value="">Select a county…</option>
              {ALL_COUNTIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Visited toggle */}
        <div>
          <Label>Status</Label>
          <button
            type="button"
            onClick={() => set('visited', !form.visited)}
            className={`flex items-center gap-3 w-full border rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              form.visited
                ? 'bg-[#2E5240]/8 border-[#2E5240]/30 text-[#2E5240]'
                : 'bg-white border-[#1C3A2A]/15 text-[#9A9A8A]'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
              form.visited ? 'border-[#2E5240] bg-[#2E5240]' : 'border-[#D4CDB8]'
            }`}>
              {form.visited && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            {form.visited ? 'Visited ✓' : 'Not yet visited'}
          </button>
        </div>

        {/* Visit date */}
        <div>
          <Label>Visit Date</Label>
          <Input
            type="text"
            placeholder="e.g. April 2026"
            value={form.visit_date}
            onChange={(e) => set('visit_date', e.target.value)}
          />
        </div>

        {/* Church */}
        <div>
          <Label>Church</Label>
          <Input
            type="text"
            placeholder="e.g. First Baptist Columbia"
            value={form.church_name}
            onChange={(e) => set('church_name', e.target.value)}
          />
        </div>

        {/* Summary */}
        <div>
          <Label>Summary</Label>
          <Textarea
            rows={4}
            placeholder="What happened during this visit? What did God do?"
            value={form.summary}
            onChange={(e) => set('summary', e.target.value)}
          />
        </div>

        {/* Photos */}
        <div>
          <Label>Photos</Label>

          {/* Upload button */}
          <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-2xl py-5 text-sm font-semibold cursor-pointer transition-all duration-200 ${
            uploading
              ? 'border-[#2E5240]/30 text-[#9A9A8A] cursor-not-allowed'
              : 'border-[#1C3A2A]/20 text-[#6B6B5A] hover:border-[#2E5240]/40 hover:text-[#2E5240]'
          }`}>
            <span>{uploading ? uploadProgress : '+ Add Photos'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </label>

          {/* Photo grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {photos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(url)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save button */}
      <div className="pt-4 border-t border-[#1C3A2A]/8">
        <button
          onClick={handleSave}
          disabled={saving || uploading || !form.county_name}
          className="w-full bg-[#2E5240] text-white font-semibold text-sm py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3A6450] active:scale-[0.98] transition-all duration-200"
        >
          {saving ? 'Saving…' : 'Save Visit'}
        </button>
      </div>
    </motion.div>
  )
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === 'true')
  const [visits, setVisits] = useState({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // { countyName, existing }
  const [filter, setFilter] = useState('all') // 'all' | 'visited' | 'pending'
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  function handleLogin() {
    sessionStorage.setItem('admin_auth', 'true')
    setAuthed(true)
  }

  useEffect(() => {
    if (!authed) return
    fetchVisits()
  }, [authed])

  async function fetchVisits() {
    setLoading(true)
    const { data } = await supabase
      .from('county_visits')
      .select('county_name, visited, visit_date, church_name, summary, photos')

    const map = {}
    for (const row of data || []) {
      map[row.county_name] = {
        visited: row.visited,
        date: row.visit_date,
        church: row.church_name,
        summary: row.summary,
        photos: row.photos || [],
      }
    }
    setVisits(map)
    setLoading(false)
  }

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSave(success, errorMsg) {
    if (success) {
      await fetchVisits()
      setEditing(null)
      showToast('Visit saved!')
    } else {
      showToast(errorMsg || 'Something went wrong', 'error')
    }
  }

  if (!authed) return <LoginScreen onLogin={handleLogin} />

  const visitedCount = Object.values(visits).filter((v) => v?.visited).length

  const filteredCounties = ALL_COUNTIES.filter((c) => {
    const matchSearch = c.toLowerCase().includes(search.toLowerCase())
    const visit = visits[c]
    const matchFilter =
      filter === 'all' ||
      (filter === 'visited' && visit?.visited) ||
      (filter === 'pending' && !visit?.visited)
    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-dvh bg-[#F5F0E8]">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {editing ? (
            <VisitForm
              key="form"
              countyName={editing.countyName}
              existing={editing.existing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="font-mono text-[#4A7A62] text-xs tracking-widest uppercase mb-1">
                    Unite SC — Admin
                  </p>
                  <h1 className="font-bold text-[#1A1A1A] text-2xl tracking-tight">County Visits</h1>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#2E5240] text-2xl">{visitedCount}</div>
                  <div className="font-mono text-[#9A9A8A] text-xs">of 46</div>
                </div>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search county…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-[#1C3A2A]/15 rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#9A9A8A] focus:outline-none focus:border-[#2E5240]/40 focus:ring-2 focus:ring-[#2E5240]/10 transition-all mb-3"
              />

              {/* Filter tabs */}
              <div className="flex gap-2 mb-6">
                {['all', 'visited', 'pending'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                      filter === f
                        ? 'bg-[#2E5240] text-white'
                        : 'bg-white border border-[#1C3A2A]/12 text-[#6B6B5A] hover:border-[#2E5240]/25'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* County list */}
              {loading ? (
                <div className="font-mono text-[#9A9A8A] text-xs text-center py-12 animate-pulse">
                  Loading…
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCounties.map((county) => (
                    <CountyCard
                      key={county}
                      countyName={county}
                      visit={visits[county]}
                      onEdit={(name, visit) => setEditing({ countyName: name, existing: visit })}
                    />
                  ))}
                </div>
              )}

              {/* Logout */}
              <button
                onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false) }}
                className="w-full mt-8 py-3 text-[#9A9A8A] font-mono text-xs hover:text-[#6B6B5A] transition-colors"
              >
                Log out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
