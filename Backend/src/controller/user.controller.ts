import UserService from "../services/user.service"

const googleVerifyToken = async (req:any, res:any) => {
    try {
        let { token } = req.body;
        let resp = await UserService.verifyGoogleToken(token);
        return res.status(200).json({
            results:resp,
            success:true
        })
    }
    catch (err:any) {
         return res.status(500).json({
            results:err,
            success:false
        })
    }
}

export default {
    googleVerifyToken
}