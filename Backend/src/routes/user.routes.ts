import express from 'express'
import UserController from '../controller/user.controller'
const router = express.Router()

router.post('/verify-google-token',UserController.googleVerifyToken)

export default router