var express = require('express');
var router = express.Router();
var User = require('../models/User');
var auth = require('../middlewares/auth');

/* GET users listing. */
router.get('/', auth.verifyToken, async function (req, res, next) {
  console.log(req.user);
  try {
    var user = await User.findById(req.user.userId);
    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        userId: user.id,
        iat: req.user.iat,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// registration handler

router.post('/register', async (req, res, next) => {
  let data = req.body;
  try {
    var user = await User.findOne({ email: data.email });
    if (user) {
      return res.json({ error: 'user exist try login' });
    }
    if (!user) {
      let createdUser = await User.create(data);
      res.json({ name: createdUser.name, message: 'registered successfully' });
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
