import dotenv from 'dotenv'
dotenv.config()
const env = process.env

interface Config {
    port: number;
    nodeEnv: string;
    mongodbURL: string,
    googleClientId: string,
    jwtKey: string
}

const config: Config = {
    port: Number(env.PORT) || 4000,
    nodeEnv: env.NODE_ENV || 'development',
    mongodbURL: env.MONGODB_URL || 'mongodb://localhost/chatapp',
    googleClientId: env.GOOGLE_CLIENT_ID || '',
    jwtKey: env.JWT_KEY || 'djdnsnjhcfjbsjc'
};

export default config;