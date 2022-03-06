module.exports = {
  // Resolve the list of notes for a user when requested
  blogs: async (user, args, { models }) => {
    return await models.Blog.find({ author: user._id }).sort({ _id: -1 });
  },
  // Resolve the list of favorites for a user when requested
  favorites: async (user, args, { models }) => {
    return await models.Blog.find({ favoritedBy: user._id }).sort({ _id: -1 });
  },
};
