import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./screens/Landing";
import Game from "./screens/Game";
import Login from "./screens/login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/game" element={<Game />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
