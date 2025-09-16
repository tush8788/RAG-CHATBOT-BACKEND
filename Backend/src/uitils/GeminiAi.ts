import { GoogleGenAI } from '@google/genai'
import config from '../config';
import { searchInVector } from './AiTools';


const { apiKey, model, embeddingModel } = config.aiConfig

class GeminiAI {
    ai: GoogleGenAI;
    constructor() {
        const ai = new GoogleGenAI({ apiKey });
        this.ai = ai;
    }

    private getAiToolConfig() {
        return {
            tools: [{
                functionDeclarations: [searchInVector]
            }]
        }
    }

    //send message
    async senMessage(message: any) {
        const response = await this.ai.models.generateContent({
            model: model,
            contents: message,
            config:this.getAiToolConfig()
        });
        return response;
    }

    //make embedding
    async makeEmbedding(items: string | string[]) {
        let resp = await this.ai.models.embedContent({
            model: embeddingModel,
            contents: items,
        })
        return resp;
    }
}

export {
    GeminiAI
}