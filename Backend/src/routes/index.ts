import express from 'express'
const router = express.Router();

router.get('/health-check',(req,res)=>{
    return res.status(200).json({
        message:"Success"
    })
})


export default router