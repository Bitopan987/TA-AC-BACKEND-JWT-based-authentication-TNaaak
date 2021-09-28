let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let commentSchema = new Schema(
  {
    body: { type: String, required: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

commentSchema.methods.displayComment = function (id = null) {
  return {
    id: this.id,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    author: this.author.displayUser(id),
  };
};

let Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
