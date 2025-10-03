import AiService from "../services/Ai.service"

const fetchLetestNews = async (req: any, res: any) => {
    try {
        let resp = await AiService.fetchLetestNews(req.body.url, req.headers['_user']['id']);
        return res.status(200).json({
            results:resp,
            status:true
        })
    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}

const sendMessage = async (req: any, res: any) => {
    try {

        let resp = await AiService.sendMessage(req.body.message, req.body.chatKey)
        return res.status(200).json({
            resp
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}

const clearChatHistory = async (req: any, res: any) => {
    try {
        let resp = await AiService.clearChatHistory(req.headers['_user'].id)
        return res.status(200).json({
            resp,
            status: true
        })
    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}

const fetchAllChats = async (req:any, res:any) => {
    try {
        let resp = await AiService.getChatList(req.headers['_user'].id)
        return res.status(200).json({
            results:resp,
            status: true
        })
    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}

export default {
    sendMessage,
    fetchLetestNews,
    clearChatHistory,
    fetchAllChats
}