import {GeminiAI} from "../uitils/GeminiAi";
import fetchNews from "../uitils/FetchNews";
import { VectorDB } from "../uitils/VectorDB";

const sendMessage = async (message:string) => {
    try {
        //make embedding of user message
        const LLM = new GeminiAI()
        let embeddedMessage:any = await LLM.makeEmbedding(message);
        //find match in vector db
        const vector = new VectorDB()
        let matchingArtical = await vector.findArticle(embeddedMessage?.embeddings[0]?.values)
        let context = matchingArtical.matches.map(m => (`title: ${m?.metadata?.title } description:${m?.metadata?.description}`)).join("\n\n");
        // pass context and message to ai
        let resp = await new GeminiAI().senMessage(`Answer the question using the following context:${context} Question: ${message}`);
        return{
            message: resp.text
        }
    } catch (err) {
        console.log("error ",err);
        throw err;
    }
}

const fetchLetestNews = async () => {
    try{
        await fetchNews();
        return {
            message:"done"
        }
    }catch(err){
        throw err
    }
}

export default {
    sendMessage,
    fetchLetestNews
}