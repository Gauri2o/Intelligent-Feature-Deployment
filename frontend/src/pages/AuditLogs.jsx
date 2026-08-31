import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";


function AuditLogs() {

  // =========================================================
  // STATE
  // =========================================================

  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [actorFilter, setActorFilter] = useState("");

  const [flagFilter, setFlagFilter] = useState("");

  const [environmentFilter, setEnvironmentFilter] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [error, setError] = useState("");

  const [selectedLog, setSelectedLog] = useState(null);


  // =========================================================
  // FETCH LOGS
  // =========================================================

  useEffect(() => {
    fetchLogs();
  }, []);


  const fetchLogs = async (
    isRefresh = false,
    overrideFilters = null
  ) => {

    try {

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");


      // -------------------------------------------------------
      // Use current state OR explicitly supplied filters
      // -------------------------------------------------------

      const filters = overrideFilters || {
        user: actorFilter.trim(),
        flag_key: flagFilter.trim(),
        environment_id: environmentFilter
          ? Number(environmentFilter)
          : null,
        start_date: startDate,
        end_date: endDate,
      };


      // -------------------------------------------------------
      // Build API params
      // -------------------------------------------------------

      const params = {};


      if (filters.user) {

        params.user = filters.user;

      }


      if (filters.flag_key) {

        params.flag_key = filters.flag_key;

      }


      if (
        filters.environment_id !== null &&
        filters.environment_id !== undefined
      ) {

        params.environment_id =
          Number(filters.environment_id);

      }


      if (filters.start_date) {

        params.start_date =
          filters.start_date;

      }


      if (filters.end_date) {

        params.end_date =
          filters.end_date;

      }


      console.log(
        "AUDIT LOG FILTER PARAMS:",
        params
      );


      // -------------------------------------------------------
      // API
      // -------------------------------------------------------

      const response = await api.get(
        "/audit-logs/audit/",
        {
          params,
        }
      );


      setLogs(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to fetch audit logs:",
        err
      );

      setError(
        "Failed to load audit logs. Please try again."
      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };


  // =========================================================
  // APPLY FILTERS
  // =========================================================

  const handleApplyFilters = () => {

    fetchLogs(false);

  };


  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const handleClearFilters = () => {

    const emptyFilters = {

      user: "",

      flag_key: "",

      environment_id: null,

      start_date: "",

      end_date: "",

    };


    setSearch("");

    setActorFilter("");

    setFlagFilter("");

    setEnvironmentFilter("");

    setStartDate("");

    setEndDate("");


    // Important:
    // Fetch using cleared values immediately.
    // Do not depend on asynchronous React state updates.

    fetchLogs(
      false,
      emptyFilters
    );

  };


  // =========================================================
  // MODAL ESCAPE / SCROLL LOCK
  // =========================================================

  useEffect(() => {

    if (!selectedLog) {

      document.body.style.overflow = "";

      return;

    }


    document.body.style.overflow = "hidden";


    const handleKeyDown = (event) => {

      if (event.key === "Escape") {

        setSelectedLog(null);

      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      document.body.style.overflow = "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [selectedLog]);


  // =========================================================
  // LOCAL SEARCH
  // =========================================================

  const filteredLogs = useMemo(() => {

    const query =
      search.toLowerCase().trim();


    if (!query) {

      return logs;

    }


    return logs.filter((log) => {

      const action =
        log.action?.toLowerCase() || "";


      const flag =
        log.flag_key?.toLowerCase() || "";


      const user =
        log.user?.toLowerCase() || "";


      const environment =
        log.environment_id
          ? String(log.environment_id)
          : "";


      return (

        action.includes(query) ||

        flag.includes(query) ||

        user.includes(query) ||

        environment.includes(query)

      );

    });

  }, [logs, search]);


  // =========================================================
  // ACTIVE FILTER CHECK
  // =========================================================

  const hasActiveFilters =
    Boolean(
      search ||
      actorFilter ||
      flagFilter ||
      environmentFilter ||
      startDate ||
      endDate
    );


  // =========================================================
  // ACTION CLASS
  // =========================================================

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
      value.includes("enable")
    ) {

      return "audit-action create";

    }


    if (
      value.includes("disable")
    ) {

      return "audit-action delete";

    }


    if (
      value.includes("update") ||
      value.includes("edit")
    ) {

      return "audit-action update";

    }


    if (
      value.includes("evaluat")
    ) {

      return "audit-action evaluate";

    }


    return "audit-action default";

  };


  // =========================================================
  // INITIAL
  // =========================================================

  const getInitial = (user) => {

    return (

      user?.charAt(0)?.toUpperCase() ||

      "A"

    );

  };


  // =========================================================
  // PARSE AUDIT VALUE
  // =========================================================

  const parseAuditValue = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      return null;

    }


    if (
      typeof value === "object"
    ) {

      return value;

    }


    if (
      typeof value !== "string"
    ) {

      return value;

    }


    let parsed = value;


    for (let i = 0; i < 3; i++) {

      if (
        typeof parsed !== "string"
      ) {

        break;

      }


      const trimmed =
        parsed.trim();


      if (!trimmed) {

        return null;

      }


      try {

        const next =
          JSON.parse(trimmed);


        parsed = next;

      } catch {

        break;

      }

    }


    return parsed;

  };


  // =========================================================
  // FORMAT VALUE
  // =========================================================

  const formatValue = (value) => {

    if (
      value === null ||
      value === undefined
    ) {

      return "—";

    }


    if (
      typeof value === "boolean"
    ) {

      return value
        ? "true"
        : "false";

    }


    if (
      typeof value === "object"
    ) {

      return JSON.stringify(
        value,
        null,
        2
      );

    }


    return String(value);

  };


  // =========================================================
  // FORMAT FIELD NAME
  // =========================================================

  const formatFieldName = (field) => {

    return field
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
      );

  };


  // =========================================================
  // GET CHANGED FIELDS
  // =========================================================

  const getChangedFields = (log) => {

    const before =
      parseAuditValue(
        log?.before_value
      );


    const after =
      parseAuditValue(
        log?.after_value
      );


    if (
      !before ||
      !after ||
      typeof before !== "object" ||
      typeof after !== "object" ||
      Array.isArray(before) ||
      Array.isArray(after)
    ) {

      return [];

    }


    const allKeys =
      Array.from(
        new Set([
          ...Object.keys(before),
          ...Object.keys(after),
        ])
      );


    return allKeys
      .filter((key) => {

        return (

          JSON.stringify(
            before[key]
          ) !==

          JSON.stringify(
            after[key]
          )

        );

      })
      .map((key) => ({

        key,

        before: before[key],

        after: after[key],

      }));

  };


  // =========================================================
  // DIFF INFORMATION
  // =========================================================

  const getDiffInfo = (log) => {

    const action =
      log?.action?.toUpperCase() || "";


    const before =
      parseAuditValue(
        log?.before_value
      );


    const after =
      parseAuditValue(
        log?.after_value
      );


    const changedFields =
      getChangedFields(log);


    // -------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------

    if (
      action === "UPDATE_FLAG"
    ) {

      if (
        changedFields.length > 0
      ) {

        return {

          type: "changes",

          title: "Changed Fields",

          subtitle:
            changedFields.length === 1
              ? "1 field changed"
              : `${changedFields.length} fields changed`,

          fields: changedFields,

        };

      }


      return {

        type: "info",

        title: "Change Information",

        message:
          "No field-level changes were detected.",

      };

    }


    // -------------------------------------------------------
    // ENABLE
    // -------------------------------------------------------

    if (
      action === "ENABLE_FLAG"
    ) {

      return {

        type: "changes",

        title: "Flag Enabled",

        subtitle:
          "The feature flag was enabled.",

        fields: [

          {

            key: "enabled",

            before:
              before?.enabled,

            after:
              after?.enabled,

          }

        ],

      };

    }


    // -------------------------------------------------------
    // DISABLE
    // -------------------------------------------------------

    if (
      action === "DISABLE_FLAG"
    ) {

      return {

        type: "changes",

        title: "Flag Disabled",

        subtitle:
          "The feature flag was disabled.",

        fields: [

          {

            key: "enabled",

            before:
              before?.enabled,

            after:
              after?.enabled,

          }

        ],

      };

    }


    // -------------------------------------------------------
    // CREATE FLAG
    // -------------------------------------------------------

    if (
      action === "CREATE_FLAG"
    ) {

      return {

        type: "created",

        title: "Flag Created",

        message:
          "This feature flag was created with the following configuration.",

        after,

      };

    }


    // -------------------------------------------------------
    // DELETE FLAG
    // -------------------------------------------------------

    if (
      action === "DELETE_FLAG"
    ) {

      return {

        type: "deleted",

        title: "Flag Deleted",

        message:
          "This feature flag was deleted. The previous configuration is shown below.",

        before,

      };

    }


    // -------------------------------------------------------
    // ADD TARGETING RULE
    // -------------------------------------------------------

    if (
      action === "ADD_TARGETING_RULE"
    ) {

      return {

        type: "created",

        title: "Targeting Rule Added",

        message:
          "The following targeting rule was added.",

        after,

      };

    }


    // -------------------------------------------------------
    // DELETE TARGETING RULE
    // -------------------------------------------------------

    if (
      action === "DELETE_TARGETING_RULE"
    ) {

      return {

        type: "deleted",

        title: "Targeting Rule Deleted",

        message:
          "The following targeting rule was removed.",

        before,

      };

    }


    // -------------------------------------------------------
    // EVALUATE
    // -------------------------------------------------------

    if (
      action.includes("EVALUATE")
    ) {

      return {

        type: "evaluation",

        title: "Flag Evaluation",

        message:
          "This audit entry records a feature flag evaluation. There is no configuration diff for this action.",

      };

    }


    // -------------------------------------------------------
    // DEFAULT
    // -------------------------------------------------------

    return {

      type: "info",

      title: "Activity Information",

      message:
        "No before/after configuration data is available for this audit entry.",

    };

  };


  // =========================================================
  // LOADING
  // =========================================================

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


  // =========================================================
  // MAIN
  // =========================================================

  return (

    <div className="workspace-page">

      <div className="workspace-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="workspace-header">

          <div>

            <div className="workspace-eyebrow">
              SYSTEM ACTIVITY
            </div>

            <h1>
              Audit Logs
            </h1>

            <p>
              Track feature changes,
              targeting rules and
              important system activity.
            </p>

          </div>


          <div className="header-actions">

            <button
              onClick={() =>
                fetchLogs(true)
              }
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


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="audit-error">

            <span>
              ⚠ {error}
            </span>

            <button
              onClick={() =>
                fetchLogs()
              }
            >
              Retry
            </button>

          </div>

        )}


        {/* =================================================
            FILTERS
        ================================================= */}

        <div
          className="audit-card"
          style={{
            marginBottom: "20px"
          }}
        >

          <div
            style={{
              padding: "20px"
            }}
          >

            <div
              className="workspace-eyebrow"
              style={{
                marginBottom: "8px"
              }}
            >
              FILTERS
            </div>


            <h2
              style={{
                marginTop: 0,
                marginBottom: "18px"
              }}
            >
              Audit Activity Filters
            </h2>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "14px"
              }}
            >

              {/* Actor */}

              <div>

                <label>
                  Actor / User
                </label>

                <input
                  type="text"
                  placeholder="e.g. admin"
                  value={actorFilter}
                  onChange={(e) =>
                    setActorFilter(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    marginTop: "6px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #cbd5e1"
                  }}
                />

              </div>


              {/* Flag */}

              <div>

                <label>
                  Feature Flag
                </label>

                <input
                  type="text"
                  placeholder="e.g. dark_mode"
                  value={flagFilter}
                  onChange={(e) =>
                    setFlagFilter(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    marginTop: "6px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #cbd5e1"
                  }}
                />

              </div>


              {/* Environment */}

              <div>

                <label>
                  Environment
                </label>

                <select
                  value={environmentFilter}
                  onChange={(e) =>
                    setEnvironmentFilter(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    marginTop: "6px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #cbd5e1",
                    background:
                      "#ffffff"
                  }}
                >

                  <option value="">
                    All Environments
                  </option>

                  <option value="1">
                    Development
                  </option>

                  <option value="2">
                    Staging
                  </option>

                  <option value="3">
                    Production
                  </option>

                </select>

              </div>


              {/* Start Date */}

              <div>

                <label>
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    marginTop: "6px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #cbd5e1"
                  }}
                />

              </div>


              {/* End Date */}

              <div>

                <label>
                  End Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    marginTop: "6px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #cbd5e1"
                  }}
                />

              </div>

            </div>


            {/* Filter buttons */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "16px",
                flexWrap: "wrap"
              }}
            >

              <button
                className="primary-button"
                onClick={
                  handleApplyFilters
                }
              >
                Apply Filters
              </button>


              <button
                className="secondary-button"
                onClick={
                  handleClearFilters
                }
              >
                Clear Filters
              </button>

            </div>

          </div>

        </div>


        {/* =================================================
            STATS
        ================================================= */}

        <div className="audit-stats-grid">

          <div className="audit-stat-card">

            <div className="audit-stat-icon blue">
              Σ
            </div>

            <div>

              <span>
                Total Activities
              </span>

              <strong>
                {logs.length}
              </strong>

            </div>

          </div>


          <div className="audit-stat-card">

            <div className="audit-stat-icon green">
              ✓
            </div>

            <div>

              <span>
                Visible Results
              </span>

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

              <span>
                System Tracking
              </span>

              <strong>
                Active
              </strong>

            </div>

          </div>

        </div>


        {/* =================================================
            AUDIT CARD
        ================================================= */}

        <div className="audit-card">


          {/* Toolbar */}

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


            {/* Search */}

            <div className="audit-search">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search action, flag, user or environment..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredLogs.length === 0 ? (

            <div className="audit-empty">

              <div className="audit-empty-icon">
                ◌
              </div>

              <h3>

                {hasActiveFilters
                  ? "No matching activity"
                  : "No activity found"}

              </h3>

              <p>

                {hasActiveFilters
                  ? "Try changing your filters."
                  : "System activity will appear here when actions are performed."}

              </p>

            </div>

          ) : (

            <div className="audit-table-wrapper">

              <table className="audit-table">

                <thead>

                  <tr>

                    <th>
                      Timestamp
                    </th>

                    <th>
                      Actor
                    </th>

                    <th>
                      Feature Flag
                    </th>

                    <th>
                      Action
                    </th>

                    <th>
                      Environment
                    </th>

                    <th>
                      View Diff
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredLogs.map(
                    (log) => (

                      <tr
                        key={log.id}
                      >

                        {/* Timestamp */}

                        <td>

                          <span className="audit-time">

                            {log.timestamp
                              ? new Date(
                                  log.timestamp
                                ).toLocaleString()
                              : "—"}

                          </span>

                        </td>


                        {/* Actor */}

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


                        {/* Flag */}

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


                        {/* Action */}

                        <td>

                          <span
                            className={
                              getActionClass(
                                log.action
                              )
                            }
                          >

                            <span className="action-dot" />

                            {log.action ||
                              "Activity"}

                          </span>

                        </td>


                        {/* Environment */}

                        <td>

                          {log.environment_id
                            ? `#${log.environment_id}`
                            : "—"}

                        </td>


                        {/* Diff */}

                        <td>

                          <button
                            className="view-diff-button"
                            onClick={() =>
                              setSelectedLog(
                                log
                              )
                            }
                          >
                            View Diff
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="workspace-footer">

          <span>
            Intelligent Feature Deployment
          </span>

          <span>
            Audit & Activity Tracking
          </span>

        </div>

      </div>


      {/* =====================================================
          MODAL
      ===================================================== */}

      {selectedLog && (

        <div
          className="audit-modal-overlay"
          onClick={() =>
            setSelectedLog(null)
          }
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            overflowY: "auto",
            background:
              "rgba(15, 23, 42, 0.62)",
            backdropFilter:
              "blur(6px)"
          }}
        >

          <div
            className="audit-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "900px",
              maxHeight:
                "calc(100vh - 48px)",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              boxShadow:
                "0 25px 70px rgba(15, 23, 42, 0.3)"
            }}
          >

            {/* Header */}

            <div
              className="audit-modal-header"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                background: "#ffffff"
              }}
            >

              <div>

                <div className="workspace-eyebrow">
                  AUDIT DETAILS
                </div>

                <h2>
                  Change Details
                </h2>

              </div>


              <button
                className="audit-modal-close"
                onClick={() =>
                  setSelectedLog(null)
                }
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {/* Body */}

            <div className="audit-modal-body">

              {/* Metadata */}

              <div
                className="audit-detail-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "12px",
                  marginBottom: "22px"
                }}
              >

                <div className="audit-detail-card">

                  <span>
                    TIMESTAMP
                  </span>

                  <strong>
                    {selectedLog.timestamp
                      ? new Date(
                          selectedLog.timestamp
                        ).toLocaleString()
                      : "—"}
                  </strong>

                </div>


                <div className="audit-detail-card">

                  <span>
                    ACTOR
                  </span>

                  <strong>
                    {selectedLog.user ||
                      "anonymous"}
                  </strong>

                </div>


                <div className="audit-detail-card">

                  <span>
                    FEATURE FLAG
                  </span>

                  <strong>
                    {selectedLog.flag_key ||
                      "—"}
                  </strong>

                </div>


                <div className="audit-detail-card">

                  <span>
                    ENVIRONMENT
                  </span>

                  <strong>
                    {selectedLog.environment_id
                      ? `#${selectedLog.environment_id}`
                      : "—"}
                  </strong>

                </div>


                <div className="audit-detail-card">

                  <span>
                    ACTION
                  </span>

                  <strong>

                    <span
                      className={
                        getActionClass(
                          selectedLog.action
                        )
                      }
                    >

                      <span className="action-dot" />

                      {selectedLog.action ||
                        "Activity"}

                    </span>

                  </strong>

                </div>

              </div>


              {/* =================================================
                  DIFF
              ================================================= */}

              {(() => {

                const diff =
                  getDiffInfo(
                    selectedLog
                  );


                return (

                  <div className="diff-section">

                    <div className="diff-section-header">

                      <div>

                        <h3>
                          {diff.title}
                        </h3>

                        {diff.subtitle && (

                          <span>
                            {diff.subtitle}
                          </span>

                        )}

                      </div>

                    </div>


                    {/* UPDATE / ENABLE / DISABLE */}

                    {diff.type ===
                      "changes" && (

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "14px"
                        }}
                      >

                        {diff.fields.map(
                          (field) => (

                            <div
                              key={field.key}
                            >

                              <div
                                style={{
                                  fontWeight: 700,
                                  marginBottom:
                                    "8px",
                                  color:
                                    "#172033"
                                }}
                              >
                                {formatFieldName(
                                  field.key
                                )}
                              </div>


                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "minmax(0, 1fr) 40px minmax(0, 1fr)",
                                  gap: "10px",
                                  alignItems:
                                    "center"
                                }}
                              >

                                {/* BEFORE */}

                                <div
                                  style={{
                                    border:
                                      "1px solid #fecaca",
                                    background:
                                      "#fff7f7",
                                    borderRadius:
                                      "10px",
                                    overflow:
                                      "hidden"
                                  }}
                                >

                                  <div
                                    style={{
                                      padding:
                                        "7px 10px",
                                      background:
                                        "#fee2e2",
                                      color:
                                        "#b91c1c",
                                      fontSize:
                                        "11px",
                                      fontWeight: 800
                                    }}
                                  >
                                    BEFORE
                                  </div>


                                  <pre
                                    style={{
                                      margin: 0,
                                      padding:
                                        "12px",
                                      whiteSpace:
                                        "pre-wrap",
                                      overflowWrap:
                                        "anywhere",
                                      fontSize:
                                        "13px"
                                    }}
                                  >
                                    {formatValue(
                                      field.before
                                    )}
                                  </pre>

                                </div>


                                {/* Arrow */}

                                <div
                                  style={{
                                    textAlign:
                                      "center",
                                    fontSize:
                                      "20px"
                                  }}
                                >
                                  →
                                </div>


                                {/* AFTER */}

                                <div
                                  style={{
                                    border:
                                      "1px solid #bbf7d0",
                                    background:
                                      "#f0fdf4",
                                    borderRadius:
                                      "10px",
                                    overflow:
                                      "hidden"
                                  }}
                                >

                                  <div
                                    style={{
                                      padding:
                                        "7px 10px",
                                      background:
                                        "#dcfce7",
                                      color:
                                        "#15803d",
                                      fontSize:
                                        "11px",
                                      fontWeight: 800
                                    }}
                                  >
                                    AFTER
                                  </div>


                                  <pre
                                    style={{
                                      margin: 0,
                                      padding:
                                        "12px",
                                      whiteSpace:
                                        "pre-wrap",
                                      overflowWrap:
                                        "anywhere",
                                      fontSize:
                                        "13px"
                                    }}
                                  >
                                    {formatValue(
                                      field.after
                                    )}
                                  </pre>

                                </div>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}


                    {/* CREATED */}

                    {diff.type ===
                      "created" && (

                      <div>

                        <div
                          style={{
                            padding:
                              "14px 16px",
                            marginBottom:
                              "14px",
                            borderRadius:
                              "10px",
                            background:
                              "#f0fdf4",
                            border:
                              "1px solid #bbf7d0",
                            color:
                              "#166534"
                          }}
                        >
                          {diff.message}
                        </div>


                        <div
                          style={{
                            border:
                              "1px solid #bbf7d0",
                            background:
                              "#f0fdf4",
                            borderRadius:
                              "10px",
                            overflow:
                              "hidden"
                          }}
                        >

                          <div
                            style={{
                              padding:
                                "8px 12px",
                              background:
                                "#dcfce7",
                              color:
                                "#15803d",
                              fontSize:
                                "11px",
                              fontWeight: 800
                            }}
                          >
                            NEW CONFIGURATION
                          </div>


                          <pre
                            style={{
                              margin: 0,
                              padding:
                                "14px",
                              whiteSpace:
                                "pre-wrap",
                              overflowWrap:
                                "anywhere",
                              fontSize:
                                "13px",
                              lineHeight:
                                1.5
                            }}
                          >
                            {formatValue(
                              diff.after
                            )}
                          </pre>

                        </div>

                      </div>

                    )}


                    {/* DELETED */}

                    {diff.type ===
                      "deleted" && (

                      <div>

                        <div
                          style={{
                            padding:
                              "14px 16px",
                            marginBottom:
                              "14px",
                            borderRadius:
                              "10px",
                            background:
                              "#fff7ed",
                            border:
                              "1px solid #fed7aa",
                            color:
                              "#9a3412"
                          }}
                        >
                          {diff.message}
                        </div>


                        <div
                          style={{
                            border:
                              "1px solid #fecaca",
                            background:
                              "#fff7f7",
                            borderRadius:
                              "10px",
                            overflow:
                              "hidden"
                          }}
                        >

                          <div
                            style={{
                              padding:
                                "8px 12px",
                              background:
                                "#fee2e2",
                              color:
                                "#b91c1c",
                              fontSize:
                                "11px",
                              fontWeight: 800
                            }}
                          >
                            PREVIOUS CONFIGURATION
                          </div>


                          <pre
                            style={{
                              margin: 0,
                              padding:
                                "14px",
                              whiteSpace:
                                "pre-wrap",
                              overflowWrap:
                                "anywhere",
                              fontSize:
                                "13px",
                              lineHeight:
                                1.5
                            }}
                          >
                            {formatValue(
                              diff.before
                            )}
                          </pre>

                        </div>

                      </div>

                    )}


                    {/* INFO / EVALUATION */}

                    {(
                      diff.type ===
                        "info" ||
                      diff.type ===
                        "evaluation"
                    ) && (

                      <div
                        style={{
                          padding:
                            "18px",
                          borderRadius:
                            "10px",
                          background:
                            "#f8fafc",
                          border:
                            "1px solid #e2e8f0",
                          color:
                            "#475569",
                          lineHeight:
                            1.6
                        }}
                      >
                        {diff.message}
                      </div>

                    )}

                  </div>

                );

              })()}

            </div>


            {/* Footer */}

            <div
              className="audit-modal-footer"
              style={{
                position: "sticky",
                bottom: 0,
                background:
                  "#ffffff"
              }}
            >

              <button
                className="secondary-button"
                onClick={() =>
                  setSelectedLog(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default AuditLogs;