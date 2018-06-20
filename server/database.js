const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Error codes
// -1: user email not found
// -2: incorrect password
// -3: missing message data
// -4: inavlid/expired session
// -5: user email already exists
// -6: not authenticated when attempting to create message
// -100: unknown error

mongoose.connect('mongodb://localhost:27017/discussionboard');

const MessageSchema = new mongoose.Schema({ _id: Number, message: String, author: String, email: String, date: Number });
const Message = mongoose.model('Message', MessageSchema);

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true }
});

UserSchema.pre('save', function (next) {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});

const User = mongoose.model('User', UserSchema);

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true },
  email: String,
  date: Number,
  ip: String
});

const Session = mongoose.model('Session', SessionSchema);

// Message functions

async function insertMessage(id, data, sessionId) {
  if (!(data.message && data.author && data.date)) {
    return { success: false, err: -3 };
  }
  data._id = id;
  try {
    data.email = await authenticateUser(sessionId);
    if (!data.email) return { success: false, err: -6 };

    await Message.create(data);
    return { success: true, err: null };
  } catch (err) {
    return { success: false, err: -100 };
  }
}

async function getMessages() {
  return await Message.find();
}

async function getLastId() {
  const lastMessage = await Message.findOne().sort('-_id');
  if (!lastMessage) return -1;
  return lastMessage._id;
}

// User functions

async function createSession(email, date) {
  const randomString = crypto.randomBytes(32).toString('hex');
  let sessionId = crypto.createHmac('sha256', JSON.stringify({ email, date, randomString }));
  sessionId = sessionId.digest('hex');
  const data = { sessionId, email, date };

  await Session.create(data);
  return data;
}

async function createUser(data) {
  try {
    await User.create(data);
    const session = await createSession(data.email, Date.now());
    return { success: true, err: null, sessionId: session.sessionId };
  } catch (err) {
    if (err.code === 11000) return { success: false, err: -5 };
    return { success: false, err: -100 };
  }
}

async function login(data) {
  let user;
  let session;
  try {
    user = await User.findOne({ email: data.email });
    if (!user) return { success: false, err: -1 };

    session = await createSession(user.email, Date.now());
  } catch (err) {
    return { success: false, err: -100 };
  }

  const result = bcrypt.compareSync(data.password, user.password);
  if (result === true) {
    return { success: true, err: null, sessionId: session.sessionId };
  }
  return { success: false, err: -2 };
}

async function logout(data) {
  try {
    await Session.deleteOne({ sessionId: data.sessionId });
    return { success: true };
  } catch (err) {
    return { success: false, err: -100 };
  }
}

async function authenticateUser(sessionId) {
  const session = await Session.findOne({ sessionId });
  if (session) {
    session.date = Date.now();
    await session.save();
    return session.email;
  }

  return false;
}

async function getUserBySessionId(sessionId) {
  try {
    const email = await authenticateUser(sessionId);
    if (email) {
      return { success: true, email };
    } else {
      return { success: false, err: -4 };
    }
  } catch (err) {
    return { success: false, err: -100 };
  }
}

module.exports = { insertMessage, getMessages, getLastId, createUser, login, logout, getUserBySessionId };
