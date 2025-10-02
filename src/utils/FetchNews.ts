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
        // "content": "You are a web content extractor and summarizer. Given a URL, you fetch the page, parse it, and return a structured response with a header (title) and a full description (main content). If any part is missing, note it. Always output in JSON format: { \"header\": ..., \"description\": ... }."

        // const { data: html } = await axios.get(url);

        // // 2. Extract <body> text
        // const $ = cheerio.load(html);
        // const bodyText = $("body").text().replace(/\s+/g, " ").trim();
        // console.log("bodyText ", bodyText)

        // let systemPrompt = [
        //     {
        //         role: "user",
        //         parts: [{
        //             text: `
        //             You are a web content extractor. Always return JSON with fields: { "title": ..., "description": ... }.
        //             Task: Here is the HTML body text from a webpage:\n\n${bodyText}\n\n. give me the full news so user can chat with them.
        //             ⚠️ Important: Return ONLY valid JSON. Do not include backticks, markdown, or extra text.`
        //         }]
        //     }
        // ]
        let systemPrompt = [
            {
                role: "user",
                parts: [{
                    text: `get full info of this url :\n\n${url}\n\n`
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