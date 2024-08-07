import { WebSocket } from "ws";
import {
  ABORT_GAME,
  GAME_ADDED,
  GAME_ALERT,
  INIT_GAME,
  MOVE,
} from "./messages";
import { Game } from "./Game";
import { socketManager, User } from "./socketManager";

export class GameManager {
  private games: Game[];
  private pendingGameId: string | null;
  private users: WebSocket[];

  constructor() {
    this.games = [];
    this.pendingGameId = null;
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
    user.socket.on("message", async (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === INIT_GAME) {
        if (this.pendingGameId) {
          const game = this.games.find(
            (game) => game.gameId === this.pendingGameId
          );
          if (!game) {
            console.error(
              "pending game not found error in the gameManager/addHandler <==========>"
            );
            return;
          }
          if (user.id === game?.player1UserId) {
            socketManager.broadcast(
              game.gameId,
              JSON.stringify({
                type: GAME_ALERT,
                payload: {
                  message: "Trying to Connect with yourself?",
                },
              })
            );
            return;
          }
          socketManager.addUser(user, game.gameId);
          await game.updateSecondPlayer(user.userId);
          this.pendingGameId = null;
        } else {
          const game = new Game(user.userId, null);
          this.games.push(game);
          this.pendingGameId = game.gameId;
          socketManager.addUser(user, game.gameId);
          socketManager.broadcast(
            game.gameId,
            JSON.stringify({
              type: GAME_ADDED,
              gameId: game.gameId,
            })
          );
        }
      }

      if (message.type === MOVE) {
        const game = this.games.find(
          (game) => game.gameId === message.payload.gameId
        );
        if (game) {
          game.makeMove(user, message.payload.move);
          if (game.result) {
            this.removeGame(game.gameId);
          }
        }
      }
      if (message.type === ABORT_GAME) {
        const game = this.games.find(
          (game) => game.gameId === message.payload.gameId
        );
        if (game) {
          game.abortGame(user);
        }
        this.removeGame(message.payload.gameId);
      }
    });
  }
  removeGame(gameId: string) {
    this.games = this.games.filter((game) => game.gameId !== gameId);
  }
}
