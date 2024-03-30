import { body } from "express-validator";

export const loginValidation = [
	body('email','Wrong email').isEmail(),
	body('password','Password must be min 5 symbols').isLength({min: 5}),
]

export const registerValidation = [
	body('email','Wrong email').isEmail(),
	body('password','Password must be min 5 symbols').isLength({min: 5}),
	body('fullName','fullName must be min 3 symbols').isLength({min: 3}),
	body('avatarUrl','Wrong link to avatar').optional().isURL(),
]

export const createPostValidation = [
  body('title', 'Min 3 in title').isLength({ min: 3 }).isString(),
  body('text', 'Min 3 in text').isLength({ min: 3 }).isString(),
  body('tags', 'Wrong tags').optional(),
  body('imageUrl', 'Wrong image link').optional().isString(),
];