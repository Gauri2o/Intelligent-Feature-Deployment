import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateFlag() {
  const navigate = useNavigate();

  const [environments, setEnvironments] = useState([]);

  const [formData, setFormData] = useState({
    flag_key: "",
    type: "boolean",
    default_value: "false",
    enabled: false,
    description: "",
    owner_team: "",
    environment_id: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      const response = await api.get("/environments/");

      setEnvironments(response.data);

      if (response.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          environment_id: response.data[0].id,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      await api.post("/flags/", {
        ...formData,
        environment_id: Number(formData.environment_id),
      });

      alert("Flag created successfully!");

      navigate("/");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to create flag."
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        background: "white",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,.1)",
      }}
    >
      <h2>Create Feature Flag</h2>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <label>Flag Key</label>

        <input
          name="flag_key"
          value={formData.flag_key}
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <label>Type</label>

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="boolean">
            Boolean
          </option>

          <option value="string">
            String
          </option>

          <option value="number">
            Number
          </option>
        </select>

        <label>Environment</label>

        <select
          name="environment_id"
          value={formData.environment_id}
          onChange={handleChange}
          style={inputStyle}
        >
          {environments.map((env) => (
            <option
              key={env.id}
              value={env.id}
            >
              {env.name}
            </option>
          ))}
        </select>

        <label>Default Value</label>

        <input
          name="default_value"
          value={formData.default_value}
          onChange={handleChange}
          style={inputStyle}
        />

        <label>Description</label>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          style={textareaStyle}
        />

        <label>Owner Team</label>

        <input
          name="owner_team"
          value={formData.owner_team}
          onChange={handleChange}
          style={inputStyle}
        />

        <div
          style={{
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <label
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              name="enabled"
              checked={formData.enabled}
              onChange={handleChange}
            />

            Enabled
          </label>
        </div>

        <button
          type="submit"
          style={saveButton}
        >
          Create Flag
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "8px",
  marginBottom: "18px",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

const textareaStyle = {
  width: "100%",
  padding: "10px",
  minHeight: "100px",
  marginTop: "8px",
  marginBottom: "18px",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

const saveButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default CreateFlag;