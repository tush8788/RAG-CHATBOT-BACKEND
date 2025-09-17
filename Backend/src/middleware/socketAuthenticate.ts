import { isEmpty } from "lodash";
import jwt from "../utils/jwt";
import UserModel from "../models/user.model";

const SocketAuthenticate = async (socket: any, next: any) => {
    try {
        let token = socket.handshake.auth.token
        if (isEmpty(token)) throw new Error("Token not found");
        let userInfo: any = jwt.verifyJwtToken(String(token))
        userInfo = await UserModel.getUserFromId(userInfo?.id)
        if (isEmpty(userInfo)) throw new Error()
        socket.handshake.auth = { '_user': userInfo }
        next()
    }
    catch (err) {
        console.log(err)
        next(new Error('user not found'))
    }

}

export default SocketAuthenticate