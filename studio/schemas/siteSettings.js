export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'mandate', title: 'Mandate' },
    { name: 'prayer', title: 'Prayer' },
    { name: 'support', title: 'Support' },
    { name: 'footer', title: 'Footer' },
    { name: 'scriptures', title: 'Scriptures' },
  ],
  fields: [
    // ─── Hero ───────────────────────────────────────────────────────────────
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
            { name: 'is', title: 'IS', type: 'string' },
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
            { name: 'ref', title: 'Reference', type: 'string' },
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
