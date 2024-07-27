import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { socketManager, User } from "./socketManager";
import { randomUUID } from "crypto";
import { db } from "./db";
import { connect } from "http2";

interface moves {
  from: string;
  to: string;
}
export class Game {
  public gameId:string;
  public player1UserId: string;
  public player2UserId: string | null;
  public board: Chess;
  private startTime = new Date(Date.now());
  private lastMoveTime = new Date(Date.now());
  private moveCount = 0;
  private moves: moves[] = [];

  constructor(player1UserId: string, player2UserId: string|null,gameId?:string,startTime?:Date) {
    this.gameId = gameId ?? randomUUID(),
    this.player1UserId = player1UserId;
    this.player2UserId = player2UserId;
    this.board = new Chess();
    if (startTime) {
      this.startTime = startTime;
      this.lastMoveTime = startTime;
    }
  }

  public updateSecondPlayer(player2UserId:string){
    this.player2UserId = player2UserId;

    //add db call here

   
  }

  makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
    }
  ) {
    // validate the type of move using zod
    if (this.moveCount % 2 === 0 && socket !== this.player1) {
      return;
    }
    if (this.moveCount % 2 === 1 && socket !== this.player2) {
      return;
    }

    try {
      this.board.move(move);
      this.moves.push({
        from: move.from,
        to: move.to,
      });
    } catch (e) {
      console.log(e);
      return;
    }

    if (this.moveCount % 2 === 0) {
      this.player2?.send(
        JSON.stringify({
          type: MOVE,
          payload: { move, totalMoves: this.moves },
        })
      );

      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: { totalMoves: this.moves },
        })
      );
    } else {
      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: { move, totalMoves: this.moves },
        })
      );
      this.player2?.send(
        JSON.stringify({
          type: MOVE,
          payload: { totalMoves: this.moves },
        })
      );
    }

    if (this.board.isGameOver()) {
      // Send the game over message to both players

      this.player1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      this.player2?.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      return;
    }

    this.moveCount++;
  }

  async createGameInDb(){
    this.startTime = new Date(Date.now());
    this.lastMoveTime = this.startTime;

    const game =  await db.game.create({
      data:{
        id:this.gameId,
        timeControl:"CLASSICAL",
        status:'IN_PROGRESS',
        startAt:this.startTime;
        currentFen:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        whitePlayer:{
          connect:{
            id:this.player1UserId
          }
        },
        blackPlayer:{
          connect:{
            id:this.player2UserId ?? ""
          }
        },
      },
      include: {
        whitePlayer: true,
        blackPlayer: true,
      },
    })
    this.gameId = game.id;
  }
}
