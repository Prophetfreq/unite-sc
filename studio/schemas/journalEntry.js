const SC_COUNTIES = [
  'Abbeville','Aiken','Allendale','Anderson','Bamberg','Barnwell','Beaufort',
  'Berkeley','Calhoun','Charleston','Cherokee','Chester','Chesterfield',
  'Clarendon','Colleton','Darlington','Dillon','Dorchester','Edgefield',
  'Fairfield','Florence','Georgetown','Greenville','Greenwood','Hampton',
  'Horry','Jasper','Kershaw','Lancaster','Laurens','Lee','Lexington',
  'McCormick','Marion','Marlboro','Newberry','Oconee','Orangeburg','Pickens',
  'Richland','Saluda','Spartanburg','Sumter','Union','Williamsburg','York',
]

export default {
  name: 'journalEntry',
  title: 'Journey Journal',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Entry Title',
      type: 'string',
      description: 'e.g. "What God did in Aiken County"',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'county',
      title: 'County',
      type: 'string',
      options: {
        list: SC_COUNTIES.map((c) => ({ title: c, value: c })),
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Visit Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'body',
      title: 'What God Did',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
      ],
      description: 'Write freely — what happened, what was said, what God moved on.',
    },
    {
      name: 'scripture',
      title: 'Scripture Released',
      type: 'string',
      description: 'e.g. "Isaiah 62:1 — For Zion\'s sake I will not keep silent"',
    },
    {
      name: 'gatekeeper',
      title: 'Gatekeeper (Pastor / Leader)',
      type: 'string',
      description: 'Name of the person who received you — kept private unless you choose to share.',
    },
    {
      name: 'gatekeeperPublic',
      title: 'Show gatekeeper name publicly',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'photos',
      title: 'Photos',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'published',
      title: 'Publish to site',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle on when ready to show this entry publicly.',
    },
  ],

  orderings: [
    {
      title: 'Newest First',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'County A–Z',
      name: 'countyAsc',
      by: [{ field: 'county', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      title: 'title',
      county: 'county',
      date: 'date',
      published: 'published',
      media: 'photos.0',
    },
    prepare({ title, county, date, published, media }) {
      return {
        title: `${county ? county + ' — ' : ''}${title}`,
        subtitle: `${date || 'No date'} · ${published ? '✅ Published' : '⏳ Draft'}`,
        media,
      }
    },
  },
}
