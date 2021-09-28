var express = require('express');
var router = express.Router();
var User = require('../models/User');
var auth = require('../middlewares/auth');

router.use(auth.isLoggedIn);

//Get Current User

router.get('/', async (req, res, next) => {
  //   console.log(req.user);
  let id = req.user.userId;
  try {
    let user = await User.findById(id);
    res.status(200).json({ user: user.displayUser(id) });
  } catch (error) {
    next(error);
  }
});

//Update User
router.put('/', async (req, res, next) => {
  let id = req.user.userId;
  try {
    user = await User.findByIdAndUpdate(id, req.body.user);
    return res.status(201).json({ user: user.displayUser(id) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
