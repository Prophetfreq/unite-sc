import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'ubyv53ok',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

export async function getSiteSettings() {
  return sanity.fetch(`*[_id == "siteSettings"][0]`)
}
