import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Categories',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Category name',
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
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: 'colorLabel',
      title: 'Internal color label',
      type: 'string',
      description: 'Optional label used only to help organize categories in the CMS.',
      options: {
        list: [
          {title: 'Sky blue', value: 'sky'},
          {title: 'Burgundy', value: 'burgundy'},
          {title: 'Gold', value: 'gold'},
          {title: 'Green', value: 'green'},
          {title: 'Neutral', value: 'neutral'},
        ],
      },
      initialValue: 'neutral',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'description'},
  },
})
