import {gql} from 'apollo-server-express'

const paragraphSchema = gql`

  type paragraph {
    paragraph_id: ID!
    paragraph_content: String
    paragraph_format: String
    page: page!
  }

  extend type Query {
    getparagraph(id: ID!): paragraph
    getparagraphs: [paragraph]
  }
`
export default paragraphSchema