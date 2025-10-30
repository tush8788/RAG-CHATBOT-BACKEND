import ChatShema from "../schema/chat.schema";

const createChat = async (userId: string, metadata: { url?: string,type:string }) => {
    return ChatShema.create({ user: userId, metadata: metadata })
}

const updateChat = async (chatId: string, chatHistory: any, title?: string, markup?: string) => {
    return ChatShema.findByIdAndUpdate(chatId, {
        ...(title && { title: title }),
        ...(markup && { markup: markup }),
        $push: { history: chatHistory }
    },
        {
            new: true
        }
    )
}

const getAllChats = async (userId: string) => {
    return ChatShema.find({ user: userId }).sort({ updatedAt: -1 });
}

const findChat = async (chatId: string) => {
    return ChatShema.findById(chatId)
}

const deleteChat = async (chatId: string) => {
    return ChatShema.findByIdAndDelete(chatId);
}

export default {
    createChat,
    updateChat,
    getAllChats,
    findChat,
    deleteChat
}