import { useEffect, useState } from "react";
import api from "../services/api";

function EnvironmentPage() {
  const [environments, setEnvironments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Edit
  const [editingId, setEditingId] = useState(null);

  // Current environment
  const [currentEnvironmentId, setCurrentEnvironmentId] =
    useState(
      Number(localStorage.getItem("environment_id")) || null
    );

  // --------------------------------------------------
  // Fetch environments
  // --------------------------------------------------

  useEffect(() => {
    fetchEnvironments();
  }, []);

  const fetchEnvironments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/environments/");

      setEnvironments(response.data);

      // If no environment selected,
      // select first available environment.
      if (
        !localStorage.getItem("environment_id") &&
        response.data.length > 0
      ) {
        const firstEnvironment = response.data[0];

        setCurrentEnvironmentId(firstEnvironment.id);

        localStorage.setItem(
          "environment_id",
          firstEnvironment.id
        );

        localStorage.setItem(
          "environment",
          firstEnvironment.name
        );
      }
    } catch (err) {
      console.error(
        "Failed to load environments:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load environments."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Form reset
  // --------------------------------------------------

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
    setError("");
  };

  // --------------------------------------------------
  // Create / Update
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Environment name is required.");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        // -----------------------------
        // Update
        // -----------------------------

        const response = await api.put(
          `/environments/${editingId}`,
          {
            name: trimmedName,
            description: description.trim(),
          }
        );

        setEnvironments((prev) =>
          prev.map((environment) =>
            environment.id === editingId
              ? response.data
              : environment
          )
        );

        // Update local storage if
        // current environment was edited
        if (currentEnvironmentId === editingId) {
          localStorage.setItem(
            "environment",
            response.data.name
          );
        }

        setSuccess(
          "Environment updated successfully."
        );
      } else {
        // -----------------------------
        // Create
        // -----------------------------

        const response = await api.post(
          "/environments/",
          {
            name: trimmedName,
            description: description.trim(),
          }
        );

        setEnvironments((prev) => [
          ...prev,
          response.data,
        ]);

        setSuccess(
          "Environment created successfully."
        );
      }

      resetForm();
    } catch (err) {
      console.error(
        "Failed to save environment:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to save environment."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Edit
  // --------------------------------------------------

  const handleEdit = (environment) => {
    setEditingId(environment.id);
    setName(environment.name || "");
    setDescription(
      environment.description || ""
    );

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  const handleDelete = async (environment) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${environment.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(environment.id);
      setError("");
      setSuccess("");

      await api.delete(
        `/environments/${environment.id}`
      );

      setEnvironments((prev) =>
        prev.filter(
          (item) =>
            item.id !== environment.id
        )
      );

      // If deleted environment was current,
      // clear current environment.
      if (
        currentEnvironmentId ===
        environment.id
      ) {
        localStorage.removeItem(
          "environment_id"
        );

        localStorage.removeItem(
          "environment"
        );

        setCurrentEnvironmentId(null);
      }

      setSuccess(
        "Environment deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete environment:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to delete environment."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // Select current environment
  // --------------------------------------------------

  const handleSelectEnvironment = (
    environment
  ) => {
    setCurrentEnvironmentId(
      environment.id
    );

    localStorage.setItem(
      "environment_id",
      environment.id
    );

    localStorage.setItem(
      "environment",
      environment.name
    );

    setSuccess(
      `${environment.name} is now the active environment.`
    );
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="environment-page">

        <div className="environment-container">

          <div className="environment-loading">

            <div className="environment-spinner"></div>

            <h2>
              Loading Environments...
            </h2>

            <p>
              Fetching your deployment environments.
            </p>

          </div>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="environment-page">

      <div className="environment-container">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="environment-header">

          <div className="environment-heading">

            <div className="environment-eyebrow">
              DEPLOYMENT CONFIGURATION
            </div>

            <h1>
              Environment Management
            </h1>

            <p>
              Manage Development, Staging,
              Production and other environments
              for your feature flags.
            </p>

          </div>

          <div className="environment-header-badge">

            <span className="environment-live-dot"></span>

            {environments.length}{" "}
            {environments.length === 1
              ? "Environment"
              : "Environments"}

          </div>

        </div>


        {/* ==========================================
            ALERTS
        ========================================== */}

        {error && (
          <div className="environment-alert environment-alert-error">

            <span className="environment-alert-icon">
              !
            </span>

            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
              className="environment-alert-close"
            >
              ×
            </button>

          </div>
        )}


        {success && (
          <div className="environment-alert environment-alert-success">

            <span className="environment-alert-icon">
              ✓
            </span>

            <span>
              {success}
            </span>

            <button
              onClick={() =>
                setSuccess("")
              }
              className="environment-alert-close"
            >
              ×
            </button>

          </div>
        )}


        {/* ==========================================
            TOP GRID
        ========================================== */}

        <div className="environment-top-grid">

          {/* ----------------------------------------
              FORM CARD
          ---------------------------------------- */}

          <div className="environment-form-card">

            <div className="environment-card-header">

              <div>

                <div className="environment-card-icon">
                  {editingId ? "✎" : "+"}
                </div>

                <div>

                  <h2>
                    {editingId
                      ? "Edit Environment"
                      : "Create Environment"}
                  </h2>

                  <p>
                    {editingId
                      ? "Update environment configuration."
                      : "Add a new deployment environment."}
                  </p>

                </div>

              </div>

            </div>


            <form
              onSubmit={handleSubmit}
              className="environment-form"
            >

              {/* Name */}

              <div className="environment-field">

                <label>
                  Environment Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="e.g. Development"
                  disabled={saving}
                />

              </div>


              {/* Description */}

              <div className="environment-field">

                <label>
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Describe what this environment is used for..."
                  disabled={saving}
                />

              </div>


              {/* Buttons */}

              <div className="environment-form-actions">

                <button
                  type="submit"
                  className="environment-save-button"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingId
                        ? "✓ Update Environment"
                        : "+ Create Environment"}
                    </>
                  )}

                </button>


                {editingId && (
                  <button
                    type="button"
                    className="environment-cancel-button"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>

          </div>


          {/* ----------------------------------------
              INFO CARD
          ---------------------------------------- */}

          <div className="environment-info-card">

            <div className="environment-info-icon">
              ◈
            </div>

            <div>

              <h2>
                Why environments?
              </h2>

              <p>
                Keep feature releases isolated
                between development, staging and
                production.
              </p>

            </div>


            <div className="environment-flow">

              <div className="environment-flow-item">

                <span className="flow-number">
                  01
                </span>

                <div>
                  <strong>
                    Development
                  </strong>

                  <small>
                    Build & experiment
                  </small>
                </div>

              </div>


              <div className="environment-flow-line"></div>


              <div className="environment-flow-item">

                <span className="flow-number">
                  02
                </span>

                <div>
                  <strong>
                    Staging
                  </strong>

                  <small>
                    Test before release
                  </small>
                </div>

              </div>


              <div className="environment-flow-line"></div>


              <div className="environment-flow-item">

                <span className="flow-number">
                  03
                </span>

                <div>
                  <strong>
                    Production
                  </strong>

                  <small>
                    Live users
                  </small>
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ==========================================
            ENVIRONMENT LIST
        ========================================== */}

        <div className="environment-list-card">

          <div className="environment-list-toolbar">

            <div>

              <div className="environment-list-eyebrow">
                AVAILABLE ENVIRONMENTS
              </div>

              <h2>
                Deployment Environments
              </h2>

              <p>
                Select an environment to make it
                active across the dashboard.
              </p>

            </div>

            <button
              className="environment-refresh-button"
              onClick={fetchEnvironments}
            >
              ↻ Refresh
            </button>

          </div>


          {/* Empty */}

          {environments.length === 0 ? (

            <div className="environment-empty">

              <div className="environment-empty-icon">
                ◉
              </div>

              <h3>
                No environments yet
              </h3>

              <p>
                Create your first environment
                using the form above.
              </p>

            </div>

          ) : (

            <div className="environment-table-wrapper">

              <table className="environment-table">

                <thead>

                  <tr>

                    <th>
                      ENVIRONMENT
                    </th>

                    <th>
                      DESCRIPTION
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      ACTIONS
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {environments.map(
                    (environment) => {

                      const isActive =
                        currentEnvironmentId ===
                        environment.id;

                      return (

                        <tr
                          key={environment.id}
                          className={
                            isActive
                              ? "environment-row-active"
                              : ""
                          }
                        >

                          {/* Environment */}

                          <td>

                            <div className="environment-name-cell">

                              <div
                                className={`environment-name-icon ${
                                  isActive
                                    ? "active"
                                    : ""
                                }`}
                              >
                                {environment.name
                                  ?.charAt(0)
                                  .toUpperCase() ||
                                  "E"}
                              </div>

                              <div>

                                <strong>
                                  {environment.name}
                                </strong>

                                <small>
                                  Environment #
                                  {environment.id}
                                </small>

                              </div>

                            </div>

                          </td>


                          {/* Description */}

                          <td>

                            <span className="environment-description">

                              {environment.description ||
                                "No description provided"}

                            </span>

                          </td>


                          {/* Status */}

                          <td>

                            {isActive ? (

                              <span className="environment-status active">

                                <span className="environment-status-dot"></span>

                                Active

                              </span>

                            ) : (

                              <button
                                className="environment-set-active"
                                onClick={() =>
                                  handleSelectEnvironment(
                                    environment
                                  )
                                }
                              >
                                Set Active
                              </button>

                            )}

                          </td>


                          {/* Actions */}

                          <td>

                            <div className="environment-actions">

                              <button
                                className="environment-edit-button"
                                onClick={() =>
                                  handleEdit(
                                    environment
                                  )
                                }
                              >
                                Edit
                              </button>


                              <button
                                className="environment-delete-button"
                                onClick={() =>
                                  handleDelete(
                                    environment
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  environment.id
                                }
                              >

                                {deletingId ===
                                environment.id
                                  ? "Deleting..."
                                  : "Delete"}

                              </button>

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* ==========================================
            FOOTER
        ========================================== */}

        <div className="environment-footer">

          <span>
            FeatureFlow • Environment Management
          </span>

          <span>
            Environment-specific deployment control
          </span>

        </div>

      </div>

    </div>
  );
}

export default EnvironmentPage;