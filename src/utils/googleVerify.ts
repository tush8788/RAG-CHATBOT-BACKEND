import {OAuth2Client} from 'google-auth-library'
import config from '../config';

export default async (token:string) => {
    try{
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken:token,
            audience:config.googleClientId
        })

        let payload = ticket.getPayload();
        return payload
    }
    catch(err){
        throw err;
    }
}