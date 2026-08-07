import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'
import Admin from './Admin.jsx'
import PrayerHub from './PrayerHub.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/prayer" element={<PrayerHub />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {/* Inside the router so client-side navigations are tracked, not just
          the initial page load. */}
      <Analytics />
    </BrowserRouter>
  </StrictMode>,
)
