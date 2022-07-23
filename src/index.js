const express = require("express");
const app = express();
const { ApolloServer } = require("apollo-server-express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const cors = require("cors");
const depthLimit = require("graphql-depth-limit");
const { createComplexityLimitRule } = require("graphql-validation-complexity");

const models = require("./models");
const db = require("./db");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;
db.connect(DB_HOST);

//app.use(helmet());
app.use(cors());

const getUser = (token) => {
  if (token) {
    try {
      // return the user information from the token
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // if there's a problem with the token, throw an error
      throw new Error("Session invalid");
    }
  }
};
async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
    context: async ({ req }) => {
      const token = req.headers.authorization;
      const user = getUser(token);
      return { models, user };
    },
  });
  await server.start();

  server.applyMiddleware({ app, path: "/api" });

  await new Promise((resolve) => app.listen({ port }, resolve));
  console.log(
    `GraphQL running at http://localhost:${port}${server.graphqlPath}`
  );
}

startApolloServer(typeDefs, resolvers);
