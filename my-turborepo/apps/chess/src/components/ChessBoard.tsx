import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

const ChessBoard = ({
  board,
  socket,
  chess,
  setBoard,
  playerColor,
  gameId,
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
  gameId:string | null,
}) => {
  const [from, setFrom] = useState<null | Square>(null);

  // console.log(board);

  // function handleMoveClick(square: Square) {}
  return (
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
                    } else {
                      socket.send(
                        JSON.stringify({
                          type: MOVE,
                          payload: {
                            move: {
                              from,
                              to: squareRepresention,
                            },
                            gameId:gameId
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
                  className={`w-16 h-16 text-black ${
                    (i + j) % 2 === 0 ? "bg-green-500" : "bg-green-100"
                  }`}
                >
                  <div
                    className={`flex justify-center items-center w-full h-full ${
                      playerColor === "black" ? "rotate-180" : ""
                    }`}
                  >
                    {square ? (
                      <img
                        className="w-16"
                        src={`/${
                          square?.color === "b"
                            ? square?.type
                            : `${square?.type?.toUpperCase()} copy`
                        }.png`}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ChessBoard;
