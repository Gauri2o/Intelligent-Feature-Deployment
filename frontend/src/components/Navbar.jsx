import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();

  const {
    token,
    user,
    logout
  } = useAuth();

  const [environment, setEnvironment] = useState(
    localStorage.getItem("environment") || "Development"
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleEnvironmentChange = (e) => {
    const selectedEnvironment = e.target.value;

    setEnvironment(selectedEnvironment);

    localStorage.setItem(
      "environment",
      selectedEnvironment
    );

    // Refresh current page so data can reload
    window.location.reload();
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        background: "#1e293b",
        color: "white",
        flexWrap: "wrap",
        gap: "15px"
      }}
    >

      {/* Logo */}
      <h2 style={{ margin: 0 }}>
        🚀 Feature Deployment
      </h2>


      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          flexWrap: "wrap"
        }}
      >

        {token ? (
          <>

            {/* Dashboard */}
            <Link
              to="/flags"
              style={linkStyle}
            >
              Dashboard
            </Link>


            {/* Create Flag */}
            <Link
              to="/create-flag"
              style={linkStyle}
            >
              ➕ Create Flag
            </Link>


            {/* Audit Logs */}
            <Link
              to="/audit"
              style={linkStyle}
            >
              📋 Audit Logs
            </Link>


            {/* Environment Switcher */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >

              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                Environment:
              </label>

              <select
                value={environment}
                onChange={handleEnvironmentChange}
                style={selectStyle}
              >

                <option value="Development">
                  Development
                </option>

                <option value="Staging">
                  Staging
                </option>

                <option value="Production">
                  Production
                </option>

              </select>

            </div>


            {/* User */}
            <div
              style={{
                marginLeft: "10px",
                textAlign: "right"
              }}
            >

              <div>
                👤 {user?.username || "User"}
              </div>

              <small>
                {user?.role || "Developer"}
              </small>

            </div>


            {/* Logout */}
            <button
              onClick={handleLogout}
              style={logoutButton}
            >
              Logout
            </button>

          </>
        ) : (
          <>

            {/* Login */}
            <Link
              to="/login"
              style={linkStyle}
            >
              Login
            </Link>


            {/* Signup */}
            <Link
              to="/signup"
              style={linkStyle}
            >
              Signup
            </Link>

          </>
        )}

      </div>

    </nav>
  );
}


const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "500"
};


const selectStyle = {
  padding: "7px 10px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#1e293b",
  cursor: "pointer",
  fontWeight: "500"
};


const logoutButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 15px",
  borderRadius: "6px",
  cursor: "pointer"
};


export default Navbar;