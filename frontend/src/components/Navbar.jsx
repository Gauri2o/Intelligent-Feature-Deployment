import EnvironmentSwitcher from "./EnvironmentSwitcher";

function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        backgroundColor: "#1e293b",
        color: "white",
      }}
    >
      <h2>Intelligent Feature Deployment</h2>

      <EnvironmentSwitcher />
    </nav>
  );
}

export default Navbar;