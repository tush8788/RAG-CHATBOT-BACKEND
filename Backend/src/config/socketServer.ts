import http from 'http'
import express from 'express'
import { Server, Socket } from 'socket.io'
import cors from 'cors'
import AiService from '../services/Ai.service';

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

//use socket event
io.on('connection', async (socket: Socket) => {
    try {
        console.log("socket connect ");
        const { _user } = socket.handshake.auth;
        console.log("socket",socket.id);
        socket.emit('ai_message',{role:'model',text:"Hello! I'm your AI assistant. How can I help you today?"});

        // socket.emit('ai_message','welcom user');
        
        socket.on('user_message',async (data:{message:string})=>{
            try{
                let aiResp = await AiService.sendMessage(data.message,socket.id)
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