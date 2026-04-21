import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import bcrypt from 'bcrypt';

// eslint-disable-next-line import/extensions
import User from './schema/user.js';
// eslint-disable-next-line import/extensions
import Photo from './schema/photo.js';

const app = express();

// define these in env and import in this file
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1/project3';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(cors({
  origin: clientUrl,
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'project3secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Connect to MongoDB
mongoose.connect(mongoUrl);

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

const requireLogin = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).send('Unauthorized');
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const userObject = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  const { password_digest, __v, ...safeUser } = userObject;
  return safeUser;
};

app.post('/admin/login', async (req, res) => {
  try {
    const { login_name, password } = req.body;
    if (!login_name || !password) {
      return res.status(400).send('login_name and password are required');
    }

    const user = await User.findOne({ login_name });
    if (!user) {
      return res.status(400).send('Invalid login credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.password_digest);
    if (!passwordMatches) {
      return res.status(400).send('Invalid login credentials');
    }

    req.session.userId = user._id;
    return res.json(sanitizeUser(user));
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.post('/admin/logout', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(400).send('No user is logged in');
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.clearCookie('connect.sid');
    return res.sendStatus(200);
  });
});

app.get('/admin/me', async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const user = await User.findById(req.session.userId, '_id first_name last_name location description occupation login_name');
    if (!user) {
      return res.status(401).send('Unauthorized');
    }
    return res.json(user);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.post('/user', async (req, res) => {
  try {
    const {
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    } = req.body;

    if (!login_name || !password || !first_name || !last_name) {
      return res.status(400).send('login_name, password, first_name, and last_name are required');
    }

    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).send('login_name already exists');
    }

    const passwordDigest = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      first_name,
      last_name,
      location,
      description,
      occupation,
      login_name,
      password_digest: passwordDigest,
    });

    req.session.userId = newUser._id;
    return res.json(sanitizeUser(newUser));
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /user/list
 * Returns the list of users.
 */
app.get('/user/list', requireLogin, async (req, res) => {
  try {
    // finds user id and returns name and last name for display
    const users = await User.find({}, '_id first_name last_name');
    const userList = users.map(user => ({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
    }));
    return res.json(userList);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /user/:id
 * Returns the details of one user.
 */
app.get('/user/:id', requireLogin, async (req, res) => {
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
app.get('/photosOfUser/:id', requireLogin, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    const photos = await Photo.find({ user_id: userId });
    const users = await User.find({}, '_id first_name last_name');

    // looks up commenter id and returns info
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


 // POST /admin/login 
 // Logs in a user by verifying login_name and password.
app.post('/admin/login', async (req, res) => {
  try {
    const { login_name, password } = req.body;

    // find user by login_name
    const user = await User.findOne({ login_name });
    if (!user) return res.status(400).send('Invalid login name or password');

    // compare submitted password against stored hash
    const match = await bcrypt.compare(password, user.password_digest);
    if (!match) return res.status(400).send('Invalid login name or password');

    // store user id in session
    req.session.userId = user._id;

    return res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});


 // POST /admin/logout
 // Destroys the session and logs the user out
app.post('/admin/logout', (req, res) => {
  if (!req.session.userId) {
    return res.status(400).send('No user is currently logged in');
  }
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Logout failed');
    return res.status(200).send('Logged out');
  });
});

 // POST /user
 // Registers a new user.
app.post('/user', async (req, res) => {
  try {
    const {
      login_name, password, first_name, last_name, location, description, occupation,
    } = req.body;

    // Check all required fields
    if (!login_name || !password || !first_name || !last_name) {
      return res.status(400).send('login_name, password, first_name, and last_name are required');
    }

    // check for unique login_name
    const existing = await User.findOne({ login_name });
    if (existing) return res.status(400).send('login_name already exists');

    // hash the password
    const password_digest = await bcrypt.hash(password, 10);

    // create and save the new user
    const newUser = new User({
      login_name, password_digest, first_name, last_name, location, description, occupation,
    });
    await newUser.save();

    return res.status(201).json({
      _id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      login_name: newUser.login_name,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});


 // POST /commentsOfPhoto/:photoId
 // Adds a comment to the specified photo
app.post('/commentsOfPhoto/:photoId', requireLogin, async (req, res) => {
  try {
    const { photoId } = req.params;
    const { comment } = req.body;

    //Requires comment for posting
    if (!comment || comment.trim().length === 0) {
      return res.status(400).send('Comment text is required');
    }

    if (!isValidObjectId(photoId)) {
      return res.status(400).send('Invalid photo id');
    }

    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(404).send('Photo not found');

    // Push comments to photo doc
    photo.comments.push({
      comment: comment.trim(),
      date_time: new Date(),
      user_id: req.session.userId,
    });
    await photo.save();

    return res.status(201).send('Comment added');
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
