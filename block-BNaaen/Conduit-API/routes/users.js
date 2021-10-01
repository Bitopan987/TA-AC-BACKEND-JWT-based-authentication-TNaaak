var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET users listing. */
router.get('/', async function (req, res, next) {
  try {
    var users = await User.find({});
    res.json({ users: users });
  } catch (error) {
    next(error);
  }
});

// registration handler

router.post('/register', async (req, res, next) => {
  let data = req.body.user;
  data.following = false;
  if (!data.username || !data.password || !data.email) {
    return res.status(400).json({
      username: 'username cant be empty',
      email: 'email cant be empty',
      password: 'password cant be empty',
    });
  }
  try {
    var user = await User.findOne({ email: data.email });
    if (user) {
      return res.status(400).json({ username: 'user already exist' });
    }
    if (!user) {
      let createdUser = await User.create(data);
      res.json({
        username: createdUser.username,
        message: 'registered successfully',
      });
    }
  } catch (error) {
    next(error);
  }
});

// login handler

router.post('/login', async (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    return res.sendStatus(400).json({ error: 'Email/Password required' });
  }
  try {
    var user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'This email is not registered' });
    }
    var result = await user.verifyPassword(password);
    if (!result) {
      return res.status(400).json({ error: 'Invalid Password' });
    }
    // generate token
    var token = await user.signToken();
    res.json({ user: user.userJSON(token) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
