const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar DateTime
  type Blog {
    id: ID!
    title: String!
    content: String!
    author: User!
    favoriteCount: Int!
    favoritedBy: [User]
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  type User {
    id: ID!
    name: String!
    designation: String!
    username: String!
    Bio: String!
    email: String!
    avatar: String
    blogs: [Blog!]!
    favorites: [Blog!]!
    balance: Int!
  }
  type Feed {
    blogs: [Blog]!
    cursor: String!
    hasNextPage: Boolean!
  }
  type Query {
    blogs: [Blog!]!
    blog(id: ID, username: String, title: String): Blog!
    user(username: String!): User
    users: [User!]!
    me: User!
    blogFeed(cursor: String): Feed
  }
  type Mutation {
    newBlog(content: String!): Blog
    updateBlog(id: ID!, content: String!): Blog!
    deleteBlog(id: ID!): Boolean!
    toggleFavorite(id: ID!): Blog!
    signUp(username: String!, email: String!, password: String!): String!
    signIn(username: String, email: String, password: String!): String!
  }
`;
