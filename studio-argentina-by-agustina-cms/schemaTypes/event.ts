import {defineArrayMember, defineField, defineType} from 'sanity'

export const eventType = defineType({
  name: 'event',
  title: 'Eventos',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Event name',
      type: 'string',
      validation: (rule) => rule.required().min(3).max(140),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
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
    }),
    defineField({
      name: 'venue',
      title: 'Venue / location name',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({name: 'address', title: 'Dirección', type: 'string'}),
    defineField({name: 'mapUrl', title: 'Enlace de Google Maps', type: 'url'}),
    defineField({
      name: 'startsAt',
      title: 'Fecha y hora de inicio',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endsAt',
      title: 'Fecha y hora de finalización',
      type: 'datetime',
      validation: (rule) =>
        rule.required().custom((endsAt, context) => {
          const startsAt = (context.document as {startsAt?: string})?.startsAt
          if (!endsAt || !startsAt) return true
          return new Date(endsAt) > new Date(startsAt) || 'End must be after start'
        }),
    }),
    defineField({
      name: 'summary',
      title: 'Descripción breve',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().min(20).max(280),
    }),
    defineField({
      name: 'description',
      title: 'Descripción completa',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
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
      title: 'Optional gallery',
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
    defineField({name: 'officialUrl', title: 'Official event link', type: 'url'}),
    defineField({
      name: 'featured',
      title: 'Evento destacado',
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
    {title: 'Upcoming first', name: 'startsAtAsc', by: [{field: 'startsAt', direction: 'asc'}]},
    {title: 'Más recientes primero', name: 'startsAtDesc', by: [{field: 'startsAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', startsAt: 'startsAt', city: 'city.name', media: 'coverImage'},
    prepare({title, startsAt, city, media}) {
      const date = startsAt ? new Date(startsAt).toLocaleDateString('en-GB') : 'No date'
      return {title, subtitle: `${date} · ${city || 'No city'}`, media}
    },
  },
})
