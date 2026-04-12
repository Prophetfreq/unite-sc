import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import siteSettings from './schemas/siteSettings'
import countyVisit from './schemas/countyVisit'
import prayerUpdate from './schemas/prayerUpdate'
import journalEntry from './schemas/journalEntry'
import teamMember from './schemas/teamMember'

export default defineConfig({
  name: 'default',
  title: 'Unite SC',

  projectId: 'ubyv53ok',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Unite SC +')
          .items([

            // ── Singleton ─────────────────────────────────────────────────
            S.listItem()
              .title('🎨 Site Settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
                  .title('Site Settings')
              ),

            S.divider(),

            // ── Journey ───────────────────────────────────────────────────
            S.listItem()
              .title('🗺️ Journey Journal')
              .schemaType('journalEntry')
              .child(
                S.documentTypeList('journalEntry')
                  .title('Journey Journal')
                  .defaultOrdering([{ field: 'date', direction: 'desc' }])
              ),

            S.listItem()
              .title('📍 County Visits')
              .schemaType('countyVisit')
              .child(
                S.documentTypeList('countyVisit')
                  .title('County Visits')
              ),

            S.divider(),

            // ── Community ─────────────────────────────────────────────────
            S.listItem()
              .title('🙏 Prayer Updates')
              .schemaType('prayerUpdate')
              .child(
                S.documentTypeList('prayerUpdate')
                  .title('Prayer Updates')
              ),

            S.listItem()
              .title('👥 Team')
              .schemaType('teamMember')
              .child(
                S.documentTypeList('teamMember')
                  .title('Team')
                  .defaultOrdering([{ field: 'order', direction: 'asc' }])
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: [siteSettings, countyVisit, prayerUpdate, journalEntry, teamMember],
  },
})
