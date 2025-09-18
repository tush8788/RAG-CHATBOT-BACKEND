import { Type } from '@google/genai'
export type ToolNameType = 'search_in_vector'

const searchInVector = {
    name: 'search_in_vector',
    description: 'user query find in vector db.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            message:{
                type:Type.STRING,
                description:'user send message'
            }
        },
        required: ['message'],
    },
};

export {
   searchInVector 
}