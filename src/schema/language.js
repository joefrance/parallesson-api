import {gql} from 'apollo-server-express'

const languageSchema = gql`

type language_info {
  code: String!
  name: String!
}

type language {
    language_id: ID!
    language_info: language_info!
    relativePath: String!
    isDirectory: Boolean
    books: [book]
  }

  extend type Query {
    getlanguage(id: ID!): language
    getlanguages(source_id: ID!): [language]
  }
`
export default languageSchema