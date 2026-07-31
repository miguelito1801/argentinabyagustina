import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Administrar Argentina by Agustina')
    .items([
      S.listItem()
        .id('pendingReviews')
        .title('⭐ Reseñas pendientes')
        .child(
          S.documentList()
            .title('Reseñas esperando aprobación')
            .schemaType('review')
            .filter('_type == "review" && status == "pending"')
            .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
        ),
      S.divider(),
      S.listItem()
        .id('articles')
        .title('🧭 Guías de viaje')
        .schemaType('article')
        .child(S.documentTypeList('article').title('Guías de viaje')),
      S.listItem()
        .id('places')
        .title('📍 Lugares recomendados')
        .schemaType('place')
        .child(S.documentTypeList('place').title('Lugares recomendados')),
      S.listItem()
        .id('events')
        .title('📅 Eventos y actividades')
        .schemaType('event')
        .child(S.documentTypeList('event').title('Eventos y actividades')),
      S.divider(),
      S.listItem()
        .id('approvedReviews')
        .title('✅ Reseñas aprobadas')
        .child(
          S.documentList()
            .title('Reseñas visibles en la web')
            .schemaType('review')
            .filter('_type == "review" && status == "approved"')
            .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
        ),
      S.listItem()
        .id('rejectedReviews')
        .title('⛔ Reseñas rechazadas')
        .child(
          S.documentList()
            .title('Reseñas rechazadas')
            .schemaType('review')
            .filter('_type == "review" && status == "rejected"')
            .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
        ),
      S.listItem()
        .id('allReviews')
        .title('💬 Todas las reseñas')
        .child(
          S.documentTypeList('review')
            .title('Todas las reseñas')
            .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
        ),
      S.divider(),
      S.listItem()
        .id('cities')
        .title('🏙️ Ciudades y destinos')
        .schemaType('city')
        .child(S.documentTypeList('city').title('Ciudades y destinos')),
      S.listItem()
        .id('categories')
        .title('🏷️ Categorías')
        .schemaType('category')
        .child(S.documentTypeList('category').title('Categorías')),
      S.divider(),
      S.listItem()
        .id('websiteSettings')
        .title('⚙️ Datos de la página y contacto')
        .child(
          S.document()
            .schemaType('websiteSettings')
            .documentId('websiteSettings')
            .title('Datos de la página y contacto'),
        ),
    ])
