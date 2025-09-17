import { createClient, RedisClientType } from 'redis'
import Redis from 'ioredis';
import config from '../config'

const { host, username, password, redisPort } = config.redis
class RedisService {
    client: Redis
    constructor() {
        this.client = new Redis({
            host: host,
            port: redisPort,
            username: username,
            password: password
        })
        this.client.on('connect', () => {
            console.log('Connected to Redis');
        });
        this.client.on('error', (err: any) => {
            console.error('Redis Client Error', err);
        });
    }
    //save message
    async saveMessage(chatKey: string, messageObj: object) {
        await this.client.rpush(chatKey, JSON.stringify(messageObj))
        await this.client.expire(chatKey, 60 * 60 * 24); // 1 day
    }
    // get all messages
    async getMessages(chatKey: string) {
        const messages = await this.client.lrange(chatKey, 0, -1);
        return messages?.map((msg: any) => JSON.parse(msg)) || [];
    }
    // remove chats
    async clearChat(chatKey: string) {
        await this.client.del(chatKey);
    }

}

export default new RedisService();