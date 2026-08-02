import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function FlagDetail() {
  const { key } = useParams();
  const navigate = useNavigate();

  const [flag, setFlag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFlag();
  }, []);

  const fetchFlag = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/flags/${key}`);
      setFlag(response.data);
    } catch (err) {
      console.error(err);
      setError("❌ Flag not found.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2 style={{ padding: 20 }}>Loading...</h2>;
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h2>{error}</h2>

        <button onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() => navigate("/")}
        style={{ marginBottom: 20 }}
      >
        ← Back
      </button>

      <h2>Flag Detail</h2>

      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          width: "60%",
        }}
      >
        <tbody>
          <tr>
            <td><strong>Flag Key</strong></td>
            <td>{flag.flag_key}</td>
          </tr>

          <tr>
            <td><strong>Type</strong></td>
            <td>{flag.type}</td>
          </tr>

          <tr>
            <td><strong>Default Value</strong></td>
            <td>{flag.default_value}</td>
          </tr>

          <tr>
            <td><strong>Description</strong></td>
            <td>{flag.description}</td>
          </tr>

          <tr>
            <td><strong>Status</strong></td>
            <td>
              {flag.enabled
                ? "🟢 Enabled"
                : "🔴 Disabled"}
            </td>
          </tr>

          <tr>
            <td><strong>Owner Team</strong></td>
            <td>{flag.owner_team}</td>
          </tr>
        </tbody>
      </table>

      <br />

      <h3>Targeting Rules</h3>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 15,
          borderRadius: 5,
          background: "#f8f8f8",
        }}
      >
        Coming in Milestone 2...
      </div>
    </div>
  );
}

export default FlagDetail;