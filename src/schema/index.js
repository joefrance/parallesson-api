import {gql} from 'apollo-server-express'
import bookSchema from './book.js'
import chapterSchema from './chapter.js'
import languageSchema from './language.js'
import pageSchema from './page.js'
import paragraphSchema from './paragraph.js'
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
    bookSchema,
    chapterSchema,
    languageSchema,
    pageSchema,
    paragraphSchema,
    sourceSchema
]

export default typeDefs
