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
  name: 'countyVisit',
  title: 'County Visits',
  type: 'document',
  fields: [
    {
      name: 'countyName',
      title: 'County',
      type: 'string',
      options: {
        list: SC_COUNTIES.map((c) => ({ title: c, value: c })),
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'visited',
      title: 'Visited',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'visitDate',
      title: 'Visit Date',
      type: 'string',
      description: 'e.g. April 2026',
    },
    {
      name: 'church',
      title: 'Church',
      type: 'string',
      description: 'Name of the church or host',
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 5,
      description: 'What happened during this visit? What did God do?',
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
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      name: 'gatekeeperPublic',
      title: 'Show church name publicly',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to keep the church name private on the public map',
    },
  ],

  orderings: [
    {
      title: 'County Name',
      name: 'countyAsc',
      by: [{ field: 'countyName', direction: 'asc' }],
    },
    {
      title: 'Visited First',
      name: 'visitedFirst',
      by: [{ field: 'visited', direction: 'desc' }],
    },
  ],

  preview: {
    select: {
      title: 'countyName',
      subtitle: 'church',
      visited: 'visited',
      media: 'photos.0',
    },
    prepare({ title, subtitle, visited, media }) {
      return {
        title: `${title} County`,
        subtitle: visited ? `Visited — ${subtitle || ''}` : 'Not yet visited',
        media,
      }
    },
  },
}
