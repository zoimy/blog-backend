import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'
import postsRouter from './routes/posts.js'
import multer from 'multer'
import checkAuth from './utils/checkAuth.js'
import fs from 'fs'

dotenv.config()

const app = express()

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({storage})

app.use(cors())
app.use(bodyParser.json())
app.use('/uploads', express.static('uploads'))

const PORT = process.env.PORT || 4000

mongoose.connect(process.env.MONGODB_URL)
.then(app.listen(PORT, () => {
	console.log(`Server started on: ${PORT}`);
}))
.catch((error) => console.log(error.message))

app.use('/auth', authRouter)
app.use('/posts', postsRouter)
app.post('/upload',checkAuth, upload.single('image'), (req,res) => {
	res.json({
		url: `/uploads/${req.file.originalname}`
	})
})


