import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'ubyv53ok',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

export async function getSiteSettings() {
  return sanity.fetch(`*[_id == "siteSettings"][0]{
    ...,
    logo{
      asset->{url}
    }
  }`)
}

export async function getBrandSettings() {
  const data = await sanity.fetch(`*[_id == "siteSettings"][0]{
    brandName,
    brandTagline,
    logo{ asset->{ url } },
    nav1Label, nav2Label, nav3Label, nav4Label, navCTALabel
  }`)
  return {
    logoUrl: data?.logo?.asset?.url || null,
    brandName: data?.brandName || 'Unite SC',
    brandTagline: data?.brandTagline || null,
    nav1Label: data?.nav1Label || null,
    nav2Label: data?.nav2Label || null,
    nav3Label: data?.nav3Label || null,
    nav4Label: data?.nav4Label || null,
    navCTALabel: data?.navCTALabel || null,
  }
}

// County visits live in Sanity (countyVisit documents) — edited via Sanity
// Studio, replacing the old Supabase county_visits table which auto-paused
// on the free tier and took the map down with it.
// Returns a lookup keyed by county name, the shape SCMap/CountyModal expect.
export async function getCountyVisits() {
  const rows = await sanity.fetch(`*[_type == "countyVisit"]{
    countyName,
    visited,
    visitDate,
    church,
    gatekeeperPublic,
    summary,
    "photos": photos[].asset->url
  }`)
  const visits = {}
  for (const row of rows || []) {
    visits[row.countyName] = {
      visited: row.visited === true,
      date: row.visitDate || null,
      church: row.gatekeeperPublic === false ? null : row.church || null,
      summary: row.summary || null,
      photos: (row.photos || []).filter(Boolean),
    }
  }
  return visits
}

export async function getSupportTiers() {
  const data = await sanity.fetch(`*[_id == "siteSettings"][0]{
    supportTiers[]{ name, amount, desc, tag, url, featured }
  }`)
  return data?.supportTiers || null
}

export async function getSentinelTraits() {
  const data = await sanity.fetch(`*[_id == "siteSettings"][0]{
    sentinelTraits[]{ label, desc }
  }`)
  return data?.sentinelTraits || null
}

export async function getStats() {
  const data = await sanity.fetch(`*[_id == "siteSettings"][0]{
    stats[]{ value, label }
  }`)
  return data?.stats || null
}
