import { GeminiAI } from "../uitils/GeminiAi";
import fetchNews from "../uitils/FetchNews";
import { VectorDB } from "../uitils/VectorDB";
import { ToolNameType } from "../uitils/AiTools";
import RedisService from "../uitils/RedisService";

type AllMessageType = {
    role: string
    parts: any
}

const functionCall = async (LLM: any, toolInfo: { id?: string | null, args?: any, name?: ToolNameType | string | null }) => {
    try {
        switch (toolInfo.name) {
            case 'search_in_vector':
                //embedded user message
                let embeddedMessage = await LLM.makeEmbedding(toolInfo?.args?.message);
                //find match in vector db
                const vector = new VectorDB()
                let matchingArtical = await vector.findArticle(embeddedMessage?.embeddings[0]?.values)
                //get match
                let context = matchingArtical.matches.map(m => (`title: ${m?.metadata?.title} description:${m?.metadata?.description}`)).join("\n\n");
                return context
        }

    } catch (err: any) {
        // throw err
        return err
    }
}

const sendMessage = async (message: string) => {
    try {
        let chatKey = 'chat-1344';
        let allMessages: AllMessageType[] = await RedisService.getMessages(chatKey);
        console.log("allMessages ",allMessages)
        const LLM = new GeminiAI()
        let userMessage = {
            role: 'user',
            parts: [{ text: message }]
        }
        const allMessage: AllMessageType[] = [
            ...allMessages,
            userMessage
        ];
        //store user message in redis
        await RedisService.saveMessage(chatKey,userMessage);
        
        let isBuilding = true;
        while (isBuilding) {
            let aiResp = await LLM.senMessage(allMessage);
            if (!aiResp.functionCalls?.length || aiResp.functionCalls.length < 1) {
                //store user message in redis
                await RedisService.saveMessage(chatKey,{role: 'model',parts: [{ text: aiResp.text }]});
                //not need to make isBuilding false
                isBuilding = false
                return aiResp.text
            }

            if (aiResp.candidates?.length && aiResp.candidates.length > 0) {
                allMessage.push({ role: aiResp?.candidates[0]?.content?.role || '', parts: aiResp?.candidates[0]?.content?.parts })
            }
            //handle tool calling
            for (let tool of aiResp.functionCalls) {
                try {
                    let toolResp = await functionCall(LLM, { id: tool?.id || null, args: tool?.args || null, name: tool?.name || null });
                    let funcResp = {
                        id: tool.id,
                        name: tool.name,
                        response: { success: true, toolResp }
                    }
                    allMessage.push({ role: 'user', parts: [{ functionResponse: funcResp }] });
                } catch (error) {
                    let funcResp = {
                        id: tool.id,
                        name: tool.name,
                        response: { success: false, error: error }
                    }
                    allMessage.push({ role: 'user', parts: [{ functionResponse: funcResp }] });
                }
            }

        }
    } catch (err) {
        console.log("error ", err);
        throw err;
    }
}

const fetchLetestNews = async () => {
    try {
        await fetchNews();
        return {
            message: "done"
        }
    } catch (err) {
        throw err
    }
}

export default {
    sendMessage,
    fetchLetestNews
}