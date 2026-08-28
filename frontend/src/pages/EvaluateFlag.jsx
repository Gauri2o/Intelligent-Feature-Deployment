import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function EvaluateFlag() {
  const [flagKey, setFlagKey] = useState("");

  const [environmentId, setEnvironmentId] =
    useState(
      Number(
        localStorage.getItem("environment_id")
      ) || 1
    );

  const [userId, setUserId] = useState("");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [environments, setEnvironments] =
    useState([]);

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      const response = await api.get(
        "/environments/"
      );

      setEnvironments(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const evaluateFlag = async (e) => {
    e.preventDefault();

    setResult(null);
    setError("");

    try {
      setLoading(true);

      const response = await api.post(
        "/flags/evaluate",
        {
          flag_key: flagKey,
          environment_id: Number(
            environmentId
          ),
          user_context: {
            user_id: userId,
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Evaluation failed. Please check the flag key and environment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace-page">

      <div className="workspace-container">

        {/* Header */}

        <div className="workspace-header">

          <div>
            <div className="workspace-eyebrow">
              FLAG TESTING
            </div>

            <h1>Evaluate Feature Flag</h1>

            <p>
              Test how a feature flag resolves
              for a specific user and environment.
            </p>
          </div>

          <Link
            to="/flags"
            className="secondary-button"
          >
            ← Back to Flags
          </Link>

        </div>

        <div className="evaluate-grid">

          {/* Evaluation Form */}

          <div className="evaluate-card">

            <div className="evaluate-card-top">

              <div className="evaluate-icon">
                ⚡
              </div>

              <div>
                <h2>Run Evaluation</h2>

                <p>
                  Enter the evaluation context
                  below.
                </p>
              </div>

            </div>

            {error && (
              <div className="form-error">
                <span>⚠</span>
                {error}
              </div>
            )}

            <form
              onSubmit={evaluateFlag}
              className="evaluate-form"
            >

              <div className="form-field">
                <label>
                  Feature Flag
                  <span>*</span>
                </label>

                <input
                  value={flagKey}
                  onChange={(e) =>
                    setFlagKey(
                      e.target.value
                    )
                  }
                  placeholder="e.g. dark_mode"
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  Environment
                </label>

                <select
                  value={environmentId}
                  onChange={(e) =>
                    setEnvironmentId(
                      e.target.value
                    )
                  }
                >
                  {environments.length > 0 ? (
                    environments.map((env) => (
                      <option
                        key={env.id}
                        value={env.id}
                      >
                        {env.name}
                      </option>
                    ))
                  ) : (
                    <option value={environmentId}>
                      Environment #{environmentId}
                    </option>
                  )}
                </select>
              </div>

              <div className="form-field">

                <label>
                  User ID
                  <span className="optional">
                    Optional
                  </span>
                </label>

                <input
                  value={userId}
                  onChange={(e) =>
                    setUserId(
                      e.target.value
                    )
                  }
                  placeholder="e.g. user_123"
                />

                <small>
                  User context can affect targeting
                  rules.
                </small>

              </div>

              <button
                type="submit"
                className="evaluate-button"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Evaluating..."
                    : "Evaluate Feature"}
                </span>

                {!loading && <span>→</span>}
              </button>

            </form>

          </div>

          {/* Result */}

          <div
            className={`evaluation-result ${
              result
                ? "has-result"
                : ""
            }`}
          >

            {!result ? (

              <div className="result-placeholder">

                <div className="result-placeholder-icon">
                  ◎
                </div>

                <h3>
                  Ready to evaluate
                </h3>

                <p>
                  Run an evaluation to see the
                  resolved feature flag status,
                  reason and context.
                </p>

                <div className="result-flow">
                  <span>Flag</span>
                  <b>→</b>
                  <span>Rules</span>
                  <b>→</b>
                  <span>Result</span>
                </div>

              </div>

            ) : (

              <div className="result-content">

                <div className="result-header">

                  <div>
                    <div className="workspace-eyebrow">
                      EVALUATION RESULT
                    </div>

                    <h2>
                      {result.flag_key}
                    </h2>
                  </div>

                  <div
                    className={
                      result.enabled
                        ? "result-icon success"
                        : "result-icon disabled"
                    }
                  >
                    {result.enabled
                      ? "✓"
                      : "×"}
                  </div>

                </div>

                <div
                  className={
                    result.enabled
                      ? "big-status enabled"
                      : "big-status disabled"
                  }
                >
                  <span className="big-status-dot" />

                  <div>
                    <strong>
                      {result.enabled
                        ? "Feature Enabled"
                        : "Feature Disabled"}
                    </strong>

                    <span>
                      Evaluation completed
                      successfully.
                    </span>
                  </div>
                </div>

                <div className="result-details">

                  <div className="result-detail">
                    <span>Status</span>

                    <strong>
                      {result.enabled
                        ? "Enabled"
                        : "Disabled"}
                    </strong>
                  </div>

                  <div className="result-detail">
                    <span>Flag</span>

                    <strong>
                      {result.flag_key}
                    </strong>
                  </div>

                  <div className="result-detail full">
                    <span>Reason</span>

                    <strong>
                      {result.reason ||
                        "No reason provided"}
                    </strong>
                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

        <div className="workspace-footer">
          <span>
            Intelligent Feature Deployment
          </span>

          <span>
            Safe flag evaluation & testing
          </span>
        </div>

      </div>
    </div>
  );
}

export default EvaluateFlag;