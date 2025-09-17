import AiService from "../services/Ai.service"

const fetchLetestNews = async (req: any, res: any) => {
    try {
        let resp = await AiService.fetchLetestNews();
        return res.status(200).json({
            resp
        })
    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}

const sendMessage = async (req: any, res: any) => {
    try {

        let resp = await AiService.sendMessage(req.body.message,req.body.chatKey)
        return res.status(200).json({
            resp
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}

export default {
    sendMessage,
    fetchLetestNews
}