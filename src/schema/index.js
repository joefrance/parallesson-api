import {gql} from 'apollo-server-express'

import sourceSchema from './source.js'

const rootType = gql`
    type Query {
        root: String
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
