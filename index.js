import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
import authRouter from './routes/auth.js'
import postsRouter from './routes/posts.js'
import multer from 'multer'
import checkAuth from './utils/checkAuth.js'
import fs from 'fs'


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

const PORT = process.env.PORT || 4444

mongoose.connect(process.env.MONGO_URL)
.then(app.listen(PORT, () => {
	console.log(`Server started on: ${PORT}`);
}))
.catch((error) => console.log(error.message))

app.use('/posts', postsRouter)
app.use('/auth', authRouter)
app.get('/', (req,res) =>{
	res.json({message: 'Main / direcory'})
})
app.post('/upload',checkAuth, upload.single('image'), (req,res) => {
	res.json({
		url: `/uploads/${req.file.originalname}`
	})
})


