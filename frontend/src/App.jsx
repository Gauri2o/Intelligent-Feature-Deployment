import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import FlagPage from "./pages/FlagPage";
import CreateFlag from "./pages/CreateFlag";
import EditFlag from "./pages/EditFlag";
import FlagDetail from "./pages/FlagDetail";

import EvaluateFlag from "./pages/EvaluateFlag";

import AuditLogs from "./pages/AuditLogs";

import EnvironmentPage from "./pages/EnvironmentPage";

import CleanupSuggestions from "./pages/CleanupSuggestions";

import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import Navbar from "./components/Navbar";

import { AuthProvider } from "./context/AuthContext";


/* =========================================================
   APP LAYOUT
========================================================= */

function AppLayout() {

  const location = useLocation();

  /*
    Login and Signup should not show the dashboard sidebar.
  */

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup";


  /* =======================================================
     AUTH PAGES
  ======================================================= */

  if (isAuthPage) {

    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
        }}
      >

        <Routes>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

        </Routes>

      </div>
    );
  }


  /* =======================================================
     DASHBOARD LAYOUT
  ======================================================= */

  return (

    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        background: "#f8fafc",
        overflowX: "hidden",
      }}
    >

      {/* ================================================
          SIDEBAR
      ================================================ */}

      <Navbar />


      {/* ================================================
          MAIN CONTENT
      ================================================ */}

      <main
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
        }}
      >

        <Routes>

          {/* ============================================
              HOME
          ============================================ */}

          <Route
            path="/"
            element={<Home />}
          />


          {/* ============================================
              FEATURE FLAGS
          ============================================ */}

          <Route
            path="/flags"
            element={<FlagPage />}
          />


          {/* ============================================
              CREATE FLAG
          ============================================ */}

          <Route
            path="/create-flag"
            element={<CreateFlag />}
          />


          {/* ============================================
              EDIT FLAG
          ============================================ */}

          <Route
            path="/edit-flag/:key"
            element={<EditFlag />}
          />


          {/* ============================================
              FLAG DETAIL
          ============================================ */}

          <Route
            path="/flag/:key"
            element={<FlagDetail />}
          />


          {/* ============================================
              EVALUATE
          ============================================ */}

          <Route
            path="/evaluate"
            element={<EvaluateFlag />}
          />


          {/* ============================================
              AUDIT LOGS
          ============================================ */}

          <Route
            path="/audit"
            element={<AuditLogs />}
          />


          {/* ============================================
              ENVIRONMENTS
          ============================================ */}

          <Route
            path="/environments"
            element={<EnvironmentPage />}
          />


          {/* ============================================
              CLEANUP
          ============================================ */}

          <Route
            path="/cleanup"
            element={<CleanupSuggestions />}
          />


          {/* ============================================
              PROFILE
          ============================================ */}

          <Route
            path="/profile"
            element={<Profile />}
          />


          {/* ============================================
              SETTINGS
          ============================================ */}

          <Route
            path="/settings"
            element={<Settings />}
          />


          {/* ============================================
              UNKNOWN ROUTE
          ============================================ */}

          <Route
            path="*"
            element={
              <Navigate
                to="/flags"
                replace
              />
            }
          />

        </Routes>

      </main>

    </div>
  );
}


/* =========================================================
   APP
========================================================= */

function App() {

  return (

    <AuthProvider>

      <BrowserRouter>

        <AppLayout />

      </BrowserRouter>

    </AuthProvider>
  );
}


export default App;