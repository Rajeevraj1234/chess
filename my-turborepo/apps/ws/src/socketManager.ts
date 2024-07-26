import { WebSocket } from "ws"
import { userJWTClaims } from "./auth"
import { randomUUID } from 'crypto';

export class User{
    public socket:WebSocket
    public id:string
    public name:string
    public userId :string
    public isGuest?:boolean

    constructor(socket:WebSocket,userJwtClaims:userJWTClaims){
        this.socket = socket,
        this.id = randomUUID(),
        this.userId = userJwtClaims.userId
        this.name = userJwtClaims.name
        this.isGuest = userJwtClaims.isGuest
    }

}