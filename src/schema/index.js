import {gql} from 'apollo-server-express'
import sourceSchema from './source.js'

const rootType = gql`
    type htmlResult {
        url: String!
        html: String!
        statusCode: String
    }

    type Query {
        root: String
        getHtmlSource(url: String!): htmlResult
    }

    type Mutation {
        root: String
    }
`
const typeDefs = [
    rootType,
    sourceSchema
]

export default typeDefs
