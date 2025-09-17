import express from 'express'
const router = express.Router();
import aiRoutes from './ai.routes'
import userRoutes from './user.routes'

router.get('/health-check',(req,res)=>{
    return res.status(200).json({
        message:"Success"
    })
})

router.use('/ai',aiRoutes)
router.use('/user',userRoutes)

export default router