import cors from 'cors';
import express from "express"
import { ApolloServer } from "apollo-server-express"
import typeDefs from './src/schema/index.js'
import resolvers from './src/resolvers/index.js'
import db from "./src/models/gql/index.js"

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: { db }
})

const app = express()
app.use(cors())
apolloServer.applyMiddleware({ app })
const port = process.env.PORT || 4000

app.listen({ port }, () =>
  console.log(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`)
)