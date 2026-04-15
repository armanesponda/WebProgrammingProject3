import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Used when you implement the TODO handlers below.
// eslint-disable-next-line no-unused-vars
import User from './schema/user';
// eslint-disable-next-line no-unused-vars
import Photo from './schema/photo';

const app = express();

// define these in env and import in this file
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1/project3';


// Enable CORS for frontend running on a different port
app.use(cors());

// Connect to MongoDB
mongoose.connect(mongoUrl);

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * GET /user/list
 * Returns the list of users.
 */
app.get('/user/list', async (req, res) => {
  try {
    // finds user id and returns name and last name for display
    const users = await User.find({}, '_id first_name last_name'); 
    const userList = users.map(user => ({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
    }));
    return res.json(userList); // js objects
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /user/:id
 * Returns the details of one user.
 */
app.get('/user/:id', async (req, res) => {
  // similar to get user list, find and js object sent
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    const user = await User.findById(userId, '_id first_name last_name location description occupation');
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    // 404 status if no user is found

    return res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /photosOfUser/:id
 * Returns all photos of the given user.
 */
app.get('/photosOfUser/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    const photos = await Photo.find({ user_id: userId });
    const users = await User.find({}, '_id first_name last_name');

    // looks up commenter id and return info
    const userMap = {};
    users.forEach(user => {
      userMap[user._id] = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
      };
    });

    const result = photos.map(photo => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: (photo.comments || []).map(comment => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: userMap[comment.user_id],
      })),
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
