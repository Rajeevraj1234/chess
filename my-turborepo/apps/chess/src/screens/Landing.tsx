import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="w-[100vw] h-[100vh] bg-gray-900 flex ">
      <div className="w-1/2 flex justify-center items-center">
        <img src="/chessboard.png" className="h-[500px]" alt="" />
      </div>
      <div className="w-1/2 flex  flex-col justify-center items-center">
        <h1 className="text-white font-bold text-[4rem]">
          Play Chess Online <br /> on the #99999 Site!
        </h1>
        <div className="flex justify-center gap-5 items-center">
          <button
            onClick={() => navigate("/game")}
            className="px-10 py-5 mt-10 text-sm bg-green-500 font-bold rounded-md"
          >
            Play Online
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-5 mt-10 text-sm bg-green-500 font-bold rounded-md"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
