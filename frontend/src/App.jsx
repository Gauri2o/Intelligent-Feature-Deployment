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




          {/* Feature Flags */}

          <Route
            path="/flags"
            element={<FlagPage />}
          />



          <Route
            path="/create-flag"
            element={<CreateFlag />}
          />



          <Route
            path="/edit-flag/:key"
            element={<EditFlag />}
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
              <Navigate to="/" />
            }
          />



        </Routes>


      </BrowserRouter>


    </AuthProvider>

  );

}



export default App;