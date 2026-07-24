import {defineArrayMember, defineField, defineType} from 'sanity'

export const placeType = defineType({
  name: 'place',
  title: 'Places',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Place name',
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
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'mapUrl',
      title: 'Google Maps link',
      type: 'url',
      description: 'Paste the public share link from Google Maps.',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().min(20).max(280),
    }),
    defineField({
      name: 'description',
      title: 'Complete description',
      type: 'array',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Image description', type: 'string'}),
            defineField({name: 'caption', title: 'Caption', type: 'string'}),
          ],
        }),
      ],
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
      title: 'Image gallery',
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
    defineField({name: 'instagramUrl', title: 'Instagram', type: 'url'}),
    defineField({name: 'websiteUrl', title: 'Official website', type: 'url'}),
    defineField({
      name: 'priceLevel',
      title: 'Price level',
      type: 'string',
      options: {
        list: [
          {title: 'Free', value: 'free'},
          {title: '$', value: 'low'},
          {title: '$$', value: 'medium'},
          {title: '$$$', value: 'high'},
          {title: 'Not specified', value: 'unknown'},
        ],
      },
      initialValue: 'unknown',
    }),
    defineField({
      name: 'featured',
      title: 'Featured place',
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
    {title: 'Name A–Z', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
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
        subtitle: `${city || 'No city'}${active === false ? ' · Hidden' : ''}`,
        media,
      }
    },
  },
})
