import {defineArrayMember, defineField, defineType} from 'sanity'

export const articleType = defineType({
  name: 'article',
  title: 'Guías de viaje',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título de la guía',
      type: 'string',
      validation: (rule) => rule.required().min(5).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      description: 'Pulsá Generar para crear la dirección de la guía automáticamente.',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Descripción breve',
      type: 'text',
      rows: 3,
      description: 'Escribí una introducción breve que aparecerá en la tarjeta de la guía.',
      validation: (rule) => rule.required().min(20).max(250),
    }),
    defineField({
      name: 'city',
      title: 'Ciudad',
      type: 'reference',
      to: [{type: 'city'}],
      description: 'Opcional. Elegí una ciudad cuando la guía se relacione con un destino específico.',
    }),
    defineField({
      name: 'categories',
      title: 'Categorías',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'coverImage',
      title: 'Imagen de portada',
      type: 'image',
      description: 'Subí o arrastrá aquí la foto principal. Se mostrará en la tarjeta y al comienzo de la guía. Sanity acepta JPG, PNG y WebP; no necesitás usar otro programa.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Descripción de la imagen',
          type: 'string',
          description: 'Describí brevemente la imagen para accesibilidad y Google.',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Galería de fotos (opcional)',
      type: 'array',
      description: 'Usá “Add item” para subir varias fotos. Se mostrarán juntas al final de la guía.',
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Foto de la galería',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Descripción de la imagen',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'caption', title: 'Texto de la foto', type: 'string'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Contenido de la guía',
      type: 'array',
      description: 'Escribí aquí la guía completa. Para insertar una foto entre párrafos, ubicá el cursor donde la querés y pulsá el botón “Image” de la barra. Podés subirla directamente desde tu computadora.',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          title: 'Imagen dentro del texto',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Descripción de la imagen',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'caption', title: 'Texto de la foto', type: 'string'}),
          ],
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Fecha de publicación',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Guía destacada',
      type: 'boolean',
      description: 'Activá esta opción para destacar la guía en la página principal.',
      initialValue: false,
    }),
  ],
  orderings: [
    {title: 'Más recientes primero', name: 'publishedAtDesc', by: [{field: 'publishedAt', direction: 'desc'}]},
  ],
  preview: {
    select: {
      title: 'title',
      city: 'city.name',
      media: 'coverImage',
      featured: 'featured',
    },
    prepare({title, city, media, featured}) {
      return {
        title: featured ? `★ ${title}` : title,
        subtitle: city || 'All Argentina',
        media,
      }
    },
  },
})
