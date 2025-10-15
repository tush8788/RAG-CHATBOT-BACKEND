import axios from "axios"
import  {GeminiAI}  from "./GeminiAi";
import { VectorDB } from "./VectorDB";
import * as cheerio from 'cheerio'
import { isEmpty } from "lodash";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { ChatType } from "../services/Ai.service";


const splitInChunk = async (messageObj: any) => {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 1,
    });

    const docOutput = await splitter.splitDocuments([
        new Document({ pageContent: messageObj }),
    ]);

    console.log("docOutput ", docOutput);
    return docOutput
}

// let systemPrompt = [
//     {
//         role: "user",
//         parts: [{
//             text: `get full info of this url :\n\n${url}\n\n, with all key points don't miss anything and as extra info get me infomation about whose pulisher, author and date of pulish`
//         }]
//     }
// ]

const CreateFirstChat = async (data: { url?: string, pdf?: any, type: ChatType }, systemPrompt: any[], chatId: string, userId: string) => {
    try {
        const LLM = new GeminiAI();
        let message = await LLM.senMessage(systemPrompt, data.type);
        console.log("message ",message.text)
        if (isEmpty(message.text)) return `give vaild ${data.type}`

        let splitArr = await splitInChunk(message.text);
        let index = 0

        await new VectorDB().createIndexModel();
        for (let item of splitArr) {
            const embeddingData: any = await new GeminiAI().makeEmbedding(`data: ${item.pageContent}`);
            await new VectorDB().upsertInVector(`${data.type}-${index++}-${chatId}-${userId}`, embeddingData.embeddings[0]?.values, { data: item.pageContent, url: data?.url || '', chatId: chatId, userId: userId, type: data.type })
        }
        return message.text
    } catch (err) {
        console.log("err in Make --> ", err);
        throw err
    }
}

export default CreateFirstChat