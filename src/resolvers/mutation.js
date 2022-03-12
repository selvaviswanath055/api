const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server-express");
const mongoose = require("mongoose");
require("dotenv").config();

const gravatar = require("../gravatar");

module.exports = {
  newBlog: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError("You must be signed in to create a blog");
    }

    return await models.Blog.create({
      title: args.title,
      content: args.content,
      author: mongoose.Types.ObjectId(user.id),
      favoriteCount: 0,
    });
  },
  deleteBlog: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError("You must be signed in to delete a blog");
    }

    const blog = await models.Blog.findById(id);
    if (blog && String(blog.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to delete the blog");
    }

    try {
      await blog.remove();
      return true;
    } catch (err) {
      return false;
    }
  },
  updateBlog: async (parent, { content, id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError("You must be signed in to update a blog");
    }

    const blog = await models.Blog.findById(id);
    // if the blog owner and current user don't match, throw a forbidden error
    if (blog && String(blog.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to update the blog");
    }

    // Update the blog in the db and return the updated blog
    return await models.Blog.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          title,
          content,
        },
      },
      {
        new: true,
      }
    );
  },
  toggleFavorite: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError();
    }

    let blogCheck = await models.Blog.findById(id);
    const hasUser = blogCheck.favoritedBy.indexOf(user.id);

    if (hasUser >= 0) {
      return await models.Blog.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id),
          },
          $inc: {
            favoriteCount: -1,
          },
        },
        {
          // Set new to true to return the updated doc
          new: true,
        }
      );
    } else {
      // if the user doesn't exist in the list
      // add them to the list and increment the favoriteCount by 1
      return await models.Blog.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id),
          },
          $inc: {
            favoriteCount: 1,
          },
        },
        {
          new: true,
        }
      );
    }
  },
  signUp: async (
    parent,
    { designation, name, username, email, password },
    { models }
  ) => {
    // normalize email address
    email = email.trim().toLowerCase();
    // hash the password
    const hashed = await bcrypt.hash(password, 10);
    // create the gravatar url
    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        name,
        username,
        designation,
        email,
        avatar,
        password: hashed,
      });

      // create and return the json web token
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      // if there's a problem creating the account, throw an error
      throw new Error("Error creating account");
    }
  },

  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      // normalize email address
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }],
    });

    // if no user is found, throw an authentication error
    if (!user) {
      throw new AuthenticationError("Error signing in");
    }

    // if the passwords don't match, throw an authentication error
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError("Error signing in");
    }

    // create and return the json web token
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },
};
