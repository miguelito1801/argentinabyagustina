import {defineArrayMember, defineField, defineType} from 'sanity'

export const eventType = defineType({
  name: 'event',
  title: 'Events',
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
      title: 'City',
      type: 'reference',
      to: [{type: 'city'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
    }),
    defineField({
      name: 'venue',
      title: 'Venue / location name',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({name: 'address', title: 'Address', type: 'string'}),
    defineField({name: 'mapUrl', title: 'Google Maps link', type: 'url'}),
    defineField({
      name: 'startsAt',
      title: 'Start date and time',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endsAt',
      title: 'End date and time',
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
      title: 'Short description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().min(20).max(280),
    }),
    defineField({
      name: 'description',
      title: 'Complete description',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Main image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Image description',
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
            defineField({name: 'alt', title: 'Image description', type: 'string'}),
            defineField({name: 'caption', title: 'Caption', type: 'string'}),
          ],
        }),
      ],
    }),
    defineField({name: 'officialUrl', title: 'Official event link', type: 'url'}),
    defineField({
      name: 'featured',
      title: 'Featured event',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'active',
      title: 'Visible on the website',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  orderings: [
    {title: 'Upcoming first', name: 'startsAtAsc', by: [{field: 'startsAt', direction: 'asc'}]},
    {title: 'Newest first', name: 'startsAtDesc', by: [{field: 'startsAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', startsAt: 'startsAt', city: 'city.name', media: 'coverImage'},
    prepare({title, startsAt, city, media}) {
      const date = startsAt ? new Date(startsAt).toLocaleDateString('en-GB') : 'No date'
      return {title, subtitle: `${date} · ${city || 'No city'}`, media}
    },
  },
})
