import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditFlag() {
  const { key } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "",
    default_value: "",
    enabled: false,
    description: "",
    owner_team: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlag();
  }, []);

  const loadFlag = async () => {
    try {
      const response = await api.get(`/flags/${key}`);

      setFormData({
        type: response.data.type,
        default_value: response.data.default_value,
        enabled: response.data.enabled,
        description: response.data.description || "",
        owner_team: response.data.owner_team,
      });

      setLoading(false);
    } catch (err) {
      alert("Flag not found");
      navigate("/");
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

    try {
      await api.put(`/flags/${key}`, formData);

      alert("Flag updated successfully!");

      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to update flag.");
    }
  };

  if (loading) {
    return <h2 style={{ padding: 20 }}>Loading...</h2>;
  }

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
      <h2>Edit Feature Flag</h2>

      <form onSubmit={handleSubmit}>

        <label>Type</label>

        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          style={inputStyle}
        />

        <label>Default Value</label>

        <input
          type="text"
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
          type="text"
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
              alignItems: "center",
              gap: "10px",
              fontWeight: "bold",
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

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop: "25px",
          }}
        >
          <button
            type="submit"
            style={saveButton}
          >
            💾 Save Changes
          </button>

          <button
            type="button"
            style={cancelButton}
            onClick={() => navigate("/")}
          >
            ❌ Cancel
          </button>
        </div>

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
  fontSize: "15px",
};

const textareaStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "8px",
  marginBottom: "18px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  minHeight: "100px",
  fontSize: "15px",
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

const cancelButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default EditFlag;