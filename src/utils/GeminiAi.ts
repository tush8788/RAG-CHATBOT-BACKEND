import { GoogleGenAI, Type } from '@google/genai'
import config from '../config';
import { searchInVector } from './AiTools';
import { isEmpty } from 'lodash';
import { ChatType } from '../services/Ai.service';


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
    async senMessage(message: any, type: ChatType | 'chat') {
        let config = {}
        switch (type) {
            case 'article':
                config = {
                    tools: [
                        {
                            urlContext: {}
                        }
                    ]
                }
            break;
            case 'youtube':
                break;
            case 'chat':
                config =  this.getAiToolConfig()
                break;
        }


        const response = await this.ai.models.generateContent({
            model: model,
            contents: message,
            ...(!isEmpty(config) && {config: config})
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

// export default new GeminiAI