import ChatShema from "../schema/chat.schema";

const createChat = async (userId:string) => {
    return ChatShema.create({user:userId})
}

const updateChat = async (chatId:string,title:string,chatHistory:any) => {
    return ChatShema.findByIdAndUpdate(chatId,{title: title, $push: { history: chatHistory} },{ new: true })
}

const getAllChats = async (userId:string) =>{
    return ChatShema.find({user:userId});
}

export default {
    createChat,
    updateChat,
    getAllChats
}