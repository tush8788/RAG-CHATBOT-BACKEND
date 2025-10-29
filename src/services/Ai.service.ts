import { GeminiAI } from "../utils/GeminiAi";
import fetchNews from "../utils/CreateFirstChat";
import { VectorDB } from "../utils/VectorDB";
import { ToolNameType } from "../utils/AiTools";
import RedisService from "../utils/RedisService";
import chatModel from "../models/chat.model";
import { isEmpty } from "lodash";
import CreateFirstChat from "../utils/CreateFirstChat";
type AI_AllMessageType = {
    role: string
    parts: any
}

type User_AllMessageType = {
    role: string
    text: string
}

export type ChatType = 'article' | 'youtube' | 'pdf'

type AllChatType = AI_AllMessageType | User_AllMessageType

const functionCall = async (LLM: any, toolInfo: { id?: string | null, args?: any, name?: ToolNameType | string | null }, chatId: string) => {
    try {
        switch (toolInfo.name) {
            case 'search_in_vector':
                //embedded user message
                let embeddedMessage = await LLM.makeEmbedding(toolInfo?.args?.message);
                //find match in vector db
                const vector = new VectorDB()
                let matchingArtical = await vector.findArticle(embeddedMessage?.embeddings[0]?.values, { chatId: chatId })
                //get match
                let context = matchingArtical.matches.map(m => {
                    console.log("m?.metadata?.data ", m?.metadata?.data)
                    return (`data:${m?.metadata?.data}`)
                }
                ).join("\n\n");
                return context
        }

    } catch (err: any) {
        // throw err
        return err
    }
}

