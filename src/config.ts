import dotenv from 'dotenv'
dotenv.config()
const env = process.env

interface Config {
    port: number;
    nodeEnv: string;
    mongodbURL: string,
    googleClientId: string,
    jwtKey: string
    aiConfig: {
        apiKey: string,
        model: string
        embeddingModel: string
    }
    embeddingConfig: {
        apikey: string,
        indexName: string
    }
    redis: {
        username: string
        password: string
        host: string
        redisPort: number
    }
}

const config: Config = {
    port: Number(env.PORT) || 4000,
    nodeEnv: env.NODE_ENV || 'development',
    mongodbURL: env.MONGODB_URL || 'mongodb://localhost/chatapp',
    googleClientId: env.GOOGLE_CLIENT_ID || '',
    jwtKey: env.JWT_KEY || 'djdnsnjhcfjbsjc',
    aiConfig: {
        apiKey: env.GEMINI_API_KEY || "",
        model: env.MODEL || "gemini-2.5-flash",
        embeddingModel: 'gemini-embedding-001',
    },
    embeddingConfig: {
        apikey: env.PINECONE_API_KEY || '',
        indexName: env.INDEX_NAME || 'article-content'
    },
    redis: {
        username: env.REDIS_USERNAME || '',
        password: env.REDIS_PASSWORD || '',
        host: env.REDIS_HOST || '',
        redisPort: Number(env.REDIS_PORT) || 13814
    }
};

export default config;