import jwt from 'jsonwebtoken'
import config from '../config'

const createToken = (payload:{id:any}) => {
    return jwt.sign(payload,config.jwtKey,{expiresIn:'1 day'})
}

const verifyJwtToken = (token:string)=>{
    return jwt.verify(token,config.jwtKey);
}

export default {
    createToken,
    verifyJwtToken
}