import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {TextIcon} from '@sanity/icons'
import {createClient} from '@sanity/client'

const types = ['spot', 'member', 'imageAsset', 'videoAsset']

const countQuery = (type) => `count(*[_type == "${type}"])`

const client = createClient({
  projectId: 'n6ou6qni',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_EDIT_TOKEN,
  apiVersion: '2024-01-01',
})

const promises = types.map((type) => client.fetch(countQuery(type)))
const counts = await Promise.all(promises).then((results) =>
  results.map((result, index) => ({type: types[index], count: result})),
)

export default defineConfig({
  icon: TextIcon,
  name: 'default',
  title: 'Spotted Comic Sans',

  projectId: 'n6ou6qni',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('spot').title(
              `Spots (${counts.find((c) => c.type === 'spot').count})`,
            ),
            S.documentTypeListItem('member').title(
              `Members (${counts.find((c) => c.type === 'member').count})`,
            ),
            S.divider().title(
              `Media (${counts.find((c) => c.type === 'imageAsset').count + counts.find((c) => c.type === 'videoAsset').count})`,
            ),
            S.documentTypeListItem('imageAsset').title(
              `Images (${counts.find((c) => c.type === 'imageAsset').count})`,
            ),
            S.documentTypeListItem('videoAsset').title(
              `Videos (${counts.find((c) => c.type === 'videoAsset').count})`,
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
