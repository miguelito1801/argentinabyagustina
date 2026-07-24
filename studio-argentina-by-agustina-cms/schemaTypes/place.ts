import {defineArrayMember, defineField, defineType} from 'sanity'

export const placeType = defineType({
  name: 'place',
  title: 'Lugares',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre del lugar',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'Ciudad',
      type: 'reference',
      to: [{type: 'city'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categorías',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'address',
      title: 'Dirección',
      type: 'string',
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'mapUrl',
      title: 'Enlace de Google Maps',
      type: 'url',
      description: 'Pegá el enlace público para compartir desde Google Maps.',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Descripción breve',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().min(20).max(280),
    }),
    defineField({
      name: 'description',
      title: 'Descripción completa',
      type: 'array',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Descripción de la imagen', type: 'string'}),
            defineField({name: 'caption', title: 'Texto de la foto', type: 'string'}),
          ],
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Imagen principal',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Descripción de la imagen',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Galería de imágenes',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Descripción de la imagen', type: 'string'}),
            defineField({name: 'caption', title: 'Texto de la foto', type: 'string'}),
          ],
        }),
      ],
    }),
    defineField({name: 'instagramUrl', title: 'Instagram', type: 'url'}),
    defineField({name: 'websiteUrl', title: 'Sitio web oficial', type: 'url'}),
    defineField({
      name: 'priceLevel',
      title: 'Nivel de precio',
      type: 'string',
      options: {
        list: [
          {title: 'Gratis', value: 'free'},
          {title: '$', value: 'low'},
          {title: '$$', value: 'medium'},
          {title: '$$$', value: 'high'},
          {title: 'Sin especificar', value: 'unknown'},
        ],
      },
      initialValue: 'unknown',
    }),
    defineField({
      name: 'featured',
      title: 'Lugar destacado',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'active',
      title: 'Visible en la página',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  orderings: [
    {title: 'Nombre A–Z', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
  ],
  preview: {
    select: {
      title: 'name',
      city: 'city.name',
      media: 'coverImage',
      featured: 'featured',
      active: 'active',
    },
    prepare({title, city, media, featured, active}) {
      const prefix = featured ? '★ ' : ''
      return {
        title: `${prefix}${title}`,
        subtitle: `${city || 'Ciudad sin indicar'}${active === false ? ' · Oculto' : ''}`,
        media,
      }
    },
  },
})
