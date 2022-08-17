const express = require('express');

// add apollo server express
const { ApolloServer } = require('apollo-server-express');
const path = require('path');

// no longer need ./routes
// const routes = require('./routes');

// require typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;
// instantiate server
const server = new ApolloServer({
  typeDefs,
  resolvers
});

// set extended to false
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// no longer need to use routes
// app.use(routes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// create new instance of an Apollo server with Graphql schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });


db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  })
});
};

// call the async function to start the server
startApolloServer(typeDefs, resolvers);