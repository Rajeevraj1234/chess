import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";
dotenv.config();
const redisHost = process.env.REDIS_HOST || "chess-redis"; //if there is redis error in local environmet just change the chess-db to localhost

class RedisClient {
  private static instance: RedisClientType | null = null;

  private constructor() {}

  public static getInstance(): RedisClientType {
    if (!RedisClient.instance) {
      RedisClient.instance = createClient({
        socket: {
          host: redisHost,
          port: 6379,
        },
      });
      RedisClient.instance.connect().catch(console.error);
    }
    return RedisClient.instance;
  }
}

export default RedisClient;
