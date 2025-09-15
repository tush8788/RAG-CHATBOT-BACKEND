import axios from "axios"
import { GeminiAI } from "./GeminiAi";
import { VectorDB } from "./VectorDB";

let newsUrls: string[] = ['https://rss.app/feeds/v1.1/tD7QLR0P0DzlFRvJ.json']

const fetchNews = async () => {
    try {
        const resp = await axios.get(newsUrls[0] as string, {});
        let index = 0;
        for (let item of resp.data.items) {
            //create embedding
            const embeddingData: any = await new GeminiAI().makeEmbedding( item.title.concat(item.content_text));
            // await new VectorDB().createIndexModel();
            await new VectorDB().upsertInVector(`article-${index++}`, embeddingData.embeddings[0]?.values, { title: item.title, description: item.content_text })
        }
        return true
    } catch (err) {
        console.log("err in fetchNews --> ", err);
        throw err
    }
}

export default fetchNews