export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'brand',      title: '🎨 Brand & Logo' },
    { name: 'navigation', title: '🔗 Navigation' },
    { name: 'hero',       title: '🏠 Hero' },
    { name: 'stats',      title: '📊 Stats' },
    { name: 'mandate',    title: '📜 Mandate' },
    { name: 'prayer',     title: '🙏 Prayer' },
    { name: 'sentinel',   title: '🗝️ Sentinel' },
    { name: 'support',    title: '💚 Support & Giving' },
    { name: 'footer',     title: '🔻 Footer' },
    { name: 'scriptures', title: '📖 Scriptures' },
  ],
  fields: [

    // ─── Brand & Logo ─────────────────────────────────────────────────────────
    {
      name: 'logo',
      title: 'Logo Image',
      type: 'image',
      group: 'brand',
      description: 'Upload your logo. Recommended: PNG with transparent background, at least 400px wide.',
      options: { hotspot: true },
    },
    {
      name: 'brandName',
      title: 'Brand Name',
      type: 'string',
      group: 'brand',
      description: 'Shown in the navbar when no logo is uploaded. Example: "Unite SC"',
    },
    {
      name: 'brandTagline',
      title: 'Brand Tagline',
      type: 'string',
      group: 'brand',
      description: 'Short tagline shown in the footer under the logo.',
    },

    // ─── Navigation ───────────────────────────────────────────────────────────
    {
      name: 'nav1Label',
      title: 'Nav Link 1 — Label',
      type: 'string',
      group: 'navigation',
      initialValue: 'The Mandate',
    },
    {
      name: 'nav2Label',
      title: 'Nav Link 2 — Label',
      type: 'string',
      group: 'navigation',
      initialValue: 'Counties',
    },
    {
      name: 'nav3Label',
      title: 'Nav Link 3 — Label',
      type: 'string',
      group: 'navigation',
      initialValue: 'The Sentinel',
    },
    {
      name: 'nav4Label',
      title: 'Nav Link 4 — Label',
      type: 'string',
      group: 'navigation',
      initialValue: 'Support',
    },
    {
      name: 'navCTALabel',
      title: 'Nav CTA Button — Label',
      type: 'string',
      group: 'navigation',
      initialValue: 'View Counties',
    },

    // ─── Hero ─────────────────────────────────────────────────────────────────
    {
      name: 'heroHeadline',
      title: 'Hero — Main Headline',
      type: 'string',
      group: 'hero',
    },
    {
      name: 'heroSubheadline',
      title: 'Hero — Italic Subheadline',
      type: 'string',
      group: 'hero',
    },
    {
      name: 'heroDescription',
      title: 'Hero — Description',
      type: 'text',
      rows: 3,
      group: 'hero',
    },
    {
      name: 'heroCTAPrimary',
      title: 'Hero — Primary Button Text',
      type: 'string',
      group: 'hero',
    },
    {
      name: 'heroCTASecondary',
      title: 'Hero — Secondary Button Text',
      type: 'string',
      group: 'hero',
    },

    // ─── Mandate ─────────────────────────────────────────────────────────────
    {
      name: 'mandateEyebrow',
      title: 'Mandate — Eyebrow Label',
      type: 'string',
      group: 'mandate',
    },
    {
      name: 'mandateHeadline',
      title: 'Mandate — Headline',
      type: 'string',
      group: 'mandate',
    },
    {
      name: 'mandateHeadlineItalic',
      title: 'Mandate — Headline (italic part)',
      type: 'string',
      group: 'mandate',
    },
    {
      name: 'mandateBody',
      title: 'Mandate — Body Text',
      type: 'text',
      rows: 5,
      group: 'mandate',
    },
    {
      name: 'mandatePullQuote',
      title: 'Mandate — Pull Quote',
      type: 'text',
      rows: 3,
      group: 'mandate',
    },
    {
      name: 'mandatePullQuoteRef',
      title: 'Mandate — Pull Quote Reference',
      type: 'string',
      group: 'mandate',
    },
    {
      name: 'mandateSentFromName',
      title: 'Mandate — Sent From Name',
      type: 'string',
      group: 'mandate',
    },
    {
      name: 'mandateSentFromChurch',
      title: 'Mandate — Sent From Church',
      type: 'string',
      group: 'mandate',
    },
    {
      name: 'mandateSentFromOrg',
      title: 'Mandate — Sent From Organisation',
      type: 'string',
      group: 'mandate',
    },
    {
      name: 'mandateSentFromYear',
      title: 'Mandate — Year/Initiative Label',
      type: 'string',
      group: 'mandate',
    },
    {
      name: 'mandateModelHeading',
      title: 'Mandate — Model Heading',
      type: 'string',
      group: 'mandate',
    },
    {
      name: 'mandateModelBody',
      title: 'Mandate — Model Body',
      type: 'text',
      rows: 3,
      group: 'mandate',
    },
    {
      name: 'mandateContrasts',
      title: 'Mandate — What This Is / Is Not',
      type: 'array',
      group: 'mandate',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'not', title: 'NOT', type: 'string' },
            { name: 'is',  title: 'IS',  type: 'string' },
          ],
          preview: {
            select: { title: 'is', subtitle: 'not' },
          },
        },
      ],
    },

    // ─── Prayer ───────────────────────────────────────────────────────────────
    {
      name: 'prayerEyebrow',
      title: 'Prayer — Eyebrow Label',
      type: 'string',
      group: 'prayer',
    },
    {
      name: 'prayerHeadline',
      title: 'Prayer — Headline',
      type: 'string',
      group: 'prayer',
    },
    {
      name: 'prayerHeadlineItalic',
      title: 'Prayer — Headline (italic part)',
      type: 'string',
      group: 'prayer',
    },
    {
      name: 'prayerBody',
      title: 'Prayer — Body Text',
      type: 'text',
      rows: 4,
      group: 'prayer',
    },
    {
      name: 'prayerIntercessionHeading',
      title: 'Prayer — Intercession Team Heading',
      type: 'string',
      group: 'prayer',
    },
    {
      name: 'prayerIntercessionBody',
      title: 'Prayer — Intercession Team Body',
      type: 'text',
      rows: 3,
      group: 'prayer',
    },
    {
      name: 'prayerItems',
      title: 'Prayer — Prayer Points',
      type: 'array',
      group: 'prayer',
      of: [{ type: 'string' }],
    },
    {
      name: 'prayerLeftBehind',
      title: 'Prayer — What Is Left Behind',
      type: 'array',
      group: 'prayer',
      of: [{ type: 'string' }],
    },

    // ─── Sentinel ─────────────────────────────────────────────────────────────
    {
      name: 'sentinelEyebrow',
      title: 'Sentinel — Eyebrow Label',
      type: 'string',
      group: 'sentinel',
      initialValue: 'Who You Are Looking For',
    },
    {
      name: 'sentinelHeadline',
      title: 'Sentinel — Headline',
      type: 'string',
      group: 'sentinel',
      initialValue: 'Not the most famous.',
    },
    {
      name: 'sentinelHeadlineItalic',
      title: 'Sentinel — Headline (italic part)',
      type: 'string',
      group: 'sentinel',
      initialValue: 'The most faithful.',
    },
    {
      name: 'sentinelBody',
      title: 'Sentinel — Body Text',
      type: 'text',
      rows: 4,
      group: 'sentinel',
      initialValue: 'In every county there is a person — a pastor, prophet, apostolic voice, or prayer leader — who holds the spiritual gate of that area. They may not be well known outside their county. But they are trusted across streams, and the territory responds when they move.',
    },
    {
      name: 'sentinelPullQuote',
      title: 'Sentinel — Pull Quote',
      type: 'string',
      group: 'sentinel',
      initialValue: '"Not the largest church. Not the biggest platform. The deepest root."',
    },
    {
      name: 'sentinelTraits',
      title: 'Sentinel — Traits / Characteristics',
      type: 'array',
      group: 'sentinel',
      description: 'Each trait card shown on the right side of the Sentinel section.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Trait Label', type: 'string' },
            { name: 'desc',  title: 'Trait Description', type: 'text', rows: 2 },
          ],
          preview: {
            select: { title: 'label', subtitle: 'desc' },
          },
        },
      ],
    },

    // ─── Support ──────────────────────────────────────────────────────────────
    {
      name: 'supportEyebrow',
      title: 'Support — Eyebrow Label',
      type: 'string',
      group: 'support',
    },
    {
      name: 'supportHeadline',
      title: 'Support — Headline',
      type: 'string',
      group: 'support',
    },
    {
      name: 'supportHeadlineItalic',
      title: 'Support — Headline (italic part)',
      type: 'string',
      group: 'support',
    },
    {
      name: 'supportBody',
      title: 'Support — Body Text',
      type: 'text',
      rows: 3,
      group: 'support',
    },
    {
      name: 'supportGiveUrl',
      title: 'Support — Giving Link URL',
      type: 'url',
      group: 'support',
      description: 'Fallback giving URL (used if no tiers are defined below).',
    },
    {
      name: 'supportTiers',
      title: 'Support — Giving Tiers',
      type: 'array',
      group: 'support',
      description: 'Each card in the support/giving section. Mark one as Featured to highlight it.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name',     title: 'Tier Name',     type: 'string',  validation: (Rule) => Rule.required() },
            { name: 'amount',   title: 'Amount',        type: 'string',  description: 'e.g. "$50/mo" or "$185"' },
            { name: 'desc',     title: 'Description',   type: 'text',    rows: 2 },
            { name: 'tag',      title: 'Badge Label',   type: 'string',  description: 'e.g. "Most popular" or "Start here"' },
            { name: 'url',      title: 'Giving URL',    type: 'url',     validation: (Rule) => Rule.required() },
            { name: 'featured', title: 'Featured (highlighted card)', type: 'boolean', initialValue: false },
          ],
          preview: {
            select: { title: 'name', subtitle: 'amount', featured: 'featured' },
            prepare({ title, subtitle, featured }) {
              return { title: `${featured ? '⭐ ' : ''}${title}`, subtitle }
            },
          },
        },
      ],
    },

    // ─── Stats ────────────────────────────────────────────────────────────────
    {
      name: 'stats',
      title: 'Stats — Key Numbers',
      type: 'array',
      group: 'stats',
      description: 'Numbers shown in the intro / mission section (e.g. 46 Counties, 4 Regions).',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', title: 'Number / Value', type: 'string', description: 'e.g. "46"' },
            { name: 'label', title: 'Label',          type: 'string', description: 'e.g. "Counties"' },
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        },
      ],
    },

    // ─── Footer ───────────────────────────────────────────────────────────────
    {
      name: 'footerTagline',
      title: 'Footer — Tagline',
      type: 'string',
      group: 'footer',
    },
    {
      name: 'footerContactEmail',
      title: 'Footer — Contact Email',
      type: 'string',
      group: 'footer',
    },

    // ─── Scriptures ───────────────────────────────────────────────────────────
    {
      name: 'scriptures',
      title: 'Scriptures',
      type: 'array',
      group: 'scriptures',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'verse', title: 'Verse', type: 'text', rows: 3 },
            { name: 'ref',   title: 'Reference', type: 'string' },
          ],
          preview: {
            select: { title: 'ref', subtitle: 'verse' },
          },
        },
      ],
    },
  ],

  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
}
