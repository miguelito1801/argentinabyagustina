import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Categorías',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre de la categoría',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(60),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      options: {source: 'title', maxLength: 80},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: 'colorLabel',
      title: 'Color interno',
      type: 'string',
      description: 'Optional label used only to help organize categories in the CMS.',
      options: {
        list: [
          {title: 'Celeste', value: 'sky'},
          {title: 'Bordó', value: 'burgundy'},
          {title: 'Dorado', value: 'gold'},
          {title: 'Verde', value: 'green'},
          {title: 'Neutro', value: 'neutral'},
        ],
      },
      initialValue: 'neutral',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'description'},
  },
})
