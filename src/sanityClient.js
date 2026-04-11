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
