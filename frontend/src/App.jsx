import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import FlagPage from "./pages/FlagPage";
import FlagDetail from "./pages/FlagDetail";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<FlagPage />} />
        <Route path="/flag/:key" element={<FlagDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;