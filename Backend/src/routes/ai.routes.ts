import express from 'express'
import aiController from '../controller/ai.controller';
const router = express.Router();

router.post('/send-message',aiController.sendMessage);
router.get('/fetch-latest-news',aiController.fetchLetestNews)
router.get('/clear-chat',aiController.clearChatHistory)

export default router