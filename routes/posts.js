import express from "express";
import handleValidationErrors from "../handleValidationErrors.js";
import checkAuth from "../utils/checkAuth.js";
import { createPostValidation } from "../validations.js";
import { CommentModel, PostModel } from "../models/Post.js";
import UserModel from '../models/User.js'

const router = express.Router()

router.post('/', checkAuth, createPostValidation, handleValidationErrors, async (req, res) => {
	try {
		const newPost = new PostModel({
			title: req.body.title,
			text: req.body.text,
			imageUrl: req.body.imageUrl,
			tags: req.body.tags.split(','),
			user: req.userId,
		})

		const post = await newPost.save()

		res.status(201).json(post)
	} catch (error) {
		console.log(error);
		res.status(500).json(error.message)
	}
})

router.get('/', async (req, res) => {
	try {
		const posts = await PostModel.find().populate('user').exec()

		res.status(201).json(posts)
	} catch (error) {
		res.status(500).json({ message: "Cant get posts" })
	}
})

router.get('/comments/latest', async (req, res) => {
	try {
		const comments = await CommentModel.find().populate('user').sort({ createdAt: -1 }).limit(5);
		console.log(comments);

		if (!comments || comments.length === 0) {
			return res.status(404).json({ message: 'No comments found' });
		}

		res.status(200).json(comments);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to fetch comments' });
	}
});

router.get('/popular', async (req, res) => {
	try {
		const posts = await PostModel.find().sort({ viewsCount: -1 }).populate('user').exec()

		res.status(200).json(posts)
	} catch (error) {
		res.status(500).json({ message: "Cant get posts" })
	}
})


router.get('/tags', async (req, res) => {
	try {
		const posts = await PostModel.find().limit(5).exec()

		const tags = posts.map((obj) => obj.tags).flat().slice(0, 5)

		res.status(201).json(tags)
	} catch (error) {
		res.status(500).json({ message: "Cant get posts" })
	}
})

router.get('/tags/:tag', async (req, res) => {
	const { tag } = req.params
	try {
		const posts = await PostModel.find({ tags: tag }).populate('user').exec()
		res.status(201).json(posts)
	} catch (error) {
		res.status(500).json({ message: "Cant get posts" })
	}
})

router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;

		const updatedPost = await PostModel.findOneAndUpdate(
			{ _id: id },
			{ $inc: { viewsCount: 1 } },
			{ returnDocument: 'after' }
		).populate('user');

		if (!updatedPost) {
			return res.status(404).json({ message: 'Статья не найдена' });
		}

		res.json(updatedPost);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Не удалось получить статьи' });
	}
});



router.delete('/:id', checkAuth, async (req, res) => {
	try {
		const { id } = req.params
		await PostModel.findByIdAndDelete(
			{
				_id: id
			},
		).populate('user')

		res.json({ message: 'success' })
	} catch (error) {
		res.status(500).json({ message: "wrong delete" })
	}
})

router.patch('/:id', checkAuth, async (req, res) => {
	try {
		const { id } = req.params
		await PostModel.updateOne(
			{
				_id: id
			},
			{
				title: req.body.title,
				text: req.body.text,
				imageUrl: req.body.imageUrl,
				tags: req.body.tags,
				user: req.userId,
			}
		)

		res.json({ message: 'success' })
	} catch (error) {
		res.status(500).json({ message: "wrong update" })
	}
})

router.post('/:id/comments', checkAuth, async (req, res) => {
	try {
		const { id } = req.params;
		const post = await PostModel.findById(id);

		if (!post) {
			return res.status(404).json({ message: 'Пост не найден' });
		}

		const user = await UserModel.findById(req.userId);

		if (!user) {
			return res.status(404).json({ message: 'Пользователь не найден' });
		}

		const newComment = {
			text: req.body.text,
			user: {
				_id: req.userId,
				fullName: user.fullName,
				avatarUrl: user.avatarUrl
			},
		};

		post.comments.push(newComment);
		await post.save();

		res.status(201).json(post.comments);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Не удалось добавить комментарий' });
	}
});

router.get('/:id/comments', async (req, res) => {
	try {
		const postId = req.params.id;
		const post = await PostModel.findById(postId).populate('comments.user');

		if (!post) {
			return res.status(404).json({ message: 'Пост не найден' });
		}

		res.status(200).json(post.comments);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Не удалось получить комментарии для поста' });
	}
});


router.delete('/:postId/comments/:commentId', checkAuth, async (req, res) => {
	try {
		const { postId, commentId } = req.params;
		const post = await PostModel.findById(postId);

		if (!post) {
			return res.status(404).json({ message: 'Пост не найден' });
		}

		const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);

		if (commentIndex === -1) {
			return res.status(404).json({ message: 'Комментарий не найден' });
		}

		post.comments.splice(commentIndex, 1);
		await post.save();

		res.status(200).json({ message: 'Комментарий удален' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Не удалось удалить комментарий' });
	}
});



export default router