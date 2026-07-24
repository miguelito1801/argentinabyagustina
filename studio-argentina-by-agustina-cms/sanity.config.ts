import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'Argentina by Agustina CMS',

  projectId: 'brjqcwkq',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({schemaType}) => schemaType !== 'websiteSettings'),
  },

  document: {
    actions: (previousActions, context) =>
      context.schemaType === 'websiteSettings'
        ? previousActions.filter(({action}) => action && ['publish', 'discardChanges'].includes(action))
        : previousActions,
  },
})
