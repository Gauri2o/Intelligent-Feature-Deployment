import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function FlagDetail() {
  const { key } = useParams();
  const navigate = useNavigate();

  const [flag, setFlag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlag();
  }, [key]);

  const fetchFlag = async () => {
    try {
      const response = await api.get(`/flags/${key}`);
      setFlag(response.data);
    } catch (err) {
      console.error("Failed to load flag:", err);
      alert("Flag not found");
      navigate("/flags");
    } finally {
      setLoading(false);
    }
  };

  const deleteFlag = async () => {
    const confirmDelete = window.confirm(
      "Delete this feature flag?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/flags/${key}`);

      alert("Flag deleted successfully.");

      navigate("/flags");
    } catch (err) {
      console.error("Delete failed:", err);

      alert("Delete failed.");
    }
  };

  if (loading) {
    return (
      <h2 style={{ padding: "30px" }}>
        Loading Flag Details...
      </h2>
    );
  }

  if (!flag) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Flag not found 🚩</h2>

        <button
          onClick={() => navigate("/flags")}
          style={backBtn}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "850px",
        margin: "30px auto",
        background: "white",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 5px 15px rgba(0,0,0,.15)",
      }}
    >

      {/* Header Actions */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "25px",
        }}
      >

        <button
          onClick={() => navigate("/flags")}
          style={backBtn}
        >
          ← Dashboard
        </button>

        <div>

          <button
            style={editBtn}
            onClick={() =>
              navigate(`/edit-flag/${flag.flag_key}`)
            }
          >
            ✏ Edit
          </button>

          <button
            style={deleteBtn}
            onClick={deleteFlag}
          >
            🗑 Delete
          </button>

        </div>

      </div>


      {/* Title */}

      <h1 style={{ marginBottom: "25px" }}>
        🚀 Feature Flag Details
      </h1>


      {/* Flag Details */}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >

        <tbody>

          <Row
            label="Flag Key"
            value={flag.flag_key}
          />

          <Row
            label="Type"
            value={flag.type}
          />

          <Row
            label="Default Value"
            value={String(flag.default_value)}
          />

          <Row
            label="Description"
            value={flag.description || "No description"}
          />

          <Row
            label="Owner Team"
            value={flag.owner_team || "Not specified"}
          />

          <Row
            label="Environment ID"
            value={flag.environment_id}
          />

          <tr>

            <td style={labelStyle}>
              Status
            </td>

            <td style={valueStyle}>

              {flag.enabled ? (

                <span
                  style={{
                    color: "green",
                    fontWeight: "bold",
                  }}
                >
                  🟢 Enabled
                </span>

              ) : (

                <span
                  style={{
                    color: "red",
                    fontWeight: "bold",
                  }}
                >
                  🔴 Disabled
                </span>

              )}

            </td>

          </tr>

        </tbody>

      </table>


      {/* Targeting Rules */}

      <div
        style={{
          marginTop: "35px",
        }}
      >

        <h2>
          🎯 Targeting Rules
        </h2>

        <div
          style={{
            padding: "20px",
            background: "#f3f4f6",
            borderRadius: "8px",
            marginTop: "15px",
          }}
        >

          <p
            style={{
              margin: 0,
              color: "#64748b",
            }}
          >
            Targeting rules will be available in
            Milestone 2.
          </p>

        </div>

      </div>

    </div>
  );
}


/* -----------------------------------
   Reusable Detail Row
----------------------------------- */

function Row({ label, value }) {

  return (

    <tr>

      <td style={labelStyle}>
        {label}
      </td>

      <td style={valueStyle}>
        {value}
      </td>

    </tr>

  );
}


/* -----------------------------------
   Styles
----------------------------------- */

const labelStyle = {

  padding: "14px",

  width: "220px",

  background: "#f8fafc",

  fontWeight: "bold",

  borderBottom: "1px solid #ddd",

};


const valueStyle = {

  padding: "14px",

  borderBottom: "1px solid #ddd",

};


const backBtn = {

  background: "#475569",

  color: "white",

  border: "none",

  padding: "10px 18px",

  borderRadius: "6px",

  cursor: "pointer",

};


const editBtn = {

  background: "#2563eb",

  color: "white",

  border: "none",

  padding: "10px 18px",

  borderRadius: "6px",

  cursor: "pointer",

  marginRight: "10px",

};


const deleteBtn = {

  background: "#dc2626",

  color: "white",

  border: "none",

  padding: "10px 18px",

  borderRadius: "6px",

  cursor: "pointer",

};


export default FlagDetail;