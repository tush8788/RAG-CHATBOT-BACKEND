import googleVerify from '../utils/googleVerify'
import UserModel from '../models/user.model'
import jwt from '../utils/jwt'
import { isEmpty } from 'lodash'

const verifyGoogleToken = async (token:string) => {
    try{
        let resp = await googleVerify(token);
        let userInfo = await UserModel.getUserFromEmail(String(resp?.email))

        if(isEmpty(userInfo)){
            userInfo = await UserModel.createUser(String(resp?.email),String(resp?.name),String(resp?.picture))
        }

        let jwtToken = jwt.createToken({id:userInfo.id})

        return{
            name:userInfo.name,
            email:userInfo.email,
            profileImage:userInfo.profileImage,
            token:jwtToken
        }
    }
    catch(err){
        throw err;
    }
}

export default {
    verifyGoogleToken
}