import { Embedding, Pinecone } from '@pinecone-database/pinecone'
import config from '../config';
import { ChatType } from '../services/Ai.service';
const { apikey, indexName } = config.embeddingConfig

class VectorDB {
    pc: Pinecone
    constructor() {
        this.pc = new Pinecone({
            apiKey: apikey,
        })
    }

    //call only ones
    async createIndexModel() {
        const existingIndexes = await this.pc.listIndexes(); // Get list of existing indexes
        // console.log("existingIndexes",existingIndexes)
        if (existingIndexes.indexes?.find((elem) => elem.name == indexName)) {
            console.log(`Index "${indexName}" already exists.`);
            return;
        }

        // await this.pc.createIndexForModel({
        //     name: indexName,
        //     cloud: 'aws',
        //     region: 'us-east-1',
        //     embed: {
        //         model: 'llama-text-embed-v2',
        //         fieldMap: { text: 'article_content' },
        //     },
        //     waitUntilReady: true
        // })
    }

    async upsertInVector(id: string, embedding: any[], metaData: { data: string,url:string,chatId:string,userId:string,type:ChatType }) {
        const index = this.pc.index(indexName);
        await index.upsert([{
            id: id,
            values: embedding,
            metadata: metaData
        }])
    }

    async findArticle(embedded: any,filter?:any) {
        const index = this.pc.index(indexName);
        return await index.query({
            vector: embedded,
            topK: 5,
            includeMetadata: true,
            ...(filter && {filter:filter})
        })
    }

    async deleteVectorRecords(chatId:string){
        const index = this.pc.index(indexName);
        await index._deleteMany({
            chatId: { $eq: chatId},
        })
    }
}

export {
    VectorDB
}