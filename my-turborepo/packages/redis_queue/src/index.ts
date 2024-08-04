import { createClient, RedisClientType } from "redis";

class RedisClient {
  private static instance: RedisClientType | null = null;

  private constructor() {}

  public static getInstance(): RedisClientType {
    if (!RedisClient.instance) {
      RedisClient.instance = createClient();
      RedisClient.instance.connect().catch(console.error);
    }
    return RedisClient.instance;
  }
}

export default RedisClient;
