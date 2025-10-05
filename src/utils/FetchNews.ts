import axios from "axios"
import { GeminiAI } from "./GeminiAi";
import { VectorDB } from "./VectorDB";
import * as cheerio from 'cheerio'
import { isEmpty } from "lodash";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";


let newsUrls: string[] = ['https://rss.app/feeds/v1.1/tD7QLR0P0DzlFRvJ.json', 'https://rss.app/feeds/v1.1/Gkb4mSsF1VUQYbbm.json', 'https://rss.app/feeds/v1.1/tLp8ZixTWXbToF1k.json', 'https://rss.app/feeds/v1.1/t9mmoIk4Ofix4tHQ.json', 'https://rss.app/feeds/v1.1/burb51p0ePCf3hsZ.json']

// const fetchNews = async () => {
//     try {
//         const resp = await axios.get(newsUrls[0] as string, {});
//         let index = 0;
//         for (let item of resp.data.items) {
//             //create embedding
//             const embeddingData: any = await new GeminiAI().makeEmbedding( item.title.concat(item.content_text));
//             // await new VectorDB().createIndexModel();
//             await new VectorDB().upsertInVector(`article-${index++}`, embeddingData.embeddings[0]?.values, { title: item.title, description: item.content_text })
//         }
//         return true
//     } catch (err) {
//         console.log("err in fetchNews --> ", err);
//         throw err
//     }
// }

const splitInChunk = async (messageObj:any) => {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 1,
    });

    const docOutput = await splitter.splitDocuments([
        new Document({ pageContent: messageObj }),
    ]);

    console.log("docOutput ",docOutput);
    return docOutput
}




const fetchNews = async (url: string, chatId: string, userId: string) => {
    try {
        let systemPrompt = [
            {
                role: "user",
                parts: [{
                    text: `get full info of this url :\n\n${url}\n\n, with all key points don't miss anything and as extra info get me infomation about whose pulisher, author and date of pulish`
                }]
            }
        ]

        const LLM = new GeminiAI();
        let message = await LLM.senMessage(systemPrompt, 'fecthNews');
        console.log("message ", message.text);
        if(isEmpty(message.text)) return "give vaild url"

        let splitArr =  await splitInChunk(message.text);
        let index = 0

        await new VectorDB().createIndexModel();
        for(let item of splitArr){
            const embeddingData: any = await new GeminiAI().makeEmbedding(`data: ${item.pageContent}`);
            await new VectorDB().upsertInVector(`article-${index++}-${chatId}-${userId}`, embeddingData.embeddings[0]?.values, { data: item.pageContent, url: url, chatId: chatId, userId: userId })
        }
        return message.text
    } catch (err) {
        console.log("err in fetchNews --> ", err);
        throw err
    }
}

export default fetchNews