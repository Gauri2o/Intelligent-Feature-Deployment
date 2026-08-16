import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import FlagPage from "./pages/FlagPage";
import CreateFlag from "./pages/CreateFlag";
import EditFlag from "./pages/EditFlag";
import FlagDetail from "./pages/FlagDetail";

import AuditLogs from "./pages/AuditLogs";

import Navbar from "./components/Navbar";

import { AuthProvider } from "./context/AuthContext";


function App() {

  return (

    <AuthProvider>

      <BrowserRouter>

        <Navbar />

        <Routes>

          {/* Landing Page */}
          <Route
            path="/"
            element={<Home />}
          />


          {/* Authentication */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />


          {/* Feature Flag Dashboard */}
          <Route
            path="/flags"
            element={<FlagPage />}
          />


          {/* Create Flag */}
          <Route
            path="/create-flag"
            element={<CreateFlag />}
          />


          {/* Edit Flag */}
          <Route
            path="/edit-flag/:key"
            element={<EditFlag />}
          />


          {/* Flag Detail */}
          <Route
            path="/flag/:key"
            element={<FlagDetail />}
          />


          {/* Audit Logs */}
          <Route
            path="/audit"
            element={<AuditLogs />}
          />


          {/* Unknown Route */}
          <Route
            path="*"
            element={
              <Navigate to="/flags" replace />
            }
          />

        </Routes>

      </BrowserRouter>

    </AuthProvider>

  );

}


export default App;