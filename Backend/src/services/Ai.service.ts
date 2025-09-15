import {GeminiAI} from "../uitils/GeminiAi";
import fetchNews from "../uitils/FetchNews";

const sendMessage = async (message:string) => {
    try {
        await fetchNews()
        // let resp = await new GeminiAI().senMessage(message);
        // console.log("ai respose --> ",resp.text);
        // return resp.text;
        return{
            m : 'done'
        }
    } catch (err) {
        throw err;
    }
}

export default {
    sendMessage
}