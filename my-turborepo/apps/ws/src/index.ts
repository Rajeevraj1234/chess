import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import url from "url";
import { extractAuthUser } from "./auth";

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });

const gameManager = new GameManager();

wss.on("connection", function connection(ws,req) {
  // console.log(JSON.stringify(req.url));
  //@ts-ignore
  
  const token: string = url.parse(req.url, true).query.token;
  const user = extractAuthUser(token,ws);
 
  
  gameManager.addUser(user);
  ws.on("disconnect", () => {
    gameManager.removeUser(ws);
  });
});

console.log("This is web socket server running in port",PORT);
