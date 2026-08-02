import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function FlagPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    flag_key: "",
    type: "boolean",
    default_value: "true",
    enabled: true,
    description: "",
    owner_team: "",
    environment_id: 1,
  });

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/flags/");
      setFlags(response.data);
    } catch (err) {
      setError("❌ Failed to load flags.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createFlag = async () => {
    try {
      await api.post("/flags/", form);

      setSuccess("✅ Flag created successfully!");

      setForm({
        flag_key: "",
        type: "boolean",
        default_value: "true",
        enabled: true,
        description: "",
        owner_team: "",
        environment_id: 1,
      });

      fetchFlags();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.detail || "Unable to create flag");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Feature Flag Management</h2>

      {success && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          {success}
        </p>
      )}

      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          {error}
        </p>
      )}

      <h3>Create Flag</h3>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Flag Key"
          value={form.flag_key}
          onChange={(e) =>
            setForm({ ...form, flag_key: e.target.value })
          }
        />

        {" "}

        <input
          placeholder="Owner Team"
          value={form.owner_team}
          onChange={(e) =>
            setForm({ ...form, owner_team: e.target.value })
          }
        />

        <br />
        <br />

        <input
          placeholder="Description"
          value={form.description}
          style={{ width: 350 }}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <br />
        <br />

        <label>
          Enabled

          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) =>
              setForm({
                ...form,
                enabled: e.target.checked,
              })
            }
          />
        </label>

        <br />
        <br />

        <button onClick={createFlag}>
          Create Flag
        </button>

        {" "}

        <button onClick={fetchFlags}>
          Refresh
        </button>
      </div>

      {loading ? (
        <h3>Loading...</h3>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Flag Key</th>
              <th>Type</th>
              <th>Status</th>
              <th>Owner Team</th>
            </tr>
          </thead>

          <tbody>
            {flags.map((flag) => (
              <tr key={flag.id}>
                <td>
                  <Link to={`/flag/${flag.flag_key}`}>
                    {flag.flag_key}
                  </Link>
                </td>

                <td>{flag.type}</td>

                <td>
                  {flag.enabled
                    ? "🟢 Enabled"
                    : "🔴 Disabled"}
                </td>

                <td>{flag.owner_team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FlagPage;