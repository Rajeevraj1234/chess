import jwt from "jsonwebtoken";
import { WebSocket } from "ws";
import { User } from "../socketManager";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export interface userJWTClaims {
  userId: string;
  name: string;
  isGuest?: boolean;
}

export const extractAuthUser = (token:string,ws:WebSocket) =>{
    const decode = jwt.verify(token,JWT_SECRET) as userJWTClaims;
    return new User(ws,decode);
}
