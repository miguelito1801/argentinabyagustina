import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Argentina by Agustina CMS')
    .items([
      S.listItem()
        .title('Articles')
        .schemaType('article')
        .child(S.documentTypeList('article').title('Articles')),
      S.listItem()
        .title('Cities')
        .schemaType('city')
        .child(S.documentTypeList('city').title('Cities')),
      S.listItem()
        .title('Categories')
        .schemaType('category')
        .child(S.documentTypeList('category').title('Categories')),
      S.divider(),
      S.listItem()
        .title('Places')
        .schemaType('place')
        .child(S.documentTypeList('place').title('Places')),
      S.listItem()
        .title('Events')
        .schemaType('event')
        .child(S.documentTypeList('event').title('Events')),
      S.divider(),
      S.listItem()
        .title('Reviews')
        .child(
          S.list()
            .title('Reviews')
            .items([
              S.listItem()
                .title('Pending reviews')
                .child(
                  S.documentList()
                    .title('Pending reviews')
                    .schemaType('review')
                    .filter('_type == "review" && status == "pending"')
                    .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
                ),
              S.listItem()
                .title('Approved reviews')
                .child(
                  S.documentList()
                    .title('Approved reviews')
                    .schemaType('review')
                    .filter('_type == "review" && status == "approved"')
                    .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
                ),
              S.listItem()
                .title('Rejected reviews')
                .child(
                  S.documentList()
                    .title('Rejected reviews')
                    .schemaType('review')
                    .filter('_type == "review" && status == "rejected"')
                    .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
                ),
              S.divider(),
              S.listItem()
                .title('All reviews')
                .child(
                  S.documentTypeList('review')
                    .title('All reviews')
                    .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Website settings')
        .id('websiteSettings')
        .child(
          S.document()
            .schemaType('websiteSettings')
            .documentId('websiteSettings')
            .title('Website settings'),
        ),
    ])
