import { WebSocket } from "ws";
import { Chess, Move } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { socketManager, User } from "./socketManager";
import { randomUUID } from "crypto";
import { db } from "./db";
import { log } from "console";

type GAME_STATUS =
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ABANDONED"
  | "TIME_UP"
  | "PLAYER_EXIT";
type GAME_RESULT = "WHITE_WINS" | "BLACK_WINS" | "DRAW";

interface moves {
  from: string;
  to: string;
}
export class Game {
  public gameId: string;
  public player1UserId: string;
  public player2UserId: string | null;
  public board: Chess;
  private startTime = new Date(Date.now());
  private lastMoveTime = new Date(Date.now());
  private moveCount = 0;
  private moves: moves[] = [];
  public result: GAME_RESULT | null = null;
  private player1TimeConsumed = 0;
  private player2TimeConsumed = 0;

  constructor(
    player1UserId: string,
    player2UserId: string | null,
    gameId?: string,
    startTime?: Date
  ) {
    (this.gameId = gameId ?? randomUUID()),
      (this.player1UserId = player1UserId);
    this.player2UserId = player2UserId;
    this.board = new Chess();
    if (startTime) {
      this.startTime = startTime;
      this.lastMoveTime = startTime;
    }
  }

  async updateSecondPlayer(player2UserId: string) {
    this.player2UserId = player2UserId;
    // console.log("Player 1",this.player1UserId);
    // console.log("Player 2",this.player2UserId);

    const users = await db.user.findMany({
      where: {
        id: {
          in: [this.player1UserId, this.player2UserId ?? ""],
        },
      },
    });
    // console.log("users",users);

    //add db call here
    try {
      await this.createGameInDb();
    } catch (error) {
      console.error(
        "updateSecondPlayer db call get the error <=========>",
        error
      );
      return;
    }

    const WhitePlayer = users.find((user) => user.id === this.player1UserId);
    const BlackPlayer = users.find((user) => user.id === this.player2UserId);

    socketManager.broadcast(
      this.gameId,
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          gameId: this.gameId,
          WhitePlayer: {
            name: WhitePlayer?.name,
            id: this.player1UserId,
            isGuest: "false",
          },
          BlackPlayer: {
            name: BlackPlayer?.name,
            id: player2UserId,
            isGuest: "false",
          },
          fen: this.board.fen(),
          moves: [],
        },
      })
    );
  }

  async createGameInDb() {
    this.startTime = new Date(Date.now());
    this.lastMoveTime = this.startTime;

    const game = await db.game.create({
      data: {
        id: this.gameId,
        timeControl: "CLASSICAL",
        status: "IN_PROGRESS",
        startAt: this.startTime,
        currentFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        whitePlayer: {
          connect: {
            id: this.player1UserId,
          },
        },
        blackPlayer: {
          connect: {
            id: this.player2UserId ?? "",
          },
        },
      },
      include: {
        whitePlayer: true,
        blackPlayer: true,
      },
    });
    this.gameId = game.id;
  }

  async makeMove(user: User, move: Move) {
    // validate the type of move using zod
    if (this.board.turn() === "w" && user.userId !== this.player1UserId) {
      return;
    }
    if (this.board.turn() === "b" && user.userId !== this.player2UserId) {
      return;
    }
    if (this.result) {
      //why we use this find it
      console.error(
        `User ${user.userId} is making a move post game completion`
      );
      return;
    }

    const moveTimeStamp = new Date(Date.now());

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

    if (this.board.turn() === "b") {
      this.player1TimeConsumed +=
        moveTimeStamp.getTime() - this.lastMoveTime.getTime();
    }
    if (this.board.turn() === "w") {
      this.player2TimeConsumed +=
        moveTimeStamp.getTime() - this.lastMoveTime.getTime();
    }

    //add move to database
    await this.addMoveToDb(move, moveTimeStamp);

    this.lastMoveTime = moveTimeStamp;

    socketManager.broadcast(
      this.gameId,
      JSON.stringify({
        type: MOVE,
        payload: {
          move,
          userId: user.userId,
          totalMoves: this.moves,
          player1TimeConsumed: this.player1TimeConsumed,
          player2TimeConsumed: this.player2TimeConsumed,
        },
      })
    );

    if (this.board.isGameOver()) {
      // Send the game over message to both players

      socketManager.broadcast(
        this.gameId,
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

  async addMoveToDb(move: Move, moveTimeStamp: Date) {
    const newBoard = JSON.parse(JSON.stringify(this.board));
    const fen = Object.keys(newBoard._positionCount);

    try {
      await db.$transaction([
        db.move.create({
          data: {
            gameId: this.gameId,
            moveNumber: this.moveCount + 1,
            from: move.from,
            to: move.to,
            before: fen[fen.length - 2],
            after: fen[fen.length - 1],
            createdAt: moveTimeStamp,
            timeTaken: moveTimeStamp.getTime() - this.lastMoveTime.getTime(),
            san: "meow meow",
          },
        }),
        db.game.update({
          data: {
            currentFen: fen[fen.length - 1],
          },
          where: {
            id: this.gameId,
          },
        }),
      ]);
    } catch (error) {
      console.error("this errror occured in Game/addMoveToDb", error);
    }
  }
}
