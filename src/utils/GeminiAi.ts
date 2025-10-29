import { GoogleGenAI, Type, createPartFromUri } from '@google/genai'
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
                config = this.getAiToolConfig()
                break;
        }


        const response = await this.ai.models.generateContent({
            model: model,
            contents: message,
            ...(!isEmpty(config) && { config: config })
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

    async uploadDocument(document: any) {
        try {
            const blob = new Blob([document.data], { type: document.mimetype });

            const file = await this.ai.files.upload({
                file: blob,
                config: {
                    displayName: document.name,
                    mimeType: document.mimetype,
                },
            });

            let getFile = await this.ai.files.get({ name: file.name || '' });
            while (getFile.state === 'PROCESSING') {
                getFile = await this.ai.files.get({ name: file.name || '' });
                console.log(`current file status: ${getFile.state}`);
                console.log('File is still processing, retrying in 5 seconds');

                await new Promise((resolve) => {
                    setTimeout(resolve, 5000);
                });
            }
            if (file.state === 'FAILED') {
                throw new Error('File processing failed.');
            }
            const fileContent = createPartFromUri(file.uri || '', file.mimeType || '');
            return fileContent;
        } catch (err) {
            console.log("err", err);
            throw err;
        }



    }
}

export {
    GeminiAI
}

// export default new GeminiAI