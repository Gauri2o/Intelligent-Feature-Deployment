import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const linkStyle = (path) => ({
    color: "#fff",
    textDecoration: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    backgroundColor: location.pathname === path ? "#2563eb" : "transparent",
    transition: "0.3s",
    fontWeight: "500",
  });

  return (
    <nav
      style={{
        background: "#1e293b",
        padding: "15px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          color: "white",
          margin: 0,
          fontSize: "24px",
        }}
      >
        🚀 Feature Flags
      </h2>

      <div
        style={{
          display: "flex",
          gap: "15px",
        }}
      >
        <Link to="/" style={linkStyle("/")}>
          Dashboard
        </Link>

        <Link to="/" style={linkStyle("/")}>
          Flags
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;