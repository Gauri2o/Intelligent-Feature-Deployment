import {
  NavLink,
  useNavigate,
} from "react-router-dom";


function Navbar() {

  const navigate = useNavigate();


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem(
      "environment_id"
    );

    localStorage.removeItem(
      "environment"
    );

    localStorage.removeItem(
      "profile"
    );

    navigate("/login");
  };


  /* =====================================================
     NAV LINK CLASS
  ===================================================== */

  const navClass = ({ isActive }) => {

    return `
      sidebar-link
      ${isActive ? "active" : ""}
    `;
  };


  /* =====================================================
     SIDEBAR
  ===================================================== */

  return (

    <aside
      className="sidebar"
      style={{
        width: "250px",
        minWidth: "250px",
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflowY: "auto",
        overflowX: "hidden",
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        zIndex: 50,
      }}
    >

      {/* =================================================
          BRAND
      ================================================= */}

      <div
        className="sidebar-brand"
        style={{
          flexShrink: 0,
          padding: "22px 20px 20px",
          display: "flex",
          alignItems: "center",
          gap: "11px",
          borderBottom: "1px solid #f1f5f9",
        }}
      >

        <div
          className="brand-logo"
          style={{
            width: "38px",
            height: "38px",
            flexShrink: 0,
            borderRadius: "10px",
            background:
              "linear-gradient(135deg,#7c3aed,#8b5cf6)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            boxShadow:
              "0 8px 20px rgba(124,58,237,.20)",
          }}
        >
          🚀
        </div>


        <div
          className="brand-text"
          style={{
            minWidth: 0,
          }}
        >

          <div
            className="brand-title"
            style={{
              color: "#0f172a",
              fontSize: "15px",
              lineHeight: "1.2",
              fontWeight: "800",
              whiteSpace: "nowrap",
            }}
          >
            FeatureFlow
          </div>


          <div
            className="brand-subtitle"
            style={{
              marginTop: "4px",
              color: "#94a3b8",
              fontSize: "9px",
              lineHeight: "1.2",
              whiteSpace: "nowrap",
            }}
          >
            Intelligent Deployment
          </div>

        </div>

      </div>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",
          padding: "18px 12px",
        }}
      >

        {/* =================================================
            MAIN
        ================================================= */}

        <div className="sidebar-section">

          <div
            className="sidebar-label"
            style={{
              padding: "0 10px",
              marginBottom: "8px",
              color: "#94a3b8",
              fontSize: "9px",
              fontWeight: "800",
              letterSpacing: "1.2px",
            }}
          >
            MAIN
          </div>


          {/* Feature Flags */}

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


          {/* Create Flag */}

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


          {/* Evaluate */}

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


          {/* Audit Logs */}

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


        {/* =================================================
            MANAGEMENT
        ================================================= */}

        <div
          className="sidebar-section"
          style={{
            marginTop: "25px",
          }}
        >

          <div
            className="sidebar-label"
            style={{
              padding: "0 10px",
              marginBottom: "8px",
              color: "#94a3b8",
              fontSize: "9px",
              fontWeight: "800",
              letterSpacing: "1.2px",
            }}
          >
            MANAGEMENT
          </div>


          {/* Environments */}

          <NavLink
            to="/environments"
            className={navClass}
          >

            <span className="sidebar-icon">
              ◉
            </span>

            <span>
              Environments
            </span>

          </NavLink>


          {/* Cleanup */}

          <NavLink
            to="/cleanup"
            className={navClass}
          >

            <span className="sidebar-icon">
              ✦
            </span>

            <span>
              Cleanup Suggestions
            </span>

          </NavLink>


          {/* Home */}

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


        {/* =================================================
            ACCOUNT
        ================================================= */}

        <div
          className="sidebar-section"
          style={{
            marginTop: "25px",
          }}
        >

          <div
            className="sidebar-label"
            style={{
              padding: "0 10px",
              marginBottom: "8px",
              color: "#94a3b8",
              fontSize: "9px",
              fontWeight: "800",
              letterSpacing: "1.2px",
            }}
          >
            ACCOUNT
          </div>


          {/* Profile */}

          <NavLink
            to="/profile"
            className={navClass}
          >

            <span className="sidebar-icon">
              ◯
            </span>

            <span>
              Profile
            </span>

          </NavLink>


          {/* Settings */}

          <NavLink
            to="/settings"
            className={navClass}
          >

            <span className="sidebar-icon">
              ⚙
            </span>

            <span>
              Settings
            </span>

          </NavLink>

        </div>

      </div>


      {/* =================================================
          BOTTOM
      ================================================= */}

      <div
        className="sidebar-bottom"
        style={{
          flexShrink: 0,
          padding: "14px 12px",
          borderTop: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
      >

        {/* =================================================
            SYSTEM STATUS
        ================================================= */}

        <div
          className="sidebar-status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            padding: "10px",
            marginBottom: "9px",
            background: "#f8fafc",
            borderRadius: "9px",
          }}
        >

          <span
            className="status-online"
            style={{
              width: "7px",
              height: "7px",
              flexShrink: 0,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow:
                "0 0 0 3px rgba(34,197,94,.10)",
            }}
          />


          <div
            style={{
              minWidth: 0,
            }}
          >

            <strong
              style={{
                display: "block",
                color: "#334155",
                fontSize: "10px",
                lineHeight: "1.3",
              }}
            >
              System Online
            </strong>


            <small
              style={{
                display: "block",
                marginTop: "2px",
                color: "#94a3b8",
                fontSize: "9px",
              }}
            >
              Deployment ready
            </small>

          </div>

        </div>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          className="sidebar-logout"
          onClick={handleLogout}
          type="button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 12px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            background: "#ffffff",
            color: "#64748b",
            fontSize: "11px",
            fontWeight: "700",
            cursor: "pointer",
          }}
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