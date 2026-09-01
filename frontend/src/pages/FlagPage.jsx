import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import api from "../services/api";


function FlagPage() {

  const [flags, setFlags] = useState([]);

  const [environments, setEnvironments] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedEnvironment, setSelectedEnvironment] =
    useState(
      Number(
        localStorage.getItem(
          "environment_id"
        )
      ) || 1
    );


  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        flagResponse,
        envResponse
      ] = await Promise.all([
        api.get("/flags/"),
        api.get("/environments/")
      ]);


      const allFlags =
        flagResponse.data || [];

      const allEnvironments =
        envResponse.data || [];


      const savedEnvironmentId =
        Number(
          localStorage.getItem(
            "environment_id"
          )
        ) || 1;


      const environmentExists =
        allEnvironments.some(
          (environment) =>
            Number(environment.id) ===
            savedEnvironmentId
        );


      const environmentId =
        environmentExists
          ? savedEnvironmentId
          : allEnvironments.length > 0
          ? allEnvironments[0].id
          : 1;


      const filteredFlags =
        allFlags.filter(
          (flag) =>
            Number(flag.environment_id) ===
            Number(environmentId)
        );


      setFlags(filteredFlags);

      setEnvironments(
        allEnvironments
      );

      setSelectedEnvironment(
        Number(environmentId)
      );


      localStorage.setItem(
        "environment_id",
        environmentId
      );


      const selectedEnvironmentObject =
        allEnvironments.find(
          (environment) =>
            Number(environment.id) ===
            Number(environmentId)
        );


      if (selectedEnvironmentObject) {

        localStorage.setItem(
          "environment",
          selectedEnvironmentObject.name
        );

      }

    } catch (error) {

      console.error(
        "Failed to load dashboard",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load feature flags. Please try again."
      );
    } finally {

      setLoading(false);

    }

  };


  const getEnvironmentName = (id) => {

    const environment =
      environments.find(
        (env) =>
          Number(env.id) ===
          Number(id)
      );

    return environment
      ? environment.name
      : "Unknown";

  };


  const deleteFlag = async (key) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${key}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      await api.delete(
        `/flags/${key}`
      );

      alert(
        "Flag deleted successfully"
      );

      fetchData();

    } catch (error) {

      console.error(
        "Delete failed:",
        error
      );

      alert(
        error.response?.data?.detail ||
        "Delete failed"
      );

    }

  };


  const enabledCount =
    flags.filter(
      (flag) => flag.enabled
    ).length;


  const disabledCount =
    flags.length -
    enabledCount;


  const filteredFlags =
    useMemo(() => {

      const query =
        search
          .toLowerCase()
          .trim();


      if (!query) {
        return flags;
      }


      return flags.filter(
        (flag) => {

          const key =
            flag.flag_key
              ?.toLowerCase() || "";

          const owner =
            flag.owner_team
              ?.toLowerCase() || "";

          const type =
            flag.type
              ?.toLowerCase() || "";

          const environment =
            getEnvironmentName(
              flag.environment_id
            ).toLowerCase();


          return (
            key.includes(query) ||
            owner.includes(query) ||
            type.includes(query) ||
            environment.includes(query)
          );

        }
      );

    }, [
      flags,
      search,
      environments
    ]);


  const selectedEnvironmentName =
    getEnvironmentName(
      selectedEnvironment
    );


  if (loading) {
    if (error) {

  return (

    <main className="dashboard-main">

      <div className="dashboard-container">

        <div className="error-state">

          <div className="empty-icon">
            !
          </div>

          <h2>
            Unable to load feature flags
          </h2>

          <p>
            {error}
          </p>

          <button
            className="primary-button"
            onClick={fetchData}
          >
            Try Again
          </button>

        </div>

      </div>

    </main>

  );

}

    return (

      <main className="dashboard-main">

        <div className="dashboard-loading">

          <div className="loading-spinner"></div>

          <h2>
            Loading Feature Flags
          </h2>

          <p>
            Fetching your deployment
            configuration...
          </p>

        </div>

      </main>

    );

  }


  return (

    <main className="dashboard-main">

      <div className="dashboard-container">

        {/* HEADER */}

        <header className="dashboard-header">

          <div className="dashboard-heading">

            <div className="eyebrow">
              FEATURE MANAGEMENT
            </div>

            <h1>
              Feature Flags
            </h1>

            <p>
              Manage, monitor and control
              feature releases across your
              environments.
            </p>

            <div className="environment-pill">

              <span>
                ●
              </span>

              <span>
                Environment
              </span>

              <strong>
                {selectedEnvironmentName}
              </strong>

            </div>

          </div>


          <Link
            to="/create-flag"
            className="primary-button"
          >

            <span>
              +
            </span>

            Create Flag

          </Link>

        </header>


        {/* STATISTICS */}

        <section className="stats-grid">

          <StatCard
            title="Total Flags"
            value={flags.length}
            description="Flags in selected environment"
            icon="⚑"
            variant="blue"
          />

          <StatCard
            title="Enabled"
            value={enabledCount}
            description="Currently active"
            icon="✓"
            variant="green"
          />

          <StatCard
            title="Disabled"
            value={disabledCount}
            description="Currently inactive"
            icon="×"
            variant="red"
          />

          <StatCard
            title="Environments"
            value={environments.length}
            description="Available environments"
            icon="◈"
            variant="purple"
          />

        </section>


        {/* MAIN FLAGS CARD */}

        <section className="flags-card">

          <div className="flags-toolbar">

            <div>

              <div className="section-eyebrow">
                CONFIGURATION
              </div>

              <h2>
                All Feature Flags
              </h2>

              <span className="flags-count">
                {filteredFlags.length}{" "}
                {filteredFlags.length === 1
                  ? "flag"
                  : "flags"}
              </span>

            </div>


            <div className="toolbar-actions">

              <div className="search-wrapper">

                <span className="search-icon">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search flags, owners..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  className="search-input"
                />

                {search && (
                  <button
                    className="clear-search"
                    onClick={() =>
                      setSearch("")
                    }
                  >
                    ×
                  </button>
                )}

              </div>

            </div>

          </div>


          {/* EMPTY */}

          {filteredFlags.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ⚑
              </div>

              <h3>
                No flags found
              </h3>

              <p>
                {search
                  ? "Try a different search term."
                  : `No feature flags exist in the ${selectedEnvironmentName} environment.`
                }
              </p>


              {!search && (

                <Link
                  to="/create-flag"
                  className="primary-button"
                >
                  + Create your first flag
                </Link>

              )}

            </div>

          ) : (

            <div className="table-wrapper">

              <table className="flags-table">

                <thead>

                  <tr>

                    <th>
                      FEATURE FLAG
                    </th>

                    <th>
                      TYPE
                    </th>

                    <th>
                      ENVIRONMENT
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      OWNER
                    </th>

                    <th>
                      ACTIONS
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredFlags.map(
                    (flag) => (

                      <tr
                        key={flag.id}
                      >

                        <td>

                          <Link
                            to={`/flag/${flag.flag_key}`}
                            className="flag-name"
                          >
                            {flag.flag_key ||
                              "Unnamed flag"}
                          </Link>

                          <div className="flag-id">
                            ID #{flag.id}
                          </div>

                        </td>


                        <td>

                          <span className="type-badge">
                            {flag.type || "unknown"}
                          </span>

                        </td>


                        <td>

                          <span className="environment-badge">

                            <span>
                              ●
                            </span>

                            {getEnvironmentName(
                              flag.environment_id
                            )}

                          </span>

                        </td>


                        <td>

                          {flag.enabled ? (

                            <span className="status-badge status-enabled">

                              <span className="status-dot"></span>

                              Enabled

                            </span>

                          ) : (

                            <span className="status-badge status-disabled">

                              <span className="status-dot"></span>

                              Disabled

                            </span>

                          )}

                        </td>


                        <td>

                          <div className="owner-cell">

                            <div className="owner-avatar">

                              {(
                                flag.owner_team ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <span>
                              {flag.owner_team ||
                                "Unassigned"}
                            </span>

                          </div>

                        </td>


                        <td>

                          <div className="action-buttons">

                            <Link
                              to={`/edit-flag/${flag.flag_key}`}
                              className="edit-button"
                            >
                              Edit
                            </Link>

                            <button
                              onClick={() =>
                                deleteFlag(
                                  flag.flag_key
                                )
                              }
                              className="delete-button"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* FOOTER */}

        <footer className="dashboard-footer">

          <span>
            Intelligent Feature Deployment
          </span>

          <span>
            {flags.length} flags ·{" "}
            {environments.length} environments
          </span>

        </footer>

      </div>

    </main>

  );

}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  value,
  description,
  icon,
  variant
}) {

  return (

    <div
      className={`stat-card ${variant}`}
    >

      <div className="stat-card-top">

        <div>

          <span className="stat-title">
            {title}
          </span>

          <div className="stat-value">
            {value}
          </div>

        </div>


        <div className="stat-icon">
          {icon}
        </div>

      </div>


      <div className="stat-description">
        {description}
      </div>

    </div>

  );

}


export default FlagPage;