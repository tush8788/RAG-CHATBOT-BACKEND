import { GoogleGenAI } from '@google/genai'
import config from '../config';

class GeminiAI {
    ai: GoogleGenAI;
    constructor() {
        let { apiKey } = config.aiConfig
        const ai = new GoogleGenAI({ apiKey });
        this.ai = ai;
    }

    async senMessage(message: string) {
        const { model } = config.aiConfig
        const response = await this.ai.models.generateContent({
            model: model,
            contents: message || "Explain how AI works in a few words",
        });
        return response
    }
}

export {
    GeminiAI
}