const sendMessage = async (message: string, chatId: string) => {
    try {
        // await RedisService.clearChat(chatId);
        let allMessages: AI_AllMessageType[] = await RedisService.getMessages(chatId);
        console.log("allMessages ", allMessages)
        const LLM = new GeminiAI()
        let userMessage = {
            role: 'user',
            parts: [{ text: message }]
        }
        const allMessage: AI_AllMessageType[] = [
            ...allMessages,
            userMessage
        ];
        //store user message in redis
        await RedisService.saveMessage(chatId, userMessage);
        //save mesage in db
        await chatModel.updateChat(chatId, { role: userMessage.role, text: userMessage.parts[0]?.text });

        let isBuilding = true;
        while (isBuilding) {
            let aiResp = await LLM.senMessage(allMessage, 'chat');
            if (!aiResp.functionCalls?.length || aiResp.functionCalls.length < 1) {
                //store model message in redis
                await RedisService.saveMessage(chatId, { role: 'model', parts: [{ text: aiResp?.text || 'can you ask again' }] });
                await chatModel.updateChat(chatId, { role: 'model', text: aiResp?.text || 'can you ask again' });
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
                    let toolResp = await functionCall(LLM, { id: tool?.id || null, args: tool?.args || null, name: tool?.name || null }, chatId);
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

// const fetchLetestNews = async (url: string, userId: string) => {
//     try {
//         let chat = await chatModel.createChat(userId, { url });
//         let resp = await fetchNews(url, chat.id, userId);
//         console.log("resp ", resp)
//         const LLM = new GeminiAI()
//         let userMessage = {
//             role: 'user',
//             parts: [{ text: `give me an summery of this : ${resp}` }]
//         }
//         let aiResp = await LLM.senMessage(userMessage, 'chat');
//         let articleTitleMessage = {
//             role: 'user',
//             parts: [{ text: `give me an title of this : ${aiResp.text} article` }]
//         }
//         let titleOfArticle = await LLM.senMessage(articleTitleMessage, 'chat');
//         let message = { role: 'model', parts: [{ text: aiResp.text }] };

//         let systemPForMarkup = "You are a content-to-markdown converter. Produce a Markmap-compatible Markdown representation of the article text provided below. Requirements: - Return **ONLY valid Markdown** (no explanations, no backticks, no extra text). - Use headings (`#`, `##`, `###`) for the main title and sections. - Convert important paragraphs into bullet points where appropriate. - Keep each bullet short (1–2 sentences). - Preserve and include important links (as inline `[text](url)`). - Do not truncate; include all major sections and key details. Article text:"
//         //get markup
//         let articleMarkupMessage = {
//             role: 'user',
//             parts: [{
//                 text: `${systemPForMarkup} ${resp}`
//             }]
//         }
//         let markupArticle = await LLM.senMessage(articleMarkupMessage, 'chat');

//         //store user message in redis
//         await RedisService.saveMessage(chat.id, message);
//         // store in db
//         await chatModel.updateChat(chat.id, { role: message.role, text: message.parts[0]?.text }, titleOfArticle?.text, markupArticle.text);
//         // return aiResp.text
//         return {
//             chatId: chat.id,
//             title: titleOfArticle?.text || 'title-1'
//         }
//     } catch (err) {
//         console.log("err", err)
//         throw err
//     }
// }

const createMarkup = async (chatResp: string, type: ChatType) => {
    try {
        const LLM = new GeminiAI()
        let systemPForMarkup = "You are a content-to-markdown converter. Produce a Markmap-compatible Markdown representation of the article text provided below. Requirements: - Return **ONLY valid Markdown** (no explanations, no backticks, no extra text). - Use headings (`#`, `##`, `###`) for the main title and sections. - Convert important paragraphs into bullet points where appropriate. - Keep each bullet short (1–2 sentences). - Preserve and include important links (as inline `[text](url)`). - Do not truncate; include all major sections and key details."
        let articleMarkupMessage = {
            role: 'user',
            parts: [{
                text: `${systemPForMarkup} ${type} text: ${chatResp}`
            }]
        }
        let markupInfo = await LLM.senMessage(articleMarkupMessage, 'chat');
        return {
            markup: markupInfo.text
        }

    } catch (err) {
        console.log("err createMarkup", err);
        throw err;
    }
}

const getTitleAndSummery = async (chatResp: string, type: ChatType) => {
    try {
        let summerySystemPrompt = {
            role: 'user',
            parts: [{ text: `give me an summery of this : ${chatResp}` }]
        }
        let LLM = new GeminiAI();
        let summeryResp = await LLM.senMessage(summerySystemPrompt, 'chat');
        let titleSystemPrompt = {
            role: 'user',
            parts: [{ text: `give me an title of this : ${summeryResp.text} ${type}` }]
        }
        let titleResp = await LLM.senMessage(titleSystemPrompt, 'chat');

        return {
            title: titleResp.text,
            summery: summeryResp.text
        }

    } catch (err) {
        console.log("err in getTitleAndSummery : ", err)
        throw err;
    }
}

const createNewChat = async (data: { type: ChatType, url?: string, pdf?: any }, userId: string) => {
    try {
        let metaData: any;
        let systemPrompt: any[] = [];
        switch (data.type) {
            case 'article':
                metaData = { type: data?.type, url: data?.url }
                systemPrompt = [
                    {
                        role: "user",
                        parts: [{
                            text: `get full info of this url :\n\n${metaData.url}\n\n, with all key points don't miss anything and as extra info get me infomation about whose pulisher, author and date of pulish`
                        }]
                    }
                ]
                break;
            case 'youtube':
                metaData = { type: data?.type, url: data?.url }
                systemPrompt = [
                    {
                        role: "user",
                        parts: [
                            { text: `Please give full indetail info the following YouTube video, with all key points dont miss anything.` },
                            { fileData: { fileUri: `${data.url}` } }
                        ]
                    }
                ]
                break;
            case 'pdf':
                const LLM = new GeminiAI();
                let file = await LLM.uploadDocument(data.pdf)
                metaData = { type: data?.type, }
                systemPrompt = [
                    {
                        role: "user",
                        parts: [
                            { text: `Please give full indetail info the following document, with all key points dont miss anything.` },
                            file
                        ]
                    }
                ]
                break;
        }
        //create chat id
        let chat = await chatModel.createChat(userId, metaData);
        //create first chat
        let chatResp: string = await CreateFirstChat(data, systemPrompt, chat.id, userId) || '';

        //create basic summery and title
        let titleAndSummeryInfo = await getTitleAndSummery(chatResp, data.type);
        //create markup
        let markupInfo = await createMarkup(chatResp, data.type);

        let message = { role: 'model', parts: [{ text: titleAndSummeryInfo.summery }] };

        //store user message in redis
        await RedisService.saveMessage(chat.id, message);

        // store in db
        await chatModel.updateChat(chat.id, { role: message.role, text: message.parts[0]?.text }, titleAndSummeryInfo.title, markupInfo.markup);

        return {
            chatId: chat.id,
            title: titleAndSummeryInfo.title || 'title-1'
        }

    } catch (err) {
        console.log("err ", err);
        throw err;
    }
}

const convertChatInFormat = (type: 'ai' | 'user', chat: any) => {
    try {
        let updatedChat;
        switch (type) {
            case 'ai':
                updatedChat = chat.map((elem: User_AllMessageType) => {
                    return {
                        role: elem.role,
                        parts: [{ text: elem.text }]
                    }
                })
                break;
            case 'user':
                updatedChat = chat.map((elem: AI_AllMessageType) => {
                    return {
                        role: elem.role,
                        text: elem?.parts[0]?.text
                    }
                })
                break;
            default:
                updatedChat = [];
        }

        return updatedChat;
    } catch (err) {
        return [];
    }
}

const getChatHistory = async (chatId: string) => {
    try {
        if (isEmpty(chatId)) throw new Error("Chat is Empty")
        let allMessages: AI_AllMessageType[] = await RedisService.getMessages(chatId);
        let DBChat = await chatModel.findChat(chatId)
        console.log("DBChat?.history ", DBChat?.history)

        let allM = []
        if (allMessages.length > 0) {
            console.log("allMessages ", allMessages)
            allM = convertChatInFormat('user', allMessages);
            console.log("allM ", allM)
        } else {
            let DBChat = await chatModel.findChat(chatId)
            console.log("DBChat?.history inside ", DBChat?.history)
            if (isEmpty(DBChat?.history)) return [{ role: 'model', text: "Hello! I'm your AI assistant. How can I help you today?" }]
            let aiChat: AI_AllMessageType[] = convertChatInFormat('ai', DBChat?.history);
            //save db chat in redis
            aiChat.map(async (chat) => {
                await RedisService.saveMessage(chatId, chat);
            });
            allM = DBChat?.history || [];
        }
        return allM
    } catch (err) {
        console.log("error in getChatHistory", err)
        console.log("chat Id ", chatId);
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
        return allChats.map((chat) => ({ chatId: chat.id, title: chat?.title || 'title' }))
    } catch (err) {
        console.log("err", err);
        throw err;
    }
}

const deleteChat = async (chatId: string, userId: string) => {
    try {
        // article-0-68e2241fed5e6f7753cb187f-68cb078a80deb90b55293bc0
        // clear chat inside redis
        await RedisService.clearChat(chatId);
        // delete chat form db
        await chatModel.deleteChat(chatId);
        // clear chat form vector
        let resp = await new VectorDB().deleteVectorRecords(chatId);
        console.log("resp ", resp);
    } catch (err) {
        console.log("Error in deleteChat", err);
        throw err;
    }
}

const getMarkup = async (chatId: string, userId: string) => {
    try {
        const chat = await chatModel.findChat(chatId);
        return { markup: chat?.markup || '' }
    } catch (err) {
        console.log("Error in getMarkup ", err);
        throw err;
    }
}

export default {
    sendMessage,
    // fetchLetestNews,
    createNewChat,
    getChatHistory,
    clearChatHistory,
    getChatList,
    deleteChat,
    getMarkup
}