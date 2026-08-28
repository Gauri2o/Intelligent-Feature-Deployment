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
    rollout_percentage: 0,
    description: "",
    owner_team: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFlag();
  }, [key]);

  const loadFlag = async () => {
    try {
      const response = await api.get(`/flags/${key}`);

      setFormData({
        type: response.data.type || "",
        default_value: response.data.default_value || "",
        enabled: response.data.enabled ?? false,
        rollout_percentage: response.data.rollout_percentage ?? 0,
        description: response.data.description || "",
        owner_team: response.data.owner_team || "",
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Flag not found");
      navigate("/flags");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "rollout_percentage"
          ? Number(value)
          : value,
    }));
  };

  const handleRolloutChange = (e) => {
    const value = Number(e.target.value);

    setFormData((prev) => ({
      ...prev,
      rollout_percentage: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await api.put(`/flags/${key}`, {
        type: formData.type,
        default_value: formData.default_value,
        enabled: formData.enabled,
        rollout_percentage: formData.rollout_percentage,
        description: formData.description,
        owner_team: formData.owner_team,
      });

      alert("Flag updated successfully!");

      navigate(`/flags/${key}`);
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        alert(
          `Failed to update flag: ${JSON.stringify(
            err.response.data.detail
          )}`
        );
      } else {
        alert("Failed to update flag.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <p style={eyebrowStyle}>FEATURE FLAG</p>

            <h2 style={titleStyle}>
              Edit Feature Flag
            </h2>

            <p style={subtitleStyle}>
              Configure the behavior and rollout of this feature.
            </p>
          </div>

          <button
            type="button"
            style={backButton}
            onClick={() => navigate(`/flags/${key}`)}
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* FLAG KEY */}

          <div style={sectionStyle}>
            <h3 style={sectionTitle}>
              Flag Configuration
            </h3>

            <label style={labelStyle}>
              Flag Key
            </label>

            <input
              type="text"
              value={key}
              disabled
              style={{
                ...inputStyle,
                background: "#f3f4f6",
                cursor: "not-allowed",
              }}
            />

            <label style={labelStyle}>
              Type
            </label>

            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              style={inputStyle}
            />

            <label style={labelStyle}>
              Default Value
            </label>

            <input
              type="text"
              name="default_value"
              value={formData.default_value}
              onChange={handleChange}
              style={inputStyle}
            />

            <label style={labelStyle}>
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={textareaStyle}
            />

            <label style={labelStyle}>
              Owner Team
            </label>

            <input
              type="text"
              name="owner_team"
              value={formData.owner_team}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* ENABLED */}

          <div style={sectionStyle}>
            <h3 style={sectionTitle}>
              Feature Status
            </h3>

            <label style={enabledContainer}>
              <input
                type="checkbox"
                name="enabled"
                checked={formData.enabled}
                onChange={handleChange}
                style={checkboxStyle}
              />

              <div>
                <strong>
                  Enabled
                </strong>

                <p style={smallText}>
                  Turn this feature flag on or off.
                </p>
              </div>
            </label>
          </div>

          {/* PERCENTAGE ROLLOUT */}

          <div style={rolloutSection}>
            <div style={rolloutHeader}>
              <div>
                <h3 style={sectionTitle}>
                  🚀 Percentage Rollout
                </h3>

                <p style={smallText}>
                  Gradually release this feature to a percentage
                  of users.
                </p>
              </div>

              <div style={percentageValue}>
                {formData.rollout_percentage}%
              </div>
            </div>

            <div style={sliderContainer}>
              <input
                type="range"
                name="rollout_percentage"
                min="0"
                max="100"
                step="1"
                value={formData.rollout_percentage}
                onChange={handleRolloutChange}
                style={sliderStyle}
              />

              <div style={sliderLabels}>
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div style={infoBox}>
              <span>ℹ️</span>

              <div>
                <strong>
                  Enabled for {formData.rollout_percentage}% of users
                </strong>

                <p>
                  Users are assigned to a deterministic bucket.
                  The same user will consistently receive the
                  same result.
                </p>
              </div>
            </div>
          </div>

          {/* BUTTONS */}

          <div style={buttonContainer}>

            <button
              type="submit"
              style={{
                ...saveButton,
                opacity: saving ? 0.7 : 1,
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
              }}
              disabled={saving}
            >
              {saving
                ? "⏳ Saving..."
                : "💾 Save Changes"}
            </button>

            <button
              type="button"
              style={cancelButton}
              onClick={() => navigate(`/flags/${key}`)}
              disabled={saving}
            >
              ❌ Cancel
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}


/* =====================================================
   STYLES
===================================================== */

const pageStyle = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "30px 20px",
};

const cardStyle = {
  maxWidth: "750px",
  margin: "0 auto",
  background: "white",
  padding: "32px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "30px",
};

const eyebrowStyle = {
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "1px",
  margin: "0 0 5px 0",
  color: "#64748b",
};

const titleStyle = {
  margin: "0",
  fontSize: "28px",
  color: "#111827",
};

const subtitleStyle = {
  marginTop: "8px",
  color: "#64748b",
};

const backButton = {
  background: "#f1f5f9",
  border: "none",
  padding: "10px 15px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: "600",
};

const sectionStyle = {
  marginBottom: "28px",
  padding: "22px",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
};

const sectionTitle = {
  margin: "0 0 18px 0",
  fontSize: "18px",
  color: "#111827",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginBottom: "7px",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  marginBottom: "18px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  fontSize: "15px",
};

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  marginBottom: "18px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  minHeight: "100px",
  fontSize: "15px",
  resize: "vertical",
};

const enabledContainer = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px",
  borderRadius: "8px",
  background: "#f8fafc",
  cursor: "pointer",
};

const checkboxStyle = {
  width: "18px",
  height: "18px",
  cursor: "pointer",
};

const smallText = {
  margin: "5px 0 0 0",
  color: "#64748b",
  fontSize: "14px",
};

const rolloutSection = {
  marginBottom: "28px",
  padding: "22px",
  border: "1px solid #bfdbfe",
  borderRadius: "10px",
  background: "#f8fbff",
};

const rolloutHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const percentageValue = {
  fontSize: "30px",
  fontWeight: "700",
  color: "#2563eb",
};

const sliderContainer = {
  marginTop: "25px",
};

const sliderStyle = {
  width: "100%",
  cursor: "pointer",
};

const sliderLabels = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "8px",
  fontSize: "12px",
  color: "#64748b",
};

const infoBox = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
  padding: "14px",
  background: "#eff6ff",
  borderRadius: "8px",
  color: "#1e40af",
};

const buttonContainer = {
  display: "flex",
  gap: "15px",
  marginTop: "25px",
};

const saveButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 22px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "15px",
};

const cancelButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "12px 22px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "15px",
};

const loadingStyle = {
  padding: "40px",
  textAlign: "center",
};

export default EditFlag;