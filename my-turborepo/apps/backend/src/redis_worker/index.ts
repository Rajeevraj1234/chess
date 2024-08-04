import { db } from "../db";
import RedisClient from "@repo/redis_queue/client"; // Set to "nextnode" if you encounter module resolution errors
const client = RedisClient.getInstance();

const QUEUE_NAME = "moveData"; // Define your queue name here
const POLL_INTERVAL_MS = 1000; // Polling interval

async function addMoveToDbFromRedis() {
  while (true) {
    try {
      // Use BRPOP to wait for an element to be available
      const data = await client.brPop(QUEUE_NAME, 0); // 0 means to block indefinitely (block until new element comes in)
      if (data) {
        const parseData = JSON.parse(data ?.element|| "");

        // Perform the database transaction
        const res = await db.$transaction([
          db.move.create({
            data: parseData,
          }),
          db.game.update({
            data: {
              currentFen: parseData.after,
            },
            where: {
              id: parseData.gameId,
            },
          }),
        ]);
        console.log("added move id=",res[0].id," to database");
      } else {
        console.log("Unexpected error: No data returned");
      }
    } catch (error) {
      console.error("Error occurred in Game/addMoveToDb", error);
    }

    // Add a delay before the next BRPOP call, if needed
    // This helps to avoid excessive CPU usage in case of errors or other issues
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

function initRedis() {
  addMoveToDbFromRedis();
}

export default initRedis;
