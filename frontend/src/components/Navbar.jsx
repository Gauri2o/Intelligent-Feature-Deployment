import {
  NavLink,
  useNavigate
} from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("environment_id");
    localStorage.removeItem("environment");

    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar">

      {/* ==============================
          BRAND
      ============================== */}

      <div className="sidebar-brand">

        <div className="brand-logo">
          🚀
        </div>

        <div className="brand-text">
          <div className="brand-title">
            FeatureFlow
          </div>

          <div className="brand-subtitle">
            Intelligent Deployment
          </div>
        </div>

      </div>


      {/* ==============================
          NAVIGATION
      ============================== */}

      <div className="sidebar-section">

        <div className="sidebar-label">
          MAIN
        </div>


        <NavLink
          to="/flags"
          className={navClass}
        >
          <span className="sidebar-icon">
            ◈
          </span>

          <span>
            Feature Flags
          </span>
        </NavLink>


        <NavLink
          to="/create-flag"
          className={navClass}
        >
          <span className="sidebar-icon">
            ＋
          </span>

          <span>
            Create Flag
          </span>
        </NavLink>


        <NavLink
          to="/evaluate"
          className={navClass}
        >
          <span className="sidebar-icon">
            ◎
          </span>

          <span>
            Evaluate
          </span>
        </NavLink>


        <NavLink
          to="/audit"
          className={navClass}
        >
          <span className="sidebar-icon">
            ≡
          </span>

          <span>
            Audit Logs
          </span>
        </NavLink>

      </div>


      {/* ==============================
          MANAGEMENT
      ============================== */}

      <div className="sidebar-section">

        <div className="sidebar-label">
          MANAGEMENT
        </div>

        <NavLink
          to="/"
          className={navClass}
        >
          <span className="sidebar-icon">
            ⌂
          </span>

          <span>
            Home
          </span>
        </NavLink>

      </div>


      {/* ==============================
          BOTTOM
      ============================== */}

      <div className="sidebar-bottom">

        <div className="sidebar-status">

          <span className="status-online"></span>

          <div>
            <strong>
              System Online
            </strong>

            <small>
              Deployment ready
            </small>
          </div>

        </div>


        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <span>
            ↪
          </span>

          Logout
        </button>

      </div>

    </aside>
  );
}

export default Navbar;