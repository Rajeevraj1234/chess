import { useEffect, useState } from "react";
import ChessBoard from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
// import { Button } from "@repo/ui/button";

// Constants
export const INIT_GAME = "init_game";
export const GAME_OVER = "game_over";
export const MOVE = "move";

interface moves {
  from: string;
  to: string;
}

const Game = () => {
  const socket = useSocket();

  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState<string>("");
  const [isWinner, setIsWinner] = useState(false);
  const [totalMovesPlayed, setTotalMovesPlayed] = useState<moves[]>([]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // console.log(message);

      switch (message.type) {
        case INIT_GAME:
          setBoard(chess.board());
          setStarted(true);
          setPlayerColor(message.payload.color);
          break;
        case MOVE:
          if (message.payload.move) {
            const move = message.payload.move;
            chess.move(move);
            setBoard(chess.board());
          }
          setTotalMovesPlayed(message.payload.totalMoves);
          console.log("Move made");
          break;
        case GAME_OVER:
          console.log("Game over");
          setIsWinner(true);
          break;
      }
    };
  }, [socket]);

  if (!socket) {
    return <div>Connecting ...</div>;
  }
  return (
    <div className="w-[100vw] h-[100vh] bg-gray-900 flex">
      <div className="w-1/2 flex justify-end items-center">
        <ChessBoard
          playerColor={playerColor}
          chess={chess}
          setBoard={setBoard}
          board={board}
          socket={socket}
        />
      </div>
      <div className="w-1/2 flex flex-col justify-center items-center">
        <div className="bg-gray-800 h-[500px] w-[400px] flex flex-col justify-start items-center">
          {!started && (
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
              Play
            </button>
          )}
          {isWinner && (
            <div className="text-white font-bold text-lg">
              {chess.turn() === "w" ? "Black wins" : "White wins"}
            </div>
          )}
          <div>
            {totalMovesPlayed.map((move) => {
              return (
                <div className="flex text-white gap-10">
                  <span>{move.from}</span>
                  <span>{move.to}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
