import {defineField, defineType} from 'sanity'

export const websiteSettingsType = defineType({
  name: 'websiteSettings',
  title: 'Website settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Website name',
      type: 'string',
      initialValue: 'Argentina by Agustina',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroTitle',
      title: 'Homepage main title',
      type: 'string',
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Homepage subtitle',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(260),
    }),
    defineField({name: 'email', title: 'Contact email', type: 'email'}),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp number',
      type: 'string',
      description: 'Use international format without spaces, for example 5491154098622.',
      validation: (rule) => rule.regex(/^\d{8,16}$/, {name: 'international phone number'}),
    }),
    defineField({name: 'instagramUrl', title: 'Instagram link', type: 'url'}),
    defineField({name: 'calendlyUrl', title: 'Calendly link', type: 'url'}),
    defineField({
      name: 'seoDescription',
      title: 'Google description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'socialShareImage',
      title: 'Social sharing image',
      type: 'image',
      description: 'Image shown when the website is shared on WhatsApp or social media.',
      options: {hotspot: true},
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Argentina by Agustina — Website settings'}
    },
  },
})
