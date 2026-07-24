import {defineArrayMember, defineField, defineType} from 'sanity'

export const articleType = defineType({
  name: 'article',
  title: 'Artículos',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título del artículo',
      type: 'string',
      validation: (rule) => rule.required().min(5).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      description: 'Pulsá Generar para crear la dirección del artículo automáticamente.',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Descripción breve',
      type: 'text',
      rows: 3,
      description: 'Escribí una introducción breve que aparecerá en la tarjeta del artículo.',
      validation: (rule) => rule.required().min(20).max(250),
    }),
    defineField({
      name: 'city',
      title: 'Ciudad',
      type: 'reference',
      to: [{type: 'city'}],
      description: 'Opcional. Elegí una ciudad cuando el artículo se relacione con un destino específico.',
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
      description: 'Imagen principal que aparecerá en la tarjeta y al comienzo del artículo.',
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
      title: 'Galería de imágenes',
      type: 'array',
      description: 'Fotografías adicionales que quieras mostrar en el artículo.',
      of: [
        defineArrayMember({
          type: 'image',
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
      title: 'Contenido del artículo',
      type: 'array',
      description: 'Escribí aquí el artículo completo. Podés usar títulos, listas, enlaces e imágenes.',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
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
      title: 'Artículo destacado',
      type: 'boolean',
      description: 'Activá esta opción para destacar el artículo en la página principal.',
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
