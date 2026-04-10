export default {
  name: 'prayerUpdate',
  title: 'Prayer Updates',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Date',
      type: 'date',
    },
    {
      name: 'body',
      title: 'Prayer Request / Update',
      type: 'text',
      rows: 6,
    },
    {
      name: 'county',
      title: 'Related County (optional)',
      type: 'string',
    },
    {
      name: 'urgent',
      title: 'Mark as Urgent',
      type: 'boolean',
      initialValue: false,
    },
  ],

  orderings: [
    {
      title: 'Newest First',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'date',
      urgent: 'urgent',
    },
    prepare({ title, subtitle, urgent }) {
      return {
        title: urgent ? `URGENT: ${title}` : title,
        subtitle,
      }
    },
  },
}
