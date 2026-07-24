import {defineArrayMember, defineField, defineType} from 'sanity'

export const cityType = defineType({
  name: 'city',
  title: 'Ciudades',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre de la ciudad',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(80),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      options: {source: 'name', maxLength: 80},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'province',
      title: 'Provincia o región',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Descripción breve',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().min(20).max(260),
    }),
    defineField({
      name: 'description',
      title: 'Descripción completa',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'coverImage',
      title: 'Imagen de portada',
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
      name: 'mapUrl',
      title: 'Enlace de Google Maps',
      type: 'url',
      description: 'Paste the public Google Maps link for the city.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured city',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {title: 'Nombre A–Z', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'name', subtitle: 'province', media: 'coverImage', featured: 'featured'},
    prepare({title, subtitle, media, featured}) {
      return {title: featured ? `★ ${title}` : title, subtitle, media}
    },
  },
})
