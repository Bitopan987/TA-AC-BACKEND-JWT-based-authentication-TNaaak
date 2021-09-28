let express = require('express');
let router = express.Router();
let Article = require('../models/Article');
let auth = require('../middlewares/auth');
let User = require('../models/User');
let Comment = require('../models/Comment');
let slugger = require('slugger');

//Get Article
router.get('/:slug', async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug }).populate('author');
    res.status(200).json({ article: article.resultArticle() });
  } catch (error) {
    next(error);
  }
});

//Create Article
router.post('/', auth.isLoggedIn, async (req, res, next) => {
  req.body.article.author = req.user.userId;
  try {
    let article = await Article.create(req.body.article);
    let article2 = await Article.findById(article.id).populate('author');
    res.status(200).json({ article: article2.resultArticle(req.user.userId) });
  } catch (error) {
    next(error);
  }
});

//Update Article
router.put('/:slug', auth.isLoggedIn, async (req, res, next) => {
  let slug = req.params.slug;
  if (req.body.article.title) {
    req.body.article.slug = slugger(req.body.article.title, {
      replacement: '-',
    });
  }
  try {
    let article = await Article.findOne({ slug });
    if (!article) {
      return res
        .status(400)
        .json({ errors: { body: ['Theres is no article for this search'] } });
    }
    // console.log(req.user.userId, article.author);
    if (req.user.userId == article.author) {
      article = await Article.findOneAndUpdate(
        { slug },
        req.body.article
      ).populate('author');
      return res
        .status(200)
        .json({ article: article.resultArticle(req.user.userId) });
    } else {
      return res
        .status(403)
        .json({ error: { body: ['Not Authorized to perform this action'] } });
    }
  } catch (error) {
    next(error);
  }
});

//delete article

router.delete('/:slug', auth.isLoggedIn, async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug });
    if (!article) {
      return res
        .status(400)
        .json({ errors: { body: ['Theres is no article for this search'] } });
    }
    if (req.user.userId == article.author) {
      article = await Article.findOneAndDelete({ slug });
      let comments = await Comment.deleteMany({ articleId: article.id });
      return res.status(400).json({ msg: 'Article is successfully deleted' });
    } else {
      return res
        .status(403)
        .json({ error: { body: ['Not Authorized to perform this action'] } });
    }
  } catch (error) {
    next(error);
  }
});

//Add Comments to an Article

router.post('/:slug/comments', auth.isLoggedIn, async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug });
    if (!article) {
      return res
        .status(400)
        .json({ errors: { body: ['Theres is no article for this search'] } });
    }
    req.body.comment.articleId = article.id;
    req.body.comment.author = req.user.userId;
    let comment = await Comment.create(req.body.comment);
    article = await Article.findOneAndUpdate(
      { slug },
      { $push: { comments: comment.id } }
    );
    comment = await Comment.findById(comment.id).populate('author');
    return res
      .status(200)
      .json({ comment: comment.displayComment(req.user.userId) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
