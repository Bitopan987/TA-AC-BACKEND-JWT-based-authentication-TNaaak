var jwt = require('jsonwebtoken');

module.exports = {
  verifyToken: async (req, res, next) => {
    console.log(req.headers);
    var token = req.headers.authorization;
    try {
      if (token) {
        var payload = await jwt.verify(token, 'thisisasecret');
        req.user = payload;
        next();
      } else {
        res.status(400).json({ error: 'Token Required' });
      }
    } catch (error) {
      next(error);
    }
  },
};
