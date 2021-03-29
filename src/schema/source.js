import {gql} from 'apollo-server-express'

const sourceSchema = gql`
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