import ChatShema from "../schema/chat.schema";

const createChat = async (userId:string) => {
    return ChatShema.create({user:userId})
}

const updateChat = async (chatId:string,title:string,chatHistory:any) => {
    return ChatShema.findByIdAndUpdate(chatId,{title: title, $push: { history: chatHistory} },{ new: true })
}

export default {
    createChat,
    updateChat
}