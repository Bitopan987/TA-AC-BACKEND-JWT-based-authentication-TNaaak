var express = require('express');
var User = require('../models/User');
var Book = require('../models/Book');
var auth = require('../middlewares/auth');

var router = express.Router();

// Protecting the routes
router.use(auth.verifyToken);

/* GET list of all books. */
router.get('/', async function (req, res, next) {
  try {
    var books = await Book.find({});
    res.status(200).json({ books });
  } catch (error) {
    next(error);
  }
});

// create a new book
router.post('/', async (req, res, next) => {
  let data = req.body;
  req.body.CreatedBy = req.user.userId;
  try {
    var createdBook = await Book.create(data);
    res.status(200).json({ createdBook });
  } catch (error) {
    next(error);
  }
});

// //update a book

router.put('/:id', async (req, res, next) => {
  let data = req.body;
  let bookId = req.params.id;
  try {
    var updatedBook = await Book.findByIdAndUpdate(bookId, data);
    res.status(200).json({ updatedBook });
  } catch (error) {
    next(error);
  }
});

// //delete a book

router.delete('/delete/:id', async (req, res, next) => {
  let bookId = req.params.id;
  try {
    let deletedBook = await Book.findByIdAndDelete(bookId);
    res.status(200).json({ deletedBook });
  } catch (error) {
    next(error);
  }
});

//Get books by author
router.get('/:author', async (req, res, next) => {
  let author = req.params.author;
  try {
    var books = await Book.find({ author: author });
    res.status(200).json({ books });
  } catch (error) {
    return next(error);
  }
});

// Adding category

router.put('/category/:id', async (req, res, next) => {
  var bookId = req.params.id;
  try {
    var book = await Book.findByIdAndUpdate(
      bookId,
      {
        $push: { categories: req.body.categories },
      },
      { new: true }
    );
    res.status(200).json({ book });
  } catch (error) {
    return next(error);
  }
});

// Update category

router.put('/edit/category/:id', async (req, res, next) => {
  var bookId = req.params.id;
  const { categoryToRemove, categoryToAdd } = req.body;
  try {
    await Book.updateOne(
      { _id: bookId, categories: categoryToRemove },
      { $set: { 'categories.$': categoryToAdd } }
    );
    var book = await Book.findById(bookId);
    res.status(200).json({ book });
  } catch (error) {
    return next(error);
  }
});

// Delete category
router.put('/delete/category/:id', async (req, res, next) => {
  var bookId = req.params.id;
  try {
    var book = await Book.findByIdAndUpdate(
      bookId,
      {
        $pull: { categories: req.body.category },
      },
      { new: true }
    );
    res.status(200).json({ book });
  } catch (error) {
    return next(error);
  }
});

//Get all categories
router.get('/all/categories', async (req, res, next) => {
  try {
    var categories = await Book.find({}).distinct('categories');
    res.status(200).json({ categories });
  } catch (error) {
    return next(error);
  }
});

//Get books by category

router.get('/category/:category', async (req, res, next) => {
  let category = req.params.category;
  try {
    var books = await Book.find({ categories: { $in: category } });
    res.status(200).json({ books });
  } catch (error) {
    return next(error);
  }
});

// Adding tag

router.put('/tag/:id', async (req, res, next) => {
  var bookId = req.params.id;
  try {
    var book = await Book.findByIdAndUpdate(
      bookId,
      {
        $push: { tags: req.body.tags },
      },
      { new: true }
    );
    res.status(200).json({ book });
  } catch (error) {
    return next(error);
  }
});

//   // Update tag

router.put('/edit/tag/:id', async (req, res, next) => {
  var bookId = req.params.id;
  const { tagToRemove, tagToAdd } = req.body;
  try {
    await Book.updateOne(
      { _id: bookId, tags: tagToRemove },
      { $set: { 'tags.$': tagToAdd } }
    );
    var book = await Book.findById(bookId);
    res.status(200).json({ book });
  } catch (error) {
    return next(error);
  }
});

//   // Delete tag
router.put('/delete/tag/:id', async (req, res, next) => {
  var bookId = req.params.id;
  try {
    var book = await Book.findByIdAndUpdate(
      bookId,
      {
        $pull: { tags: req.body.tags },
      },
      { new: true }
    );
    res.status(200).json({ book });
  } catch (error) {
    return next(error);
  }
});

//Get all tags
router.get('/all/tags', async (req, res, next) => {
  try {
    var tags = await Book.find({}).distinct('tags');
    res.status(200).json({ tags });
  } catch (error) {
    return next(error);
  }
});

//Get books by tags

router.get('/tags/:tag', async (req, res, next) => {
  let tag = req.params.tag;
  try {
    var books = await Book.find({ tags: { $in: tag } });
    res.status(200).json({ books });
  } catch (error) {
    return next(error);
  }
});

// Add book to cart
router.put('/add/:id', async (req, res, next) => {
  var bookId = req.params.id;
  var book = await Book.findById(bookId);
  if (book.quantity > 0) {
    var user = await User.findByIdAndUpdate(req.user.userId, {
      $push: {
        cart: {
          quantity: 1,
          book: book._id,
        },
      },
    });
    res.status(200).json({ cart: user.cart });
  }
});

// Remove book from cart
router.put('/remove-from-cart/:id', async (req, res, next) => {
  var bookId = req.params.id;
  var user = await Version1User.findByIdAndUpdate(
    req.user.userId,
    {
      $pull: {
        quantity: 1,
        book: bookId,
      },
    },
    { new: true }
  );
  res.status(200).json({ cart: user.cart });
});

// Remove book from cart
router.put('/remove/:id', async (req, res, next) => {
  var bookId = req.params.id;
  var user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $pull: {
        quantity: 1,
        book: bookId,
      },
    },
    { new: true }
  );
  res.status(200).json({ cart: user.cart });
});

module.exports = router;
