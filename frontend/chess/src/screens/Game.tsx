import { useEffect, useState } from "react";
import ChessBoard from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";

// Constants
export const INIT_GAME = "init_game";
export const GAME_OVER = "game_over";
export const MOVE = "move";

const Game = () => {
  const socket = useSocket();

  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState<string>("");

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message.payload.color);
      

      switch (message.type) {
        case INIT_GAME:
          setBoard(chess.board());
          setStarted(true);
          setPlayerColor(message.payload.color);
          break;
        case MOVE:
          const move = message.payload.move;
          chess.move(move);
          setBoard(chess.board());
          console.log("Move made");
          break;
        case GAME_OVER:
          console.log("Game over");
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
        <div className="bg-gray-800 h-[500px] w-[400px] flex justify-center items-start">
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
        </div>
      </div>
    </div>
  );
};

export default Game;
