import {defineField, defineType} from 'sanity'

export const websiteSettingsType = defineType({
  name: 'websiteSettings',
  title: 'Datos de la página y contacto',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Nombre de la página',
      type: 'string',
      initialValue: 'Argentina by Agustina',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroTitle',
      title: 'Título principal de la portada',
      type: 'string',
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Subtítulo de la portada',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(260),
    }),
    defineField({name: 'email', title: 'Correo de contacto', type: 'email'}),
    defineField({
      name: 'whatsappNumber',
      title: 'Número de WhatsApp',
      type: 'string',
      description: 'Usá el formato internacional sin espacios, por ejemplo 5491154098622.',
      validation: (rule) => rule.regex(/^\d{8,16}$/, {name: 'international phone number'}),
    }),
    defineField({name: 'instagramUrl', title: 'Enlace de Instagram', type: 'url'}),
    defineField({name: 'calendlyUrl', title: 'Enlace de Calendly', type: 'url'}),
    defineField({
      name: 'seoDescription',
      title: 'Descripción para Google',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'socialShareImage',
      title: 'Imagen para compartir en redes',
      type: 'image',
      description: 'Imagen que aparece al compartir la página por WhatsApp o redes sociales.',
      options: {hotspot: true},
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Argentina by Agustina — Datos del sitio'}
    },
  },
})
