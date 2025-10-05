import ChatShema from "../schema/chat.schema";

const createChat = async (userId:string) => {
    return ChatShema.create({user:userId})
}

const updateChat = async (chatId:string,chatHistory:any,title?:string) => {
    return ChatShema.findByIdAndUpdate(chatId,{...(title && {title : title}), $push: { history: chatHistory} },{ new: true })
}

const getAllChats = async (userId:string) =>{
    return ChatShema.find({user:userId});
}

const findChat = async (chatId:string) => {
    return ChatShema.findById(chatId)
}

const deleteChat = async(chatId:string) => {
    return ChatShema.findByIdAndDelete(chatId);
}

export default {
    createChat,
    updateChat,
    getAllChats,
    findChat,
    deleteChat
}