import http from 'http'
import express from 'express'
import { Server, Socket } from 'socket.io'
import AiService from '../services/Ai.service';
import SocketAuthenticate from '../middleware/socketAuthenticate';

const app = express();
//create server
const server = http.createServer(app);

//create socket server
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
    transports: ['websocket']
})

io.use(SocketAuthenticate)

//use socket event
io.on('connection', async (socket: Socket) => {
    try {
        console.log("socket connect ");
        const { _user } = socket.handshake.auth;
        let allChats = await AiService.getChatHistory(_user.id);
        socket.emit('chat_history',allChats);

        // socket.emit('ai_message','welcom user');
        
        socket.on('user_message',async (data:{message:string})=>{
            try{
                let aiResp = await AiService.sendMessage(data.message,_user.id)
                socket.emit('ai_message',{role:'model',text:aiResp});
            }catch(err:any){
                socket.emit('ai_message',{role:'model',text:err.message});
            }
        })

    } catch (err) {
        console.log("err",err);
    }
})

export { app, server, io }