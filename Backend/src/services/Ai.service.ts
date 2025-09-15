import {GeminiAI} from "../uitils/GeminiAi";

const sendMessage = async (message:string) => {
    try {
        let resp = await new GeminiAI().senMessage(message);
        console.log("ai respose --> ",resp);
        return resp.text;
    } catch (err) {
        throw err;
    }
}

export default {
    sendMessage
}