import {gql} from 'apollo-server-express'

const pageSchema = gql`
  type page {
    page_id: ID!
    page_title: String
    page_path: String
    chapter: chapter
    paragraphs: [paragraph]
  }

  extend type Query {
    getpage(id: ID!): page
    getpages: [page]
  }
`
export default pageSchema