import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";
import { User } from "./socketManager";

export class GameManager {
  private game: Game[];
  private pendingUser: User | null;
  private users: WebSocket[];

  constructor() {
    this.game = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(user: User) {
    this.users.push(user.socket);
    this.addHandler(user);
  }
  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user != socket);
  }
  private addHandler(user: User) {
    user.socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
          const game = new Game(this.pendingUser, user);
          this.game.push(game);
          this.pendingUser = null;
        } else {
          this.pendingUser = user;
        }
      }

      if (message.type === MOVE) {
        const game = this.game.find(
          (game) => game.player1 === user.socket || game.player2 === user.socket
        );
        if (game) {
          game.makeMove(user.socket, message.payload.move);
        }
      }
    });
  }
}
