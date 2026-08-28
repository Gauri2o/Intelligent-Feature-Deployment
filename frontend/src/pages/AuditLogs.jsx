import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get(
        "/audit-logs/audit/"
      );

      setLogs(response.data || []);
    } catch (err) {
      console.error(err);

      setError(
        "Failed to load audit logs. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    if (!query) return logs;

    return logs.filter((log) => {
      const action =
        log.action?.toLowerCase() || "";

      const flag =
        log.flag_key?.toLowerCase() || "";

      const user =
        log.user?.toLowerCase() || "";

      return (
        action.includes(query) ||
        flag.includes(query) ||
        user.includes(query)
      );
    });
  }, [logs, search]);

  const getActionClass = (action) => {
    const value =
      action?.toLowerCase() || "";

    if (
      value.includes("delete") ||
      value.includes("remove")
    ) {
      return "audit-action delete";
    }

    if (
      value.includes("create") ||
      value.includes("add")
    ) {
      return "audit-action create";
    }

    if (
      value.includes("update") ||
      value.includes("edit")
    ) {
      return "audit-action update";
    }

    if (value.includes("evaluat")) {
      return "audit-action evaluate";
    }

    return "audit-action default";
  };

  const getInitial = (user) => {
    return (
      user?.charAt(0)?.toUpperCase() ||
      "A"
    );
  };

  if (loading) {
    return (
      <div className="workspace-page">

        <div className="audit-loading-card">

          <div className="audit-spinner" />

          <h2>
            Loading Audit Logs
          </h2>

          <p>
            Fetching recent system activity...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="workspace-page">

      <div className="workspace-container">

        {/* Header */}

        <div className="workspace-header">

          <div>
            <div className="workspace-eyebrow">
              SYSTEM ACTIVITY
            </div>

            <h1>Audit Logs</h1>

            <p>
              Track feature changes, evaluations
              and important system activity.
            </p>
          </div>

          <div className="header-actions">

            <button
              onClick={() => fetchLogs(true)}
              disabled={refreshing}
              className="secondary-button"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <Link
              to="/flags"
              className="primary-button"
            >
              View Flags
            </Link>

          </div>

        </div>

        {error && (
          <div className="audit-error">
            <span>
              ⚠ {error}
            </span>

            <button
              onClick={() => fetchLogs()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats */}

        <div className="audit-stats-grid">

          <div className="audit-stat-card">
            <div className="audit-stat-icon blue">
              Σ
            </div>

            <div>
              <span>Total Activities</span>
              <strong>{logs.length}</strong>
            </div>
          </div>

          <div className="audit-stat-card">
            <div className="audit-stat-icon green">
              ✓
            </div>

            <div>
              <span>Visible Results</span>
              <strong>
                {filteredLogs.length}
              </strong>
            </div>
          </div>

          <div className="audit-stat-card">
            <div className="audit-stat-icon purple">
              ◷
            </div>

            <div>
              <span>System Tracking</span>
              <strong>Active</strong>
            </div>
          </div>

        </div>

        {/* Logs */}

        <div className="audit-card">

          <div className="audit-toolbar">

            <div>
              <h2>
                Activity History
              </h2>

              <span>
                {filteredLogs.length}{" "}
                {filteredLogs.length === 1
                  ? "activity"
                  : "activities"}
              </span>
            </div>

            <div className="audit-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search action, flag or user..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {filteredLogs.length === 0 ? (

            <div className="audit-empty">

              <div className="audit-empty-icon">
                ◌
              </div>

              <h3>
                {search
                  ? "No matching activity"
                  : "No activity found"}
              </h3>

              <p>
                {search
                  ? "Try a different search term."
                  : "System activity will appear here when actions are performed."}
              </p>

            </div>

          ) : (

            <div className="audit-table-wrapper">

              <table className="audit-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Action</th>
                    <th>Feature Flag</th>
                    <th>User</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredLogs.map((log) => (

                    <tr key={log.id}>

                      <td>
                        <span className="audit-id">
                          #{log.id}
                        </span>
                      </td>

                      <td>
                        <span
                          className={getActionClass(
                            log.action
                          )}
                        >
                          <span className="action-dot" />
                          {log.action ||
                            "Activity"}
                        </span>
                      </td>

                      <td>
                        <div className="audit-flag-cell">

                          <div className="audit-flag-icon">
                            F
                          </div>

                          <span>
                            {log.flag_key ||
                              "—"}
                          </span>

                        </div>
                      </td>

                      <td>
                        <div className="audit-user">

                          <div className="audit-avatar">
                            {getInitial(
                              log.user
                            )}
                          </div>

                          <span>
                            {log.user ||
                              "anonymous"}
                          </span>

                        </div>
                      </td>

                      <td>
                        <span className="audit-time">
                          {log.timestamp
                            ? new Date(
                                log.timestamp
                              ).toLocaleString()
                            : "—"}
                        </span>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

        <div className="workspace-footer">
          <span>
            Intelligent Feature Deployment
          </span>

          <span>
            Audit & Activity Tracking
          </span>
        </div>

      </div>

    </div>
  );
}

export default AuditLogs;