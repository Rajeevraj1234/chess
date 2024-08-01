import { useEffect, useState } from "react";
import ChessBoard from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
import { useUser } from "@repo/store/useUser";
import { time } from "console";
// import { Button } from "@repo/ui/button";

// Constants
export const INIT_GAME = "init_game";
export const GAME_OVER = "game_over";
export const MOVE = "move";

interface moves {
  from: string;
  to: string;
}

const CLASSIC_GAME_TIME_ms = 10 * 60 * 1000;

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
  const [isWinner, setIsWinner] = useState(false);
  const [totalMovesPlayed, setTotalMovesPlayed] = useState<moves[]>([]);
  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState();
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState();

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
          setIsWinner(true);
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
        <span className="text-lg text-red-400">vs</span>{" "}
        {gameMetaData?.blackPlayer?.name}
      </div>
      <div className="flex mt-[8rem]">
        <div className="w-1/2 flex justify-end items-center">
          <ChessBoard
            playerColor={playerColor}
            chess={chess}
            setBoard={setBoard}
            board={board}
            socket={socket}
            gameId={gameMetaData?.gameId ?? null}
          />
        </div>
        <div className="flex flex-col justify-between "></div>
        <div className="w-1/2 flex flex-col justify-center items-center">
          <div className="bg-gray-800 h-full w-[400px] flex flex-col justify-start items-center">
            {!started && (
              <div className=" h-full w-full flex flex-col justify-start items-center bg-green-200">
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

                {isWinner && (
                  <div className="text-white font-bold text-lg">
                    {chess.turn() === "w" ? "Black wins" : "White wins"}
                  </div>
                )}
              </div>
            )}
            {started && (
              <div className="h-full w-full overflow-y-scroll">
                <div className="w-full">
                  <span className="flex gap-3 text-white">White Player Time Left: {getTimer(player1TimeConsumed)}</span>
                  <span className="flex gap-3 text-white">Black Player Time Left:{getTimer(player2TimeConsumed)}</span>
                </div>
                <div className="text-white ">
                  Current Turn: {chess.turn() === 'b' ? "black" : "white"}
                </div>
                <div>
                  <div className="my-5 text-white font-bold text-xl">MOVES PLAYED</div>
                  {totalMovesPlayed?.map((move, index) => {
                    return (
                      <div key={index} className="flex text-white gap-10">
                        <span>{move.from}</span>
                        <span>{move.to}</span>
                      </div>
                    );
                  })}
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
