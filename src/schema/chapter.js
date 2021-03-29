import {gql} from 'apollo-server-express'

const chapterSchema = gql`
  type chapter {
    chapter_id: ID!
    chapter_title: String
    chapter_path: String
    pages: [page]
  }

  extend type Query {
    getchapter(id: ID!): chapter
    getchapters: [chapter]
  }
`
export default chapterSchema