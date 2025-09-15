import express from 'express'
import aiController from '../controller/ai.controller';
const router = express.Router();

router.post('/send-message',aiController.sendMessage);

export default router