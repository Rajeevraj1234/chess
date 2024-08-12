import { useNavigate } from "react-router-dom";
import { useUser } from "@repo/store/useUser";
export const BACKEND_URL = "http://localhost:3000";

const Landing = () => {
  const navigate = useNavigate();
  const user = useUser();

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
        credentials: "include",
      });
      console.log("Logged out successfully");
      // Clear any client-side state or cookies here if needed
      // Optionally redirect after logging out
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-[100vw] h-[100vh] bg-gray-900 md:flex">
      <div className="md:w-1/2 pt-10 md:pt-0 flex justify-center items-center">
        <img src="/chessboard.png" className=" h-[300px] md:h-[500px] " alt="Chessboard" />
      </div>
      <div className="md:w-1/2 flex flex-col mt-20 md:mt-20 justify-center items-center">
        <h1 className="text-white font-bold text-[2rem] md:text-[4rem] ">
          Play Chess Online <br /> on the #9999 Site!
        </h1>
        <div className="flex justify-center gap-5 items-center">
          {user ? (
            <div className="flex gap-5">
              <button
                onClick={() => navigate("/game")}
                className="px-10 py-5 mt-10 text-sm bg-green-500 font-bold rounded-md"
              >
                Play Online
              </button>
              <button
                onClick={handleLogout}
                className="px-10 py-5 mt-10 text-sm bg-green-500 font-bold rounded-md"
              >
                Log out
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-10 py-5 mt-10 text-sm bg-green-500 font-bold rounded-md"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;
