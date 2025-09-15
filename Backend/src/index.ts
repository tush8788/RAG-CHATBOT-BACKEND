import express from 'express'
import config from './config';
import indexRouter from './routes/index'
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json({}))

app.use('/api',indexRouter)

app.listen(config.port,()=>{
    console.log(`Server is up on port ${config.port}`)
})