import {defineConfig, definePlugin} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {Dashboard} from './components/Dashboard'
import {agustinaTheme} from './theme'

const dashboardPlugin = definePlugin({
  name: 'argentina-by-agustina-dashboard',
  tools: [
    {
      name: 'inicio',
      title: 'Inicio',
      component: Dashboard,
    },
  ],
})

export default defineConfig({
  name: 'default',
  title: 'Argentina by Agustina',

  projectId: 'brjqcwkq',
  dataset: 'production',
  theme: agustinaTheme,

  // El orden de los plugins también define el orden de las pestañas.
  // El panel Inicio se carga primero para que Agustina siempre llegue a su resumen.
  plugins: [
    dashboardPlugin(),
    structureTool({name: 'contenido', title: 'Contenido', structure}),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({schemaType}) => schemaType !== 'websiteSettings'),
  },

  document: {
    actions: (previousActions, context) =>
      context.schemaType === 'websiteSettings'
        ? previousActions.filter(({action}) =>
            action && ['publish', 'discardChanges'].includes(action),
          )
        : previousActions,
  },
})
