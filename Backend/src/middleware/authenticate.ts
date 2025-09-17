import { NextFunction,Response } from "express";
import { isEmpty } from "lodash";
import UserModel from "../models/user.model";
import jwt from "../utils/jwt"; 

let whileListUrls = [
    '/api/health-check',
    '/api/user/verify-google-token'
]

const Authenticate = async (req:any,res:Response,next:NextFunction) => {
    try{
        console.log("req.url ",req.url)
        if(!whileListUrls.includes(req.url)){
            let token = req.headers['x-rag-chatbot-token'] || '';
            if(isEmpty(token)) throw new Error("Token not found");
            let userInfo:any = jwt.verifyJwtToken(String(token))
            userInfo = UserModel.getUserFromId(userInfo?.id)
            if(isEmpty(userInfo)) throw new Error()
            req.headers['_user'] = { id: userInfo.id };
        }else{
            next();
        }
    }
    catch(err){
        return res.status(401).json({
            results:err,
            success:false
        })
    }
}

export default Authenticate