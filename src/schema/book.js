import {gql} from 'apollo-server-express'

const bookSchema = gql`

  type book {
    book_id: ID!
    book_title: String
    book_path: String
    chapters: [chapter]
    pages: [page]
  }

  extend type Query {
    getbook(id: ID!): book
    getbooks: [book]
  }
`
export default bookSchema