import { GoogleGenAI } from '@google/genai'
import config from '../config';

const {apiKey,model,embeddingModel} = config.aiConfig

class GeminiAI {
    ai: GoogleGenAI;
    constructor() {
        const ai = new GoogleGenAI({ apiKey });
        this.ai = ai;
    }

    //send message
    async senMessage(message: string) {
        const response = await this.ai.models.generateContent({
            model: model,
            contents:message,
        });
        return response;
    }
    
    //make embedding
    async makeEmbedding(items:string | string[]){
        let resp = await this.ai.models.embedContent({
            model:embeddingModel,
            contents:items,
        })
        return resp;
    }
}

export {
    GeminiAI
}