var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;
var jwt = require('jsonwebtoken');
const Profile = require('./Profile');
require('dotenv').config();

var userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    token: String,
    username: { type: String, unique: true },
    password: { type: String, required: true, minlength: 5 },
    bio: String,
    image: { type: String, default: null },
    profile: { type: mongoose.Types.ObjectId, ref: 'Profile' },
    articles: [{ type: mongoose.Types.ObjectId, ref: 'Article' }],
    favoritedArticles: [{ type: mongoose.Types.ObjectId, ref: 'Article' }],
    comments: [{ type: mongoose.Types.ObjectId, red: 'Comment' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    let profileData = {
      username: this.username,
      bio: this.bio,
      image: this.image,
    };
    let profile = await Profile.create(profileData);
    this.profile = profile.id;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.verifyPassword = async function (password, cb) {
  try {
    var result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    return error;
  }
};

userSchema.methods.signToken = async function () {
  var payload = { userId: this.id, email: this.email };
  try {
    let profileData = await Profile.findById(this.profile);
    let payload = {
      username: profileData.username,
      bio: profileData.bio,
      image: profileData.image,
    };
    let token = await jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (error) {
    return error;
  }
};

userSchema.methods.userJSON = function (token) {
  return {
    username: this.username,
    email: this.email,
    token: token,
  };
};

var User = mongoose.model('User', userSchema);

module.exports = User;
