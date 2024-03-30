import mongoose, { mongo } from "mongoose";

const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Ссылка на модель пользователя
    required: true,
  },
}, {
  timestamps: true // Добавление временных меток для комментариев
});

const PostSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	text: {
		type: String,
		required: true,
	},
	tags: {
		type: [String],
		default: [],
	},
	comments: [CommentSchema],
	viewsCount: {
		type: Number,
		default: 0,
	},
	imageUrl: String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
}, {
	timestamps: true
})

const PostModel = mongoose.model('Post', PostSchema)
const CommentModel = mongoose.model('Comment', CommentSchema)

export {CommentModel,PostModel}