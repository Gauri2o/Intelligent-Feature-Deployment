import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function FlagPage() {
  const navigate = useNavigate();

  const [flags, setFlags] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const response = await api.get("/flags/");
      setFlags(response.data);
    } catch (error) {
      console.error(error);
      alert("Unable to load flags.");
    }
  };

  const deleteFlag = async (key) => {
    const confirmDelete = window.confirm(
      `Delete "${key}" ?`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/flags/${key}`);

      alert("Flag deleted successfully.");

      fetchFlags();
    } catch (error) {
      console.error(error);
      alert("Delete failed.");
    }
  };

  const toggleFlag = async (key) => {
    try {
      await api.patch(`/flags/${key}/toggle`);

      fetchFlags();
    } catch (error) {
      console.error(error);
      alert("Toggle failed.");
    }
  };

  const enabledCount = flags.filter(
    (f) => f.enabled
  ).length;

  const disabledCount =
    flags.length - enabledCount;

  const filteredFlags = flags.filter((flag) =>
    flag.flag_key
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        background: "#f1f5f9",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      <h1
        style={{
          marginBottom: "25px",
        }}
      >
        🚀 Feature Flag Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(200px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <Card
          title="Total Flags"
          value={flags.length}
          color="#2563eb"
        />

        <Card
          title="Enabled"
          value={enabledCount}
          color="#16a34a"
        />

        <Card
          title="Disabled"
          value={disabledCount}
          color="#dc2626"
        />

        <Card
          title="Environment"
          value="1"
          color="#9333ea"
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          marginBottom: "25px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <input
          type="text"
          placeholder="Search feature flag..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "320px",
            padding: "12px",
            borderRadius: "8px",
            border:
              "1px solid #cbd5e1",
          }}
        />

        <button
          onClick={() =>
            alert(
              "Create Flag page will be added next."
            )
          }
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding:
              "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          + Create Flag
        </button>
      </div>
            <table
        style={{
          width: "100%",
          background: "white",
          borderCollapse: "collapse",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 4px 10px rgba(0,0,0,.1)",
        }}
      >
        <thead
          style={{
            background: "#1e293b",
            color: "white",
          }}
        >
          <tr>
            <th style={th}>Flag Key</th>
            <th style={th}>Type</th>
            <th style={th}>Status</th>
            <th style={th}>Owner</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredFlags.map((flag) => (
            <tr key={flag.id}>
              <td style={td}>
                <Link
                  to={`/flag/${flag.flag_key}`}
                  style={{
                    textDecoration: "none",
                    color: "#2563eb",
                    fontWeight: "bold",
                  }}
                >
                  {flag.flag_key}
                </Link>
              </td>

              <td style={td}>{flag.type}</td>

              <td style={td}>
                <button
                  onClick={() =>
                    toggleFlag(flag.flag_key)
                  }
                  style={{
                    background: flag.enabled
                      ? "#16a34a"
                      : "#dc2626",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {flag.enabled
                    ? "🟢 Enabled"
                    : "🔴 Disabled"}
                </button>
              </td>

              <td style={td}>
                {flag.owner_team}
              </td>

              <td style={td}>
                <button
                  style={editButton}
                  onClick={() =>
                    navigate(
                      `/edit/${flag.flag_key}`
                    )
                  }
                >
                  ✏ Edit
                </button>

                <button
                  style={deleteButton}
                  onClick={() =>
                    deleteFlag(flag.flag_key)
                  }
                >
                  🗑 Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div
      style={{
        background: color,
        color: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: "16px",
          fontWeight: "500",
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          marginTop: "10px",
          marginBottom: 0,
          fontSize: "34px",
        }}
      >
        {value}
      </h1>
    </div>
  );
}

const th = {
  padding: "14px",
  textAlign: "left",
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
};

const editButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "10px",
  fontWeight: "bold",
};

const deleteButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default FlagPage;
