import { useEffect, useState } from "react";
import ChessBoard from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
import { useUser } from "@repo/store/useUser";
import { useNavigate } from "react-router-dom";

// Constants
export const INIT_GAME = "init_game";
export const GAME_OVER = "game_over";
export const MOVE = "move";
export const ABORT_GAME = "abort_game";
export const CLASSIC_GAME_TIME_ms = 10 * 60 * 1000;
export type GAME_RESULT = "WHITE_WINS" | "BLACK_WINS" | "DRAW";

interface moves {
  from: string;
  to: string;
}

export interface gameMetaDataInterface {
  gameId: string;
  whitePlayer: {
    name: string;
    id: string;
    isGuest?: boolean;
  };
  blackPlayer: {
    name: string;
    id: string;
    isGuest?: boolean;
  };
}

const Game = () => {
  const socket = useSocket();
  const user = useUser();
  const [chess, _setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [gameMetaData, setGameMetaData] =
    useState<gameMetaDataInterface | null>(null);
  const [started, setStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState<string>("");
  const [winner, setWinner] = useState<GAME_RESULT | null>(null);
  const [totalMovesPlayed, setTotalMovesPlayed] = useState<moves[]>([]);
  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState();
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case INIT_GAME:
          setBoard(chess.board());
          setStarted(true);
          // setPlayerColor(message.payload.color);
          setGameMetaData({
            gameId: message.payload.gameId,
            whitePlayer: message.payload.WhitePlayer,
            blackPlayer: message.payload.BlackPlayer,
          });

          user.id === message.payload.WhitePlayer.id
            ? setPlayerColor("white")
            : setPlayerColor("black");
          
          break;
        case MOVE:
          if (message.payload.move) {
            const move = message.payload.move;
            setPlayer1TimeConsumed(message.payload.player1TimeConsumed);
            setPlayer2TimeConsumed(message.payload.player2TimeConsumed);
            if (user.id !== message.payload.userId) {
              chess.move(move);
              setBoard(chess.board());
            }
          }
          setTotalMovesPlayed(message.payload.totalMoves);
          console.log("Move made");
          break;
        case GAME_OVER:
          console.log("Game over");
          setWinner(message.payload.winner);
          break;
        case ABORT_GAME:
          setWinner(message.payload.winner);
          break;
      }
    };
  }, [socket]);

  if (!socket) {
    return <div>Connecting ...</div>;
  }

  function getTimer(timeRemaining: number | undefined) {
    const leftTime = timeRemaining ?? 0;
    const remainingTime = CLASSIC_GAME_TIME_ms - leftTime;
    const second = Math.floor(remainingTime / 1000);
    const minute = second / 60;
    const displayTime = minute.toFixed(2).toString().replace(".", ":");

    return (
      <div className="text-white flex w-[120px]">
        <span>{displayTime}</span>
      </div>
    );
  }

  return (
    <div className="w-[100vw] h-[100vh] bg-gray-900 ">
      <div className="text-white font-bold py-10 text-center text-3xl ">
        {gameMetaData?.whitePlayer?.name}{" "}
        {started && <span className="text-lg text-red-400">vs</span>}{" "}
        {gameMetaData?.blackPlayer?.name}
      </div>
      <div className="flex mt-[8rem]">
        <div className="w-1/2 flex justify-end items-center ">
          <ChessBoard
            playerColor={playerColor}
            chess={chess}
            setBoard={setBoard}
            board={board}
            socket={socket}
            gameId={gameMetaData?.gameId ?? null}
            winner={winner}
          />
        </div>

        <div className="w-1/2 flex flex-col justify-center items-center ">
          <div className="bg-gray-800 h-[520px] w-[400px] flex flex-col justify-start items-center p-2 ">
            {!started && (
              <div className=" h-full w-full flex flex-col justify-start items-center ">
                <button
                  onClick={() => {
                    socket.send(
                      JSON.stringify({
                        type: INIT_GAME,
                      })
                    );
                  }}
                  className="px-16 py-4 mt-10 text-lg bg-green-500 font-bold rounded-md"
                >
                  Start
                </button>
              </div>
            )}
            {started && (
              <div className="h-full w-full ">
                <div className="w-full">
                  <span className="flex gap-3 text-white">
                    White Player Time Left: {getTimer(player1TimeConsumed)}
                  </span>
                  <span className="flex gap-3 text-white">
                    Black Player Time Left:{getTimer(player2TimeConsumed)}
                  </span>
                </div>
                <div className="text-white ">
                  Current Turn: {chess.turn() === "b" ? "black" : "white"}
                </div>
                <div className="my-3">
                  <div className="text-white flex gap-2 items-center">
                    <span>Controlls:</span>{" "}
                    <span
                      className="border p-2 text-xs"
                      onClick={() => {
                        socket.send(
                          JSON.stringify({
                            type: ABORT_GAME,
                            payload: {
                              gameId: gameMetaData?.gameId,
                            },
                          })
                        );
                      }}
                    >
                      ABORT
                    </span>{" "}
                    <span className="border p-2 text-xs">DRAW</span>
                  </div>
                </div>
                <div className=" h-[70%]">
                  <div className="my-5 text-white font-bold text-xl">
                    MOVES PLAYED
                  </div>
                  <div className="overflow-y-scroll h-[90%]">
                    {totalMovesPlayed?.map((move, index) => {
                      return (
                        <div key={index} className="flex text-white gap-7 ">
                          <span>{index+1}.</span>
                          <span>{move.from}</span>
                          <span>{move.to}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
