import mongoose from 'mongoose'
import config from '../config';


//  { role: 'model', parts: [{ text: aiResp.text }]};
const historySchema = new mongoose.Schema({
    role: { type: String,required:true },
    text: { type: String,required:true },
    timestamp: { type: Date, default: Date.now } // when the message was sent
});

const chatSchema = new mongoose.Schema({
    title:{
        type:String,
        require:false
    },
    markup:{
        type:String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    history: [historySchema],
    model: { type: String, default: config.aiConfig.model },
    metadata: { type: Object },
},{
    timestamps:true
})

const Chat = mongoose.model('Chat',chatSchema);

export default Chat