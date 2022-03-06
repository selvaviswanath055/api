module.exports = {
  blogs: async (parent, args, { models }) => {
    return await models.Blog.find().limit(100);
  },
  blog: async (parent, args, { models }) => {
    return await models.Blog.findById(args.id);
  },
  user: async (parent, args, { models }) => {
    return await models.User.findOne({ username: args.username });
  },
  users: async (parent, args, { models }) => {
    return await models.User.find({}).limit(100);
  },
  me: async (parent, args, { models, user }) => {
    return await models.User.findById(user.id);
  },
  blogFeed: async (parent, { cursor }, { models }) => {
    // hard code the limit to 10 items
    const limit = 10;
    // set the default hasNextPage value to false
    let hasNextPage = false;
    // if no cursor is passed the default query will be empty
    // this will pull the newest blogs from the db
    let cursorQuery = {};

    // if there is a cursor
    // our query will look for blogs with an ObjectId less than that of the cursor
    if (cursor) {
      cursorQuery = { _id: { $lt: cursor } };
    }

    // find the limit + 1 of blogs in our db, sorted newest to oldest
    let blogs = await models.Blog.find(cursorQuery)
      .sort({ _id: -1 })
      .limit(limit + 1);

    // if the number of blogs we find exceeds our limit
    // set hasNextPage to true & trim the blogs to the limit
    if (blogs.length > limit) {
      hasNextPage = true;
      blogs = blogs.slice(0, -1);
    }

    // the new cursor will be the Mongo ObjectID of the last item in the feed array
    const newCursor = blogs[blogs.length - 1]._id;

    return {
      blogs,
      cursor: newCursor,
      hasNextPage,
    };
  },
};
