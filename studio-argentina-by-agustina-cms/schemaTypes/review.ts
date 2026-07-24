import {defineField, defineType} from 'sanity'

export const reviewType = defineType({
  name: 'review',
  title: 'Reviews',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Traveler name',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(100),
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(80),
    }),
    defineField({
      name: 'email',
      title: 'Email (private)',
      type: 'email',
      description: 'Used only for internal verification. It is never shown publicly.',
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      options: {
        list: [
          {title: '★ 1 star', value: 1},
          {title: '★★ 2 stars', value: 2},
          {title: '★★★ 3 stars', value: 3},
          {title: '★★★★ 4 stars', value: 4},
          {title: '★★★★★ 5 stars', value: 5},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().integer().min(1).max(5),
    }),
    defineField({
      name: 'comment',
      title: 'Review',
      type: 'text',
      rows: 6,
      validation: (rule) => rule.required().min(20).max(1200),
    }),
    defineField({
      name: 'status',
      title: 'Moderation status',
      type: 'string',
      options: {
        list: [
          {title: '⏳ Pending', value: 'pending'},
          {title: '✅ Approved', value: 'approved'},
          {title: '❌ Rejected', value: 'rejected'},
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submission date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          {title: 'Website', value: 'website'},
          {title: 'WhatsApp', value: 'whatsapp'},
          {title: 'Google', value: 'google'},
          {title: 'Instagram', value: 'instagram'},
          {title: 'Added manually', value: 'manual'},
        ],
      },
      initialValue: 'website',
    }),
    defineField({
      name: 'featured',
      title: 'Featured review',
      type: 'boolean',
      description: 'Featured approved reviews can be highlighted on the homepage.',
      initialValue: false,
      hidden: ({document}) => document?.status !== 'approved',
    }),
    defineField({
      name: 'internalNotes',
      title: 'Internal notes',
      type: 'text',
      rows: 3,
      description: 'Private notes for Agustina. Never shown on the website.',
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'submittedAtDesc',
      by: [{field: 'submittedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'name', country: 'country', rating: 'rating', status: 'status'},
    prepare({title, country, rating, status}) {
      const icon = status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳'
      const stars = '★'.repeat(Number(rating || 0))
      return {title: `${icon} ${title}`, subtitle: `${stars} · ${country || 'No country'}`}
    },
  },
})
