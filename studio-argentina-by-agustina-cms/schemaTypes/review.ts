import {defineField, defineType} from 'sanity'

export const reviewType = defineType({
  name: 'review',
  title: 'Reseñas',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre del viajero',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(100),
    }),
    defineField({
      name: 'country',
      title: 'País',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(80),
    }),
    defineField({
      name: 'email',
      title: 'Correo electrónico (privado)',
      type: 'email',
      description: 'Se usa únicamente para verificación interna. Nunca se muestra públicamente.',
    }),
    defineField({
      name: 'rating',
      title: 'Calificación',
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
      title: 'Reseña',
      type: 'text',
      rows: 6,
      validation: (rule) => rule.required().min(20).max(1200),
    }),
    defineField({
      name: 'status',
      title: 'Estado de moderación',
      type: 'string',
      options: {
        list: [
          {title: '⏳ Pendiente', value: 'pending'},
          {title: '✅ Aprobada', value: 'approved'},
          {title: '❌ Rechazada', value: 'rejected'},
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Fecha de envío',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'source',
      title: 'Origen',
      type: 'string',
      options: {
        list: [
          {title: 'Página web', value: 'website'},
          {title: 'WhatsApp', value: 'whatsapp'},
          {title: 'Google', value: 'google'},
          {title: 'Instagram', value: 'instagram'},
          {title: 'Agregada manualmente', value: 'manual'},
        ],
      },
      initialValue: 'website',
    }),
    defineField({
      name: 'featured',
      title: 'Reseña destacada',
      type: 'boolean',
      description: 'Las reseñas aprobadas y destacadas pueden resaltarse en la página principal.',
      initialValue: false,
      hidden: ({document}) => document?.status !== 'approved',
    }),
    defineField({
      name: 'internalNotes',
      title: 'Notas internas',
      type: 'text',
      rows: 3,
      description: 'Notas privadas para Agustina. Nunca se muestran en la página.',
    }),
  ],
  orderings: [
    {
      title: 'Más recientes primero',
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
