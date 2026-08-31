import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function Analytics() {
  const [flags, setFlags] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [logs, setLogs] = useState([]);

  const [environmentId, setEnvironmentId] = useState(
    localStorage.getItem("environment_id") || ""
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, [environmentId]);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = {};

      if (environmentId) {
        params.environment_id = Number(environmentId);
      }

      const [
        flagsResponse,
        environmentsResponse,
        logsResponse,
      ] = await Promise.all([
        api.get("/flags/"),
        api.get("/environments/"),
        api.get("/audit-logs/audit/", {
          params,
        }),
      ]);

      setFlags(
        Array.isArray(flagsResponse.data)
          ? flagsResponse.data
          : []
      );

      setEnvironments(
        Array.isArray(environmentsResponse.data)
          ? environmentsResponse.data
          : []
      );

      setLogs(
        Array.isArray(logsResponse.data)
          ? logsResponse.data
          : []
      );
    } catch (err) {
      console.error("Analytics load failed:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     ENVIRONMENT FILTER
  ========================================================= */

  const scopedFlags = useMemo(() => {
    if (!environmentId) {
      return flags;
    }

    return flags.filter(
      (flag) =>
        Number(flag.environment_id) ===
        Number(environmentId)
    );
  }, [flags, environmentId]);

  /* =========================================================
     KPI METRICS
  ========================================================= */

  const metrics = useMemo(() => {
    const total = scopedFlags.length;

    const enabled = scopedFlags.filter(
      (flag) => Boolean(flag.enabled)
    ).length;

    const disabled = total - enabled;

    const rolloutFlags = scopedFlags.filter(
      (flag) =>
        Number(flag.rollout_percentage || 0) > 0
    );

    const averageRollout =
      rolloutFlags.length > 0
        ? Math.round(
            rolloutFlags.reduce(
              (sum, flag) =>
                sum +
                Number(
                  flag.rollout_percentage || 0
                ),
              0
            ) / rolloutFlags.length
          )
        : 0;

    const evaluationLogs = logs.filter((log) =>
      String(log.action || "")
        .toUpperCase()
        .includes("EVALUAT")
    );

    const changeLogs = logs.filter(
      (log) =>
        !String(log.action || "")
          .toUpperCase()
          .includes("EVALUAT")
    );

    return {
      total,
      enabled,
      disabled,
      rolloutFlags: rolloutFlags.length,
      averageRollout,
      evaluations: evaluationLogs.length,
      changes: changeLogs.length,
      enabledPercent:
        total > 0
          ? Math.round((enabled / total) * 100)
          : 0,
    };
  }, [scopedFlags, logs]);

  /* =========================================================
     ACTIVITY - LAST 7 DAYS
  ========================================================= */

  const activity = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      days.push({
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString(
          undefined,
          { weekday: "short" }
        ),
        count: 0,
      });
    }

    logs.forEach((log) => {
      const date = new Date(
        log.timestamp || log.created_at
      );

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = date
        .toISOString()
        .slice(0, 10);

      const day = days.find(
        (item) => item.key === key
      );

      if (day) {
        day.count += 1;
      }
    });

    return days;
  }, [logs]);

  const maxActivity = Math.max(
    1,
    ...activity.map((item) => item.count)
  );

  /* =========================================================
     TOP EVALUATED FLAGS
  ========================================================= */

  const topEvaluatedFlags = useMemo(() => {
    const counts = {};

    logs
      .filter((log) =>
        String(log.action || "")
          .toUpperCase()
          .includes("EVALUAT")
      )
      .forEach((log) => {
        const key =
          log.flag_key || "Unknown";

        counts[key] =
          (counts[key] || 0) + 1;
      });

    return Object.entries(counts)
      .map(([flag, count]) => ({
        flag,
        count,
      }))
      .sort(
        (a, b) => b.count - a.count
      )
      .slice(0, 6);
  }, [logs]);

  const maxEvaluations = Math.max(
    1,
    ...topEvaluatedFlags.map(
      (item) => item.count
    )
  );

  /* =========================================================
     ROLLOUT DISTRIBUTION
  ========================================================= */

  const rolloutDistribution = useMemo(() => {
    const result = [
      {
        label: "Disabled / 0%",
        count: 0,
      },
      {
        label: "1–25%",
        count: 0,
      },
      {
        label: "26–50%",
        count: 0,
      },
      {
        label: "51–99%",
        count: 0,
      },
      {
        label: "100%",
        count: 0,
      },
    ];

    scopedFlags.forEach((flag) => {
      const rollout = Number(
        flag.rollout_percentage || 0
      );

      if (rollout === 0) {
        result[0].count++;
      } else if (rollout <= 25) {
        result[1].count++;
      } else if (rollout <= 50) {
        result[2].count++;
      } else if (rollout < 100) {
        result[3].count++;
      } else {
        result[4].count++;
      }
    });

    return result;
  }, [scopedFlags]);

  const environmentName =
    environments.find(
      (env) =>
        Number(env.id) ===
        Number(environmentId)
    )?.name || "All environments";

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingCard}>
          <div style={spinner} />

          <h2 style={{ margin: 0 }}>
            Loading Analytics...
          </h2>

          <p style={muted}>
            Aggregating feature flag activity.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div style={pageStyle}>
      <style>
        {`
          @keyframes analyticsSpin {
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 900px) {
            .analytics-two-column {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <div style={containerStyle}>

        {/* HEADER */}

        <header style={headerStyle}>

          <div>
            <div style={eyebrow}>
              OBSERVABILITY
            </div>

            <h1 style={title}>
              Analytics
            </h1>

            <p style={subtitle}>
              Understand flag adoption, rollout
              coverage and recent deployment
              activity.
            </p>
          </div>

          <div style={headerActions}>

            <div style={filterGroup}>
              <label style={filterLabel}>
                Environment
              </label>

              <select
                value={environmentId}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setEnvironmentId(value);

                  if (value) {
                    localStorage.setItem(
                      "environment_id",
                      value
                    );

                    const environment =
                      environments.find(
                        (env) =>
                          String(env.id) ===
                          String(value)
                      );

                    if (environment) {
                      localStorage.setItem(
                        "environment",
                        environment.name
                      );
                    }
                  }
                }}
                style={selectStyle}
              >
                <option value="">
                  All environments
                </option>

                {environments.map(
                  (environment) => (
                    <option
                      key={environment.id}
                      value={environment.id}
                    >
                      {environment.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              style={secondaryButton}
              onClick={() =>
                fetchAnalytics(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

          </div>
        </header>

        {/* ERROR */}

        {error && (
          <div style={errorBox}>
            <span>⚠ {error}</span>

            <button
              onClick={() => fetchAnalytics()}
              style={retryButton}
            >
              Retry
            </button>
          </div>
        )}

        {/* SCOPE */}

        <div style={scope}>
          <span style={scopeDot} />

          Viewing{" "}
          <strong>
            {environmentName}
          </strong>
        </div>

        {/* KPI CARDS */}

        <section style={metricGrid}>

          <MetricCard
            icon="⚡"
            tone="blue"
            label="Total Flags"
            value={metrics.total}
            detail={`${metrics.enabledPercent}% currently enabled`}
          />

          <MetricCard
            icon="↗"
            tone="green"
            label="Rollout Flags"
            value={metrics.rolloutFlags}
            detail={`Average rollout ${metrics.averageRollout}%`}
          />

          <MetricCard
            icon="◎"
            tone="purple"
            label="Evaluations"
            value={metrics.evaluations}
            detail="Recorded evaluation events"
          />

          <MetricCard
            icon="◷"
            tone="orange"
            label="Changes"
            value={metrics.changes}
            detail="Recent audit activity"
          />

        </section>

        {/* CHARTS */}

        <section
          className="analytics-two-column"
          style={chartGrid}
        >

          {/* ACTIVITY */}

          <ChartCard
            title="Activity Trend"
            subtitle="Audit activity over the last 7 days"
          >
            <div style={activityChart}>

              {activity.map((day) => (
                <div
                  key={day.key}
                  style={activityColumn}
                >
                  <span style={activityValue}>
                    {day.count}
                  </span>

                  <div style={activityTrack}>
                    <div
                      style={{
                        ...activityBar,
                        height: `${Math.max(
                          day.count > 0
                            ? 8
                            : 2,
                          (day.count /
                            maxActivity) *
                            100
                        )}%`,
                      }}
                    />
                  </div>

                  <span style={activityLabel}>
                    {day.label}
                  </span>
                </div>
              ))}

            </div>
          </ChartCard>

          {/* ROLLOUT DISTRIBUTION */}

          <ChartCard
            title="Rollout Distribution"
            subtitle="Current percentage rollout coverage"
          >
            <div style={list}>

              {rolloutDistribution.map(
                (item) => {
                  const percentage =
                    scopedFlags.length
                      ? Math.round(
                          (item.count /
                            scopedFlags.length) *
                            100
                        )
                      : 0;

                  return (
                    <div key={item.label}>

                      <div style={rowTop}>
                        <span>
                          {item.label}
                        </span>

                        <strong>
                          {item.count}
                        </strong>
                      </div>

                      <div style={track}>
                        <div
                          style={{
                            ...bar,
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                    </div>
                  );
                }
              )}

            </div>
          </ChartCard>

        </section>

        {/* LOWER SECTION */}

        <section
          className="analytics-two-column"
          style={lowerGrid}
        >

          {/* TOP FLAGS */}

          <ChartCard
            title="Most Evaluated Flags"
            subtitle="Based on FLAG_EVALUATION audit entries"
          >
            {topEvaluatedFlags.length === 0 ? (
              <EmptyState
                text="No evaluation activity recorded yet."
              />
            ) : (
              <div style={list}>

                {topEvaluatedFlags.map(
                  (item) => (
                    <div
                      key={item.flag}
                      style={evaluationRow}
                    >

                      <div style={flagName}>
                        <span style={flagIcon}>
                          ⚑
                        </span>

                        <span>
                          {item.flag}
                        </span>
                      </div>

                      <div style={evaluationMeter}>

                        <div style={track}>
                          <div
                            style={{
                              ...bar,
                              width: `${
                                (item.count /
                                  maxEvaluations) *
                                100
                              }%`,
                            }}
                          />
                        </div>

                        <strong>
                          {item.count}
                        </strong>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}
          </ChartCard>

          {/* FLAG HEALTH */}

          <ChartCard
            title="Flag Health"
            subtitle="Current configuration state"
          >

            <HealthRow
              label="Enabled"
              value={metrics.enabled}
              total={metrics.total}
            />

            <HealthRow
              label="Disabled"
              value={metrics.disabled}
              total={metrics.total}
            />

            <HealthRow
              label="100% rollout"
              value={
                scopedFlags.filter(
                  (flag) =>
                    Number(
                      flag.rollout_percentage || 0
                    ) === 100
                ).length
              }
              total={metrics.total}
            />

            <HealthRow
              label="Partial rollout"
              value={
                scopedFlags.filter(
                  (flag) => {
                    const rollout =
                      Number(
                        flag.rollout_percentage ||
                          0
                      );

                    return (
                      rollout > 0 &&
                      rollout < 100
                    );
                  }
                ).length
              }
              total={metrics.total}
            />

          </ChartCard>

        </section>

        {/* RECENT ACTIVITY */}

        <ChartCard
          title="Recent Activity"
          subtitle="Latest audit events"
        >

          {!logs.length ? (
            <EmptyState
              text="No audit activity available."
            />
          ) : (
            <div>

              {logs
                .slice(0, 8)
                .map((log) => {

                  const evaluation =
                    String(
                      log.action || ""
                    )
                      .toUpperCase()
                      .includes("EVALUAT");

                  return (
                    <div
                      key={log.id}
                      style={recentRow}
                    >

                      <div style={recentIcon}>
                        {evaluation
                          ? "◎"
                          : "↗"}
                      </div>

                      <div style={recentMain}>
                        <strong>
                          {formatAction(
                            log.action
                          )}
                        </strong>

                        <span>
                          {log.flag_key ||
                            "System activity"}
                        </span>
                      </div>

                      <div style={recentMeta}>
                        <span>
                          {log.user ||
                            "system"}
                        </span>

                        <time>
                          {formatTime(
                            log.timestamp
                          )}
                        </time>
                      </div>

                    </div>
                  );
                })}

            </div>
          )}

        </ChartCard>

      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function MetricCard({
  icon,
  tone,
  label,
  value,
  detail,
}) {
  const toneMap = {
    blue: ["#eff6ff", "#2563eb"],
    green: ["#ecfdf5", "#16a34a"],
    purple: ["#f5f3ff", "#7c3aed"],
    orange: ["#fff7ed", "#ea580c"],
  };

  const [background, color] =
    toneMap[tone];

  return (
    <div style={metricCard}>
      <div
        style={{
          ...metricIcon,
          background,
          color,
        }}
      >
        {icon}
      </div>

      <div>
        <span style={metricLabel}>
          {label}
        </span>

        <strong style={metricValue}>
          {value}
        </strong>

        <span style={metricDetail}>
          {detail}
        </span>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}) {
  return (
    <div style={card}>
      <h2 style={cardTitle}>
        {title}
      </h2>

      <p style={cardSubtitle}>
        {subtitle}
      </p>

      {children}
    </div>
  );
}

function HealthRow({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (
    <div style={healthRow}>

      <div style={rowTop}>
        <span>{label}</span>

        <strong>
          {value}{" "}
          <small>
            ({percentage}%)
          </small>
        </strong>
      </div>

      <div style={track}>
        <div
          style={{
            ...bar,
            width: `${percentage}%`,
          }}
        />
      </div>

    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={emptyState}>
      <div style={emptyIcon}>
        ◎
      </div>

      <p>{text}</p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatAction(action) {
  if (!action) {
    return "System activity";
  }

  return String(action)
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

function formatTime(value) {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

/* =========================================================
   STYLES
========================================================= */

const pageStyle = {
  minHeight: "100vh",
  background: "#f8fafc",
  color: "#0f172a",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const containerStyle = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "42px 28px 70px",
};

const headerStyle = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "24px",
  marginBottom: "22px",
  flexWrap: "wrap",
};

const eyebrow = {
  color: "#7c3aed",
  fontSize: "10px",
  fontWeight: "900",
  letterSpacing: "1.6px",
  marginBottom: "7px",
};

const title = {
  margin: 0,
  fontSize: "34px",
  lineHeight: "1.1",
  letterSpacing: "-1.2px",
};

const subtitle = {
  margin: "10px 0 0",
  maxWidth: "640px",
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "1.65",
};

const headerActions = {
  display: "flex",
  alignItems: "flex-end",
  gap: "10px",
  flexWrap: "wrap",
};

const filterGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const filterLabel = {
  color: "#64748b",
  fontSize: "10px",
  fontWeight: "800",
  textTransform: "uppercase",
};

const selectStyle = {
  minWidth: "190px",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  background: "white",
  color: "#334155",
  fontSize: "13px",
};

const secondaryButton = {
  padding: "10px 14px",
  borderRadius: "9px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#475569",
  fontSize: "12px",
  fontWeight: "800",
  cursor: "pointer",
};

const scope = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  width: "fit-content",
  padding: "7px 11px",
  marginBottom: "16px",
  border: "1px solid #e2e8f0",
  borderRadius: "999px",
  background: "white",
  color: "#64748b",
  fontSize: "11px",
};

const scopeDot = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#8b5cf6",
};

const metricGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(210px,1fr))",
  gap: "12px",
  marginBottom: "14px",
};

const metricCard = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  padding: "18px",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  background: "white",
};

const metricIcon = {
  width: "38px",
  height: "38px",
  flexShrink: 0,
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const metricLabel = {
  display: "block",
  color: "#64748b",
  fontSize: "11px",
  fontWeight: "700",
};

const metricValue = {
  display: "block",
  marginTop: "2px",
  fontSize: "25px",
};

const metricDetail = {
  display: "block",
  marginTop: "5px",
  color: "#94a3b8",
  fontSize: "10px",
};

const chartGrid = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0,1.45fr) minmax(320px,1fr)",
  gap: "14px",
  marginBottom: "14px",
};

const lowerGrid = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0,1.25fr) minmax(320px,.75fr)",
  gap: "14px",
  marginBottom: "14px",
};

const card = {
  minWidth: 0,
  padding: "19px",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  background: "white",
  boxShadow:
    "0 2px 7px rgba(15,23,42,.025)",
};

const cardTitle = {
  margin: 0,
  fontSize: "15px",
  fontWeight: "800",
};

const cardSubtitle = {
  margin: "5px 0 18px",
  color: "#94a3b8",
  fontSize: "10px",
};

const activityChart = {
  height: "230px",
  display: "flex",
  alignItems: "stretch",
  gap: "12px",
};

const activityColumn = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const activityValue = {
  height: "20px",
  color: "#64748b",
  fontSize: "9px",
  fontWeight: "800",
};

const activityTrack = {
  flex: 1,
  width: "100%",
  maxWidth: "32px",
  display: "flex",
  alignItems: "flex-end",
  background: "#f1f5f9",
  borderRadius:
    "7px 7px 3px 3px",
  overflow: "hidden",
};

const activityBar = {
  width: "100%",
  minHeight: "2px",
  background: "#8b5cf6",
  borderRadius:
    "7px 7px 0 0",
};

const activityLabel = {
  marginTop: "8px",
  color: "#94a3b8",
  fontSize: "9px",
};

const list = {
  display: "grid",
  gap: "16px",
};

const rowTop = {
  display: "flex",
  justifyContent: "space-between",
  color: "#475569",
  fontSize: "11px",
};

const track = {
  height: "7px",
  overflow: "hidden",
  borderRadius: "999px",
  background: "#f1f5f9",
  marginTop: "7px",
};

const bar = {
  height: "100%",
  borderRadius: "999px",
  background: "#8b5cf6",
};

const evaluationRow = {
  display: "grid",
  gridTemplateColumns:
    "minmax(130px,.8fr) minmax(150px,1.2fr)",
  gap: "15px",
  alignItems: "center",
};

const flagName = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  minWidth: 0,
  color: "#334155",
  fontSize: "11px",
  fontWeight: "700",
};

const flagIcon = {
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "7px",
  background: "#f5f3ff",
  color: "#7c3aed",
};

const evaluationMeter = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
};

const healthRow = {
  display: "grid",
  gap: "7px",
  marginBottom: "17px",
};

const recentRow = {
  display: "grid",
  gridTemplateColumns:
    "32px minmax(0,1fr) auto",
  alignItems: "center",
  gap: "11px",
  padding: "12px 0",
  borderTop:
    "1px solid #f1f5f9",
};

const recentIcon = {
  width: "30px",
  height: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  background: "#f5f3ff",
  color: "#7c3aed",
};

const recentMain = {
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  fontSize: "11px",
};

const recentMeta = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "3px",
  color: "#94a3b8",
  fontSize: "9px",
};

const loadingCard = {
  maxWidth: "420px",
  margin: "100px auto",
  padding: "34px",
  textAlign: "center",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  background: "white",
};

const spinner = {
  width: "28px",
  height: "28px",
  margin: "0 auto 15px",
  border:
    "3px solid #ede9fe",
  borderTopColor: "#7c3aed",
  borderRadius: "50%",
  animation:
    "analyticsSpin .8s linear infinite",
};

const muted = {
  color: "#94a3b8",
  fontSize: "12px",
};

const errorBox = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "15px",
  padding: "11px 13px",
  border:
    "1px solid #fecaca",
  borderRadius: "9px",
  background: "#fef2f2",
  color: "#991b1b",
  fontSize: "11px",
};

const retryButton = {
  border: 0,
  background: "transparent",
  color: "#991b1b",
  fontWeight: "800",
  cursor: "pointer",
};

const emptyState = {
  minHeight: "110px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
  textAlign: "center",
  fontSize: "11px",
};

const emptyIcon = {
  fontSize: "25px",
  color: "#c4b5fd",
};

export default Analytics;