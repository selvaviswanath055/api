const Query = require("./query");
const Mutation = require("./mutation");
const Blog = require("./blog");
const User = require("./user");
const { GraphQLDateTime } = require("graphql-iso-date");

module.exports = {
  Query,
  Mutation,
  Blog,
  User,
  DateTime: GraphQLDateTime,
};
