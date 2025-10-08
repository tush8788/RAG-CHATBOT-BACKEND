import express from 'express'
import aiController from '../controller/ai.controller';
const router = express.Router();

router.post('/send-message',aiController.sendMessage);
router.post('/fetch-news',aiController.fetchLetestNews)
router.get('/clear-chat',aiController.clearChatHistory)
router.get('/fetch-all-chats',aiController.fetchAllChats)
router.delete('/delete-chat',aiController.deleteChat)
router.post('/markup',aiController.getMarkup)

export default router