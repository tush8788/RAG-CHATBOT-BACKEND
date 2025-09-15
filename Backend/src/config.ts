import dotenv from 'dotenv'
dotenv.config()
const env = process.env

interface Config {
    port: number;
    nodeEnv: string;
    mongodbURL: string,
    googleClientId: string,
    jwtKey: string
    aiConfig:{
        apiKey:string,
        model:string
        embeddingModel:string
    }
}

const config: Config = {
    port: Number(env.PORT) || 4000,
    nodeEnv: env.NODE_ENV || 'development',
    mongodbURL: env.MONGODB_URL || 'mongodb://localhost/chatapp',
    googleClientId: env.GOOGLE_CLIENT_ID || '',
    jwtKey: env.JWT_KEY || 'djdnsnjhcfjbsjc',
    aiConfig:{
        apiKey: env.GEMINI_API_KEY || "",
        model: env.MODEL || "gemini-2.5-flash",
        embeddingModel: 'gemini-embedding-001',
    }
};

export default config;