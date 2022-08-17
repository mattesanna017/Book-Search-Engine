import { User } from "../models";


const resolvers = {
    Query: {
        user: async (parent, { user = null, params }, res) => {
            const foundUser = await User.findOne({
              $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
            });
        
            if (!foundUser) {
              return res.status(400).json({ message: 'Cannot find a user with this id!' });
            }
        
            res.json(foundUser);
        }
    },
    Mutation: {
        createUser: async (parent, { body }, res) => {
            const user = await User.create(body);
        
            if (!user) {
              return res.status(400).json({ message: 'Something is wrong!' });
            }
            const token = signToken(user);
            res.json({ token, user });
        },
        login: async (parent, { body }, res) => {
            const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });
            if (!user) {
              return res.status(400).json({ message: "Can't find this user" });
            }
        
            const correctPw = await user.isCorrectPassword(body.password);
        
            if (!correctPw) {
              return res.status(400).json({ message: 'Wrong password!' });
            }
            const token = signToken(user);
            res.json({ token, user });
        },
        saveBook: async (parent, { user, body }, res) => {
            console.log(user);
            try {
              const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $addToSet: { savedBooks: body } },
                { new: true, runValidators: true }
              );
              return res.json(updatedUser);
            } catch (err) {
              console.log(err);
              return res.status(400).json(err);
            }
        },
        deleteBook: async (parent, { user, params }, res) => {
            const updatedUser = await User.findOneAndUpdate(
              { _id: user._id },
              { $pull: { savedBooks: { bookId: params.bookId } } },
              { new: true }
            );
            if (!updatedUser) {
              return res.status(404).json({ message: "Couldn't find user with this id!" });
            }
            return res.json(updatedUser);
          },
    },
};

module.exports = resolvers;