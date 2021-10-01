let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let bookSchema = new Schema(
  {
    title: String,
    author: String,
    price: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    description: { type: String },
    categories: [String],
    tags: [String],
    CreatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

let Book = mongoose.model('Book', bookSchema);

module.exports = Book;
