import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import siteSettings from './schemas/siteSettings'
import countyVisit from './schemas/countyVisit'
import prayerUpdate from './schemas/prayerUpdate'

export default defineConfig({
  name: 'default',
  title: 'Unite SC',

  projectId: 'ubyv53ok',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Unite SC')
          .items([
            // Singleton — Site Settings
            S.listItem()
              .title('Site Content')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),

            S.divider(),

            // County Visits
            S.listItem()
              .title('County Visits')
              .schemaType('countyVisit')
              .child(S.documentTypeList('countyVisit').title('County Visits')),

            // Prayer Updates
            S.listItem()
              .title('Prayer Updates')
              .schemaType('prayerUpdate')
              .child(S.documentTypeList('prayerUpdate').title('Prayer Updates')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: [siteSettings, countyVisit, prayerUpdate],
  },
})
