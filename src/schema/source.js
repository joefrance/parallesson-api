import {gql} from 'apollo-server-express'

const sourceSchema = gql`

  type book {
    book_id: ID!
    book_title: String
    book_path: String
    chapters: [chapter]
    pages: [page]
  }

  type chapter {
    chapter_id: ID!
    chapter_title: String
    chapter_path: String
    pages: [page]
  }

  type page {
    page_id: ID!
    page_title: String
    page_path: String
    chapter: chapter
    paragraphs: [paragraph]
  }

  type paragraph {
    paragraph_id: ID!
    paragraph_content: String
    paragraph_format: String
    page: page!
  }
  type source {
    source_id: ID!
    source_name: String!
    source_desc: String
    source_url: String
    source_logo: String
    source_repo: String
  }

  extend type Query {
    getsource(id: ID!): source
    getsources: [source]
  }
`
export default sourceSchema