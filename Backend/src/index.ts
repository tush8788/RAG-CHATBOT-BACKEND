import express from 'express'
import config from './config';
import indexRouter from './routes/index'

const app = express();

app.use('/api',indexRouter)

app.listen(config.port,()=>{
    console.log(`Server is up on port ${config.port}`)
})