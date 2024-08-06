import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { GAME_RESULT, MOVE } from "../screens/Game";

const ChessBoard = ({
  board,
  socket,
  chess,
  setBoard,
  playerColor,
  gameId,
  winner,
}: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
  chess: any;
  setBoard: any;
  playerColor: string;
  gameId: string | null;
  winner: GAME_RESULT | null;
}) => {
  const [from, setFrom] = useState<null | Square>(null);
  const [suggestionMove, setSuggestionMove] = useState([]);

  // console.log("before",chess._p);

  // console.log("before",chess._positionCount);
  // console.log("after",chess._positionCount);

  // function handleMoveClick(square: Square) {}
  return (
    <div className="relative">
      {winner && (
        <div className="absolute top-0 left-[0%] bg-black h-[512px] w-[512px] z-[3] opacity-70">
          <div className="text-white font-bold text-[2.4rem] absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
            {winner.replace("_", "  ")}
          </div>
        </div>
      )}
      <div
        className={`text-white select-none  ${
          playerColor === "black" ? "rotate-180" : ""
        } `}
      >
        {board.map((row, i) => {
          return (
            <div key={i} className="flex">
              {row.map((square, j) => {
                //big brain need to learn how to find these type of tricks. as Square is use to treat this string as square
                const squareRepresention = (String.fromCharCode(97 + (j % 8)) +
                  "" +
                  (8 - i)) as Square;

                return (
                  <div
                    onClick={() => {
                      if (!from) {
                        setFrom(squareRepresention);
                        setSuggestionMove(
                          chess.moves({ square: squareRepresention })
                        );
                        console.log(
                          chess.moves({ square: squareRepresention })
                        );
                      } else {
                        setSuggestionMove([]);
                        socket.send(
                          JSON.stringify({
                            type: MOVE,
                            payload: {
                              move: {
                                from,
                                to: squareRepresention,
                              },
                              gameId: gameId,
                            },
                          })
                        );
                        setFrom(null);
                        chess.move({
                          from,
                          to: squareRepresention,
                        });
                        setBoard(chess.board());
                      }
                    }}
                    key={j}
                    className={`w-16 h-16 text-black relative ${
                      (i + j) % 2 === 0 ? "bg-green-500" : "bg-green-100"
                    }`}
                  >
                    {/* //her i am adding the suggestion thing where i take the suggestionMove from the chess.move({square:e4}) */}
                    {/* then here i am iterating ovet that and if the lenght is 3 or greatere then i short it to 2 eg: Ne3 to e3  */}
                    {suggestionMove?.map((move: string) => {
                      if (move.length >= 3) {
                        move = move.substring(1);
                      }
                      if (move === squareRepresention)
                        return (
                          <span className="absolute top-6 left-6 z-[1] h-4 w-4 bg-gray-500 rounded-full"></span>
                        );
                      return null;
                    })}

                    <div
                      className={`flex justify-center items-center w-full h-full ${
                        playerColor === "black" ? "rotate-180" : ""
                      }`}
                    >
                      {square ? (
                        <div className="z-[2]">
                          <img
                            className="w-16"
                            src={`/${
                              square?.color === "b"
                                ? square?.type
                                : `${square?.type?.toUpperCase()} copy`
                            }.png`}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChessBoard;
