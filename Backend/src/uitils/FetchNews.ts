import axios from "axios"
import { GeminiAI } from "./GeminiAi";

let newsUrls:string[] = ['https://rss.app/feeds/v1.1/tD7QLR0P0DzlFRvJ.json']

const fetchNews = async () => {
    try {
        const resp = await axios.get(newsUrls[0] as string,{});
        console.log("resp ",resp.data.items);
        //create embedding
        const embeddingData = await new GeminiAI().makeEmbedding(JSON.stringify(resp.data.items));
        console.log("embedded ",embeddingData.embeddings);
    } catch (err) {
        console.log("err",err);
    }
}

export default fetchNews