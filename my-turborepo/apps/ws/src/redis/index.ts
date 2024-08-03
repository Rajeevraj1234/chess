import { createClient } from "redis";

const client = createClient();

async function connectRedis() {
  await client.connect();
}
connectRedis();


export default client;