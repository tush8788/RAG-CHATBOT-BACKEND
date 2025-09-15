import AiService from "../services/Ai.service"

const sendMessage = async(req: any, res: any) => {
    try {

        let resp = await AiService.sendMessage(req.body.message)
        return res.status(200).json({
            resp
        })

    } catch (err: any) {
        res.status(500).message({
            message: err.message
        })
    }
}

export default {
    sendMessage
}