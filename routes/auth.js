import express from "express";
import bcrypt from 'bcrypt'
import UserModel from "../models/User.js";
import handleValidationErrors from "../handleValidationErrors.js";
import { loginValidation, registerValidation } from "../validations.js";
import jwt from 'jsonwebtoken'
import checkAuth from "../utils/checkAuth.js";

const router = express.Router()

const SECRET = process.env.JWT_SECRET

router.post('/register',registerValidation, handleValidationErrors, async (req, res) => {
	try {
		const { email, password, fullName, avatarUrl } = req.body

		const salt = await bcrypt.genSalt(10)
		const passwordHash = await bcrypt.hash(password, salt)

		const newUser = new UserModel({
			email,
			fullName,
			avatarUrl,
			password: passwordHash,
		})

		const user = await newUser.save()

		const token = jwt.sign(
			{
				_id: user._id,
			},
			SECRET,
			{
				expiresIn: '1d'
			}
		)

		res.status(201).json({...user._doc, token})
	} catch (error) {
		res.status(500).json(error.message)
	}
})

router.post('/login',loginValidation, handleValidationErrors, async (req, res) => {
	try {
		const {email, password} = req.body
		const user = await UserModel.findOne({email})
		if (!user){
			res.status(401).json({message: "Wrong email or password"})
		}

		const isValid = await bcrypt.compare(password, user._doc.password)

		if (!isValid){
			res.status(401).json({message: "Wrong email or password"})
		}

		const token = jwt.sign(
			{
				_id: user._id,
			},
			SECRET,
			{
				expiresIn: '1d'
			}
		)

		res.status(201).json({...user._doc, token})
	} catch (error) {
		res.status(401).json(error.message)
	}
})

router.get('/me', checkAuth, async(req,res) => {
	try {
		const user = await UserModel.findById(req.userId)
		if(!user){
			return res.status(404).json({
				message: "User is not found"
			})
		}
		
		res.status(200).json(user)
	} catch (error) {
		console.log(error);
    res.status(500).json({
      message: 'No access',
    });
	}
})

export default router