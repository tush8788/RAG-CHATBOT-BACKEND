import express from 'express'
import connectDB from '../utils/mongoose'
import router from '../routes';
import cors from 'cors'
// import Authenticate from '../middleware/authenticate';
import { app, server } from './socketServer'
import bodyParser from 'body-parser';
import indexRouter from '../routes'

//db connection
connectDB()

app.use(cors({
    origin: '*'
}))

app.use(bodyParser.json({}))

app.use('/api',indexRouter)

// app.use(Authenticate);

//api
app.use('/api', router)

export default server