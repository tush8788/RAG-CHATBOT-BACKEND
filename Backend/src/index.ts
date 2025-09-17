import config from './config';
import server from './config/express'

server.listen(config.port,()=>{
    console.log(`Server is up on port ${config.port}`)
})