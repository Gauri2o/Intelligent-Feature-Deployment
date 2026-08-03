import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import FlagPage from "./pages/FlagPage";
import FlagDetail from "./pages/FlagDetail";
import EditFlag from "./pages/EditFlag";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<FlagPage />} />
        <Route path="/flag/:key" element={<FlagDetail />} />
        <Route path="/edit/:key" element={<EditFlag />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;