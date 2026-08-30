import { useEffect, useState } from "react";

function CleanupSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH CLEANUP SUGGESTIONS
  // =========================================================

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/cleanup/suggestions?days=${days}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch cleanup suggestions"
        );
      }

      const data = await response.json();

      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load cleanup suggestions."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH WHEN DAYS CHANGES
  // =========================================================

  useEffect(() => {
    fetchSuggestions();
  }, [days]);

  // =========================================================
  // MARK SUGGESTION AS REVIEWED
  // =========================================================

  const handleReviewed = async (flagKey) => {
    try {
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/cleanup/suggestions/${encodeURIComponent(
          flagKey
        )}/review`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark suggestion as reviewed"
        );
      }

      // Backend successfully updated the flag.
      // Remove the suggestion from the current UI.
      setSuggestions((current) =>
        current.filter(
          (suggestion) =>
            suggestion.flag_key !== flagKey
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to mark cleanup suggestion as reviewed."
      );
    }
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div style={pageStyle}>

      {/* =====================================
          HEADER
      ===================================== */}

      <div style={header}>

        <div>
          <div style={eyebrow}>
            FLAG LIFECYCLE
          </div>

          <h1 style={title}>
            Cleanup Suggestions
          </h1>

          <p style={subtitle}>
            Flags that have remained fully rolled out
            or disabled for a long time may be ready
            for removal from the codebase.
          </p>
        </div>

        <div style={daysControl}>

          <label style={daysLabel}>
            Stale for
          </label>

          <select
            value={days}
            onChange={(e) =>
              setDays(Number(e.target.value))
            }
            style={select}
          >
            <option value={7}>
              7 days
            </option>

            <option value={14}>
              14 days
            </option>

            <option value={30}>
              30 days
            </option>
          </select>

        </div>

      </div>


      {/* =====================================
          SUMMARY
      ===================================== */}

      <div style={summaryCard}>

        <div style={summaryIcon}>
          🧹
        </div>

        <div>

          <div style={summaryLabel}>
            Cleanup candidates
          </div>

          <div style={summaryValue}>
            {loading
              ? "..."
              : suggestions.length}
          </div>

        </div>

        <div style={summaryText}>
          These flags have been in a stable state
          across environments and should be reviewed
          before removal.
        </div>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div style={errorBox}>
          {error}
        </div>
      )}


      {/* =====================================
          LOADING
      ===================================== */}

      {loading && (
        <div style={emptyCard}>

          <div style={emptyIcon}>
            ⏳
          </div>

          <h3 style={emptyTitle}>
            Loading suggestions...
          </h3>

          <p style={emptyText}>
            Checking your feature flags.
          </p>

        </div>
      )}


      {/* =====================================
          NO SUGGESTIONS
      ===================================== */}

      {!loading &&
        !error &&
        suggestions.length === 0 && (

          <div style={emptyCard}>

            <div style={emptyIcon}>
              ✓
            </div>

            <h3 style={emptyTitle}>
              No cleanup candidates
            </h3>

            <p style={emptyText}>
              Great! No flags have been stale for{" "}
              {days} days or more.
            </p>

          </div>
        )}


      {/* =====================================
          SUGGESTIONS
      ===================================== */}

      {!loading &&
        !error &&
        suggestions.length > 0 && (

          <div style={list}>

            {suggestions.map((suggestion) => (

              <div
                key={suggestion.flag_key}
                style={suggestionCard}
              >

                {/* =================================
                    LEFT
                ================================= */}

                <div style={flagInfo}>

                  <div style={flagTopRow}>

                    <code style={flagKey}>
                      {suggestion.flag_key}
                    </code>

                    <span
                      style={
                        suggestion.status ===
                        "fully_rolled_out"
                          ? rolloutBadge
                          : disabledBadge
                      }
                    >
                      {suggestion.status ===
                      "fully_rolled_out"
                        ? "100% Rolled Out"
                        : "Fully Disabled"}
                    </span>

                  </div>


                  <p style={description}>
                    {suggestion.description ||
                      "No description available."}
                  </p>


                  <div style={meta}>

                    <span>
                      <strong>
                        Owner:
                      </strong>{" "}
                      {suggestion.owner_team}
                    </span>

                    <span>
                      <strong>
                        Stale:
                      </strong>{" "}
                      {suggestion.stale_days} days
                    </span>

                  </div>


                  <div style={reason}>

                    <span style={reasonIcon}>
                      ℹ
                    </span>

                    <span>
                      {suggestion.reason}
                    </span>

                  </div>

                </div>


                {/* =================================
                    RIGHT
                ================================= */}

                <div style={actions}>

                  <div style={warning}>
                    Review before deleting
                  </div>

                  <button
                    style={reviewButton}
                    onClick={() =>
                      handleReviewed(
                        suggestion.flag_key
                      )
                    }
                  >
                    ✓ Mark as Reviewed
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

    </div>
  );
}


/* =========================================
   PAGE
========================================= */

const pageStyle = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "35px 40px",
  color: "#0f172a",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};


/* =========================================
   HEADER
========================================= */

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "25px",
  marginBottom: "28px",
};


const eyebrow = {
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "1.5px",
  color: "#7c3aed",
  marginBottom: "7px",
};


const title = {
  margin: 0,
  fontSize: "30px",
  fontWeight: "800",
  letterSpacing: "-.8px",
};


const subtitle = {
  margin: "9px 0 0",
  maxWidth: "680px",
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "1.6",
};


const daysControl = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  background: "white",
  border: "1px solid #e2e8f0",
  padding: "8px 10px",
  borderRadius: "9px",
};


const daysLabel = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#64748b",
};


const select = {
  border: "none",
  outline: "none",
  background: "white",
  color: "#334155",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer",
};


/* =========================================
   SUMMARY
========================================= */

const summaryCard = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "17px 20px",
  marginBottom: "22px",
};


const summaryIcon = {
  width: "42px",
  height: "42px",
  borderRadius: "10px",
  background: "#f5f3ff",
  color: "#7c3aed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "19px",
};


const summaryLabel = {
  fontSize: "10px",
  color: "#64748b",
  fontWeight: "700",
};


const summaryValue = {
  fontSize: "22px",
  fontWeight: "800",
  marginTop: "2px",
};


const summaryText = {
  marginLeft: "auto",
  maxWidth: "400px",
  color: "#64748b",
  fontSize: "11px",
  lineHeight: "1.5",
};


/* =========================================
   LIST
========================================= */

const list = {
  display: "flex",
  flexDirection: "column",
  gap: "13px",
};


const suggestionCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "25px",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "13px",
  padding: "20px",
};


const flagInfo = {
  flex: 1,
  minWidth: 0,
};


const flagTopRow = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  flexWrap: "wrap",
};


const flagKey = {
  fontSize: "14px",
  fontWeight: "800",
  color: "#1e293b",
  background: "#f8fafc",
  padding: "5px 8px",
  borderRadius: "6px",
};


const rolloutBadge = {
  fontSize: "9px",
  fontWeight: "800",
  color: "#166534",
  background: "#dcfce7",
  padding: "5px 8px",
  borderRadius: "999px",
};


const disabledBadge = {
  fontSize: "9px",
  fontWeight: "800",
  color: "#64748b",
  background: "#f1f5f9",
  padding: "5px 8px",
  borderRadius: "999px",
};


const description = {
  margin: "11px 0 8px",
  color: "#475569",
  fontSize: "12px",
};


const meta = {
  display: "flex",
  gap: "20px",
  color: "#94a3b8",
  fontSize: "10px",
};


const reason = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  marginTop: "13px",
  color: "#64748b",
  fontSize: "10px",
  background: "#f8fafc",
  borderRadius: "7px",
  padding: "8px 10px",
};


const reasonIcon = {
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  background: "#e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "9px",
  fontWeight: "800",
};


/* =========================================
   ACTIONS
========================================= */

const actions = {
  minWidth: "170px",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "8px",
};


const warning = {
  textAlign: "center",
  color: "#f59e0b",
  fontSize: "9px",
  fontWeight: "700",
};


const reviewButton = {
  border: "none",
  background: "#7c3aed",
  color: "white",
  padding: "10px 13px",
  borderRadius: "8px",
  fontSize: "11px",
  fontWeight: "800",
  cursor: "pointer",
};


/* =========================================
   EMPTY
========================================= */

const emptyCard = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "13px",
  padding: "55px 25px",
  textAlign: "center",
};


const emptyIcon = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: "#f5f3ff",
  color: "#7c3aed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 13px",
  fontSize: "20px",
};


const emptyTitle = {
  margin: 0,
  fontSize: "16px",
};


const emptyText = {
  margin: "7px 0 0",
  color: "#94a3b8",
  fontSize: "12px",
};


/* =========================================
   ERROR
========================================= */

const errorBox = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  borderRadius: "9px",
  padding: "12px 15px",
  fontSize: "12px",
  marginBottom: "18px",
};


export default CleanupSuggestions;