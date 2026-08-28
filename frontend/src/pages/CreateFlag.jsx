import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateFlag() {
  const navigate = useNavigate();

  const [environments, setEnvironments] = useState([]);

  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(
    Number(localStorage.getItem("environment_id")) || 1
  );

  const [formData, setFormData] = useState({
    flag_key: "",
    type: "boolean",
    default_value: "false",
    enabled: false,
    description: "",
    owner_team: "",
    environment_id:
      Number(localStorage.getItem("environment_id")) || 1,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      const response = await api.get("/environments/");
      const data = response.data || [];

      setEnvironments(data);

      const savedId = Number(
        localStorage.getItem("environment_id")
      );

      const exists = data.some(
        (env) => Number(env.id) === savedId
      );

      let environment;

      if (savedId && exists) {
        environment = data.find(
          (env) => Number(env.id) === savedId
        );
      } else {
        environment =
          data.find(
            (env) => env.name === "Development"
          ) || data[0];
      }

      if (environment) {
        setSelectedEnvironmentId(
          Number(environment.id)
        );

        setFormData((prev) => ({
          ...prev,
          environment_id: Number(environment.id),
        }));

        localStorage.setItem(
          "environment_id",
          environment.id
        );

        localStorage.setItem(
          "environment",
          environment.name
        );
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load environments.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleEnvironmentChange = (e) => {
    const id = Number(e.target.value);

    setSelectedEnvironmentId(id);

    setFormData((prev) => ({
      ...prev,
      environment_id: id,
    }));

    const environment = environments.find(
      (env) => Number(env.id) === id
    );

    if (environment) {
      localStorage.setItem(
        "environment_id",
        id
      );

      localStorage.setItem(
        "environment",
        environment.name
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.flag_key.trim()) {
      setError("Please enter a feature flag key.");
      return;
    }

    if (!formData.environment_id) {
      setError("Please select an environment.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/flags/", {
        ...formData,
        flag_key: formData.flag_key.trim(),
        environment_id: Number(
          formData.environment_id
        ),
      });

      navigate("/flags");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to create feature flag."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentEnvironment = environments.find(
    (env) =>
      Number(env.id) ===
      Number(selectedEnvironmentId)
  );

  return (
    <div className="workspace-page">
      <div className="workspace-container">

        {/* Header */}

        <div className="workspace-header">

          <div>
            <div className="workspace-eyebrow">
              FEATURE MANAGEMENT
            </div>

            <h1>Create Feature Flag</h1>

            <p>
              Create and configure a new feature
              release for your application.
            </p>
          </div>

          <Link
            to="/flags"
            className="secondary-button"
          >
            ← Back to Flags
          </Link>

        </div>

        {/* Main Grid */}

        <div className="create-grid">

          {/* Form */}

          <div className="form-card">

            <div className="form-card-header">
              <div>
                <h2>Flag Configuration</h2>
                <p>
                  Define how this feature should
                  behave in your application.
                </p>
              </div>

              <div className="form-header-icon">
                ⚙
              </div>
            </div>

            {error && (
              <div className="form-error">
                <span>⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="form-section">

                <div className="form-section-title">
                  Basic Information
                </div>

                <div className="form-field">
                  <label>
                    Flag Key
                    <span>*</span>
                  </label>

                  <input
                    name="flag_key"
                    value={formData.flag_key}
                    onChange={handleChange}
                    placeholder="e.g. dark_mode"
                    required
                  />

                  <small>
                    Use a unique key such as
                    <code> checkout_v2 </code>
                  </small>
                </div>

                <div className="form-row">

                  <div className="form-field">
                    <label>Type</label>

                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
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
                  </div>

                  <div className="form-field">
                    <label>Environment</label>

                    <select
                      value={selectedEnvironmentId}
                      onChange={
                        handleEnvironmentChange
                      }
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
                  </div>

                </div>

              </div>

              <div className="form-divider" />

              <div className="form-section">

                <div className="form-section-title">
                  Default Behavior
                </div>

                <div className="form-field">
                  <label>
                    Default Value
                  </label>

                  <input
                    name="default_value"
                    value={
                      formData.default_value
                    }
                    onChange={handleChange}
                    placeholder="false"
                  />
                </div>

                <div className="form-field">
                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what this feature controls..."
                  />
                </div>

              </div>

              <div className="form-divider" />

              <div className="form-section">

                <div className="form-section-title">
                  Ownership
                </div>

                <div className="form-field">
                  <label>
                    Owner Team
                  </label>

                  <input
                    name="owner_team"
                    value={formData.owner_team}
                    onChange={handleChange}
                    placeholder="e.g. Frontend"
                  />
                </div>

              </div>

              <div className="enable-card">

                <div className="enable-info">

                  <div className="enable-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Enable this flag
                    </strong>

                    <span>
                      Make the feature active
                      immediately after creation.
                    </span>
                  </div>

                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={formData.enabled}
                    onChange={handleChange}
                  />

                  <span className="switch-slider" />
                </label>

              </div>

              <div className="form-actions">

                <Link
                  to="/flags"
                  className="cancel-button"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="save-button"
                  disabled={loading}
                >
                  {loading
                    ? "Creating..."
                    : "Create Feature Flag"}
                </button>

              </div>

            </form>

          </div>

          {/* Preview */}

          <div className="preview-column">

            <div className="preview-card">

              <div className="preview-label">
                LIVE PREVIEW
              </div>

              <div className="preview-title">
                {formData.flag_key ||
                  "your_feature_flag"}
              </div>

              <div className="preview-description">
                {formData.description ||
                  "Your feature description will appear here."}
              </div>

              <div className="preview-status-row">

                <span
                  className={
                    formData.enabled
                      ? "preview-status active"
                      : "preview-status inactive"
                  }
                >
                  <span />
                  {formData.enabled
                    ? "Enabled"
                    : "Disabled"}
                </span>

                <span className="preview-type">
                  {formData.type}
                </span>

              </div>

              <div className="preview-divider" />

              <div className="preview-details">

                <div>
                  <span>Environment</span>
                  <strong>
                    {currentEnvironment?.name ||
                      "Loading..."}
                  </strong>
                </div>

                <div>
                  <span>Default value</span>
                  <strong>
                    {formData.default_value ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Owner</span>
                  <strong>
                    {formData.owner_team ||
                      "Unassigned"}
                  </strong>
                </div>

              </div>

            </div>

            <div className="tip-card">

              <div className="tip-icon">
                ✦
              </div>

              <div>
                <strong>
                  Pro tip
                </strong>

                <p>
                  Keep flag keys short and
                  descriptive. You can change
                  the flag behavior later without
                  redeploying your application.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default CreateFlag;