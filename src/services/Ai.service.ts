import { GeminiAI } from "../utils/GeminiAi";
import fetchNews from "../utils/FetchNews";
import { VectorDB } from "../utils/VectorDB";
import { ToolNameType } from "../utils/AiTools";
import RedisService from "../utils/RedisService";
import chatModel from "../models/chat.model";
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

const sendMessage = async (message: string, chatKey: string) => {
    try {
        // await RedisService.clearChat(chatKey);
        let allMessages: AllMessageType[] = await RedisService.getMessages(chatKey);
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
        await RedisService.saveMessage(chatKey, userMessage);

        let isBuilding = true;
        while (isBuilding) {
            let aiResp = await LLM.senMessage(allMessage, 'chat');
            if (!aiResp.functionCalls?.length || aiResp.functionCalls.length < 1) {
                //store user message in redis
                await RedisService.saveMessage(chatKey, { role: 'model', parts: [{ text: aiResp.text }] });
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

const fetchLetestNews = async (url: string, userId: string) => {
    try {
        let chat = await chatModel.createChat(userId);
        let resp = await fetchNews(url, chat.id, userId);
        console.log("resp ", resp)
        const LLM = new GeminiAI()
        let userMessage = {
            role: 'user',
            parts: [{ text: `give me an summery of this : ${resp}` }]
        }
        let aiResp = await LLM.senMessage(userMessage, 'chat');
        // console.log("aiResp ",aiResp)
        let message = { role: 'model', parts: [{ text: aiResp.text }] };
        //store user message in redis
        await RedisService.saveMessage(chat.id, message);
        // store in db
        let updatedChat = await chatModel.updateChat(chat.id, 'title12', { role: message.role, text: message.parts[0]?.text });
        // return aiResp.text
        return {
            chatId:chat.id,
            title: 'title12'
        }
    } catch (err) {
        console.log("err", err)
        throw err
    }
}

const getChatHistory = async (chatKey: string) => {
    try {
        let allMessages: AllMessageType[] = await RedisService.getMessages(chatKey);
        let allM = []
        if (allMessages.length > 0) {
            allM = allMessages.map((elem) => {
                return {
                    role: elem.role,
                    text: elem?.parts[0]?.text
                }
            })
        } else {
            allM = [{ role: 'model', text: "Hello! I'm your AI assistant. How can I help you today?" }]
        }
        return allM
    } catch (err) {
        console.log(err)
        return []
    }
}

const clearChatHistory = async (chatKey: any) => {
    try {
        await RedisService.clearChat(chatKey);
        return {
            messgae: 'success'
        }
    } catch (err) {
        throw err;
    }
}

const getChatList = async (userId: string) => {
    try {
        let allChats = await chatModel.getAllChats(userId);
        return allChats.map((chat)=>({chatId:chat.id,title:chat?.title || 'title'}))
    } catch (err) {
        console.log("err", err);
        throw err;
    }
}

export default {
    sendMessage,
    fetchLetestNews,
    getChatHistory,
    clearChatHistory,
    getChatList
}