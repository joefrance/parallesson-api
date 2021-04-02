import {gql} from 'apollo-server-express'

const bookSchema = gql`

  type book {
    book_id: ID!
    book_title: String
    book_desc: String
    book_path: String
    book_img_src: String
    chapters: [chapter]
    pages: [page]
  }

  extend type Query {
    getbook(id: ID!): book
    getbooks(language_id: ID!): [book]
  }
`
export default bookSchema