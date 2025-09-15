import express from 'express'
const router = express.Router();
import aiRoutes from './ai.routes'

router.get('/health-check',(req,res)=>{
    return res.status(200).json({
        message:"Success"
    })
})

router.use('/ai',aiRoutes)


export default router