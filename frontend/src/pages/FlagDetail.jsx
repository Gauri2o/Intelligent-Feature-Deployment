import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import api from "../services/api";


function FlagDetail() {

  const { key } = useParams();
  const navigate = useNavigate();


  // =========================================================
  // FLAG
  // =========================================================

  const [flag, setFlag] = useState(null);
  const [loading, setLoading] = useState(true);


  // =========================================================
  // TARGETING RULES
  // =========================================================

  const [rules, setRules] = useState([]);

  const [userId, setUserId] = useState("");

  const [availableGroups, setAvailableGroups] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState("");

  const [rulesLoading, setRulesLoading] = useState(false);

  const [groupsLoading, setGroupsLoading] = useState(false);


  // =========================================================
  // ROLLOUT
  // =========================================================

  const [rolloutPercentage, setRolloutPercentage] = useState(0);

  const [rolloutSaving, setRolloutSaving] = useState(false);

  const [rolloutSaved, setRolloutSaved] = useState(false);


  // =========================================================
  // ENVIRONMENTS + OVERRIDES
  // =========================================================

  const [environments, setEnvironments] = useState([]);

  const [overrides, setOverrides] = useState([]);

  const [environmentLoading, setEnvironmentLoading] = useState(false);

  const [overrideSaving, setOverrideSaving] = useState(null);


  // =========================================================
  // EVALUATION TEST
  // =========================================================

  const [evaluationUserId, setEvaluationUserId] = useState("");

  const [evaluationEnvironmentId, setEvaluationEnvironmentId] =
    useState("");

  const [evaluationResult, setEvaluationResult] = useState(null);

  const [evaluationLoading, setEvaluationLoading] = useState(false);


  // =========================================================
  // DAY 16 - EVALUATION ANALYTICS
  // =========================================================

  const [analytics, setAnalytics] = useState([]);

  const [analyticsRange, setAnalyticsRange] = useState(7);

  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [analyticsError, setAnalyticsError] = useState("");


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    fetchFlag();

    fetchEnvironments();

  }, [key]);


  useEffect(() => {

    if (!flag) return;

    fetchRules();

    fetchGroups();

    fetchOverrides();

    fetchEvaluationAnalytics();

  }, [flag?.id, analyticsRange]);


  // =========================================================
  // FETCH FLAG
  // =========================================================

  const fetchFlag = async () => {

    try {

      setLoading(true);

      const response =
        await api.get(`/flags/${key}`);

      const data = response.data;

      setFlag(data);

      setRolloutPercentage(
        Number(data.rollout_percentage || 0)
      );


      if (data.environment_id != null) {

        setEvaluationEnvironmentId(
          Number(data.environment_id)
        );

      }

    } catch (err) {

      console.error(
        "Failed to load flag:",
        err
      );

      alert(
        err.response?.data?.detail ||
        "Flag not found"
      );

      navigate("/flags");

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // FETCH ENVIRONMENTS
  // =========================================================

  const fetchEnvironments = async () => {

    try {

      setEnvironmentLoading(true);

      const response =
        await api.get("/environments/");

      const data =
        Array.isArray(response.data)
          ? response.data
          : [];

      setEnvironments(data);


      if (
        data.length &&
        !evaluationEnvironmentId
      ) {

        setEvaluationEnvironmentId(
          Number(data[0].id)
        );

      }

    } catch (err) {

      console.error(
        "Failed to load environments:",
        err
      );

    } finally {

      setEnvironmentLoading(false);

    }

  };


  // =========================================================
  // FETCH OVERRIDES
  // =========================================================

  const fetchOverrides = async () => {

    if (!flag?.id) return;

    try {

      const response =
        await api.get(
          `/flags/${key}/overrides`
        );

      setOverrides(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to load environment overrides:",
        err
      );

      setOverrides([]);

    }

  };


  // =========================================================
  // ENVIRONMENT NAME
  // =========================================================

  const getEnvironmentName = (id) => {

    const env =
      environments.find(
        (item) =>
          Number(item.id) === Number(id)
      );

    return (
      env?.name ||
      `Environment #${id}`
    );

  };


  // =========================================================
  // GET OVERRIDE
  // =========================================================

  const getOverride = (environmentId) => {

    return overrides.find(
      (item) =>
        Number(item.environment_id) ===
        Number(environmentId)
    );

  };


  // =========================================================
  // SAVE ENVIRONMENT OVERRIDE
  // =========================================================

  const saveEnvironmentOverride = async (
    environmentId,
    enabled,
    value
  ) => {

    try {

      setOverrideSaving(environmentId);

      const existing =
        getOverride(environmentId);


      if (existing) {

        await api.put(
          `/flags/${key}/overrides/${environmentId}`,
          {
            enabled,
            value:
              value === ""
                ? null
                : value,
          }
        );

      } else {

        await api.post(
          `/flags/${key}/overrides`,
          {
            environment_id:
              Number(environmentId),

            enabled,

            value:
              value === ""
                ? null
                : value,
          }
        );

      }

      await fetchOverrides();

    } catch (err) {

      console.error(
        "Failed to save environment override:",
        err
      );

      alert(
        err.response?.data?.detail ||
        "Failed to save environment override."
      );

    } finally {

      setOverrideSaving(null);

    }

  };


  // =========================================================
  // DELETE ENVIRONMENT OVERRIDE
  // =========================================================

  const deleteEnvironmentOverride = async (
    environmentId
  ) => {

    if (!getOverride(environmentId)) {
      return;
    }


    if (
      !window.confirm(
        `Remove override for ${getEnvironmentName(
          environmentId
        )}?`
      )
    ) {

      return;

    }


    try {

      setOverrideSaving(environmentId);

      await api.delete(
        `/flags/${key}/overrides/${environmentId}`
      );

      await fetchOverrides();

    } catch (err) {

      console.error(
        "Failed to delete environment override:",
        err
      );

      alert(
        err.response?.data?.detail ||
        "Failed to remove environment override."
      );

    } finally {

      setOverrideSaving(null);

    }

  };


  // =========================================================
  // FETCH TARGETING RULES
  // =========================================================

  const fetchRules = async () => {

    try {

      setRulesLoading(true);

      const response =
        await api.get(
          `/targeting-rules/rules/flag/${flag.id}`
        );

      setRules(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to load targeting rules:",
        err
      );

    } finally {

      setRulesLoading(false);

    }

  };


  // =========================================================
  // FETCH GROUPS
  // =========================================================

  const fetchGroups = async () => {

    try {

      setGroupsLoading(true);

      const response =
        await api.get(
          "/targeting-rules/rules/groups"
        );

      setAvailableGroups(
        response.data?.groups || []
      );

    } catch (err) {

      console.error(
        "Failed to load groups:",
        err
      );

      setAvailableGroups([]);

    } finally {

      setGroupsLoading(false);

    }

  };


  // =========================================================
  // ADD USER RULE
  // =========================================================

  const addUserRule = async () => {

    const value =
      userId.trim();


    if (!value) {

      return alert(
        "Please enter a User ID."
      );

    }


    const exists =
      rules.some(
        (r) =>
          r.attribute === "user_id" &&
          r.operator === "equals" &&
          r.value === value
      );


    if (exists) {

      return alert(
        "This User ID is already targeted."
      );

    }


    try {

      await api.post(
        "/targeting-rules/rules/",
        {
          flag_id: flag.id,

          attribute: "user_id",

          operator: "equals",

          value,
        }
      );

      setUserId("");

      await fetchRules();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Failed to add user targeting rule."
      );

    }

  };


  // =========================================================
  // ADD GROUP RULE
  // =========================================================

  const addGroupRule = async () => {

    if (!selectedGroup) {

      return alert(
        "Please select a group."
      );

    }


    const exists =
      rules.some(
        (r) =>
          r.attribute === "group" &&
          r.operator === "equals" &&
          r.value === selectedGroup
      );


    if (exists) {

      return alert(
        `${selectedGroup} is already targeted.`
      );

    }


    try {

      await api.post(
        "/targeting-rules/rules/",
        {
          flag_id: flag.id,

          attribute: "group",

          operator: "equals",

          value: selectedGroup,
        }
      );

      setSelectedGroup("");

      await fetchRules();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Failed to add group targeting rule."
      );

    }

  };


  // =========================================================
  // DELETE RULE
  // =========================================================

  const deleteRule = async (
    ruleId,
    type
  ) => {

    if (
      !window.confirm(
        type === "group"
          ? "Remove this group from targeting?"
          : "Remove this user from targeting?"
      )
    ) {

      return;

    }


    try {

      await api.delete(
        `/targeting-rules/rules/${ruleId}`
      );

      await fetchRules();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Failed to remove targeting rule."
      );

    }

  };


  // =========================================================
  // SAVE ROLLOUT
  // =========================================================

  const saveRollout = async () => {

    try {

      setRolloutSaving(true);

      setRolloutSaved(false);


      await api.put(
        `/flags/${key}`,
        {
          rollout_percentage:
            Number(rolloutPercentage),
        }
      );


      await fetchFlag();

      setRolloutSaved(true);


      setTimeout(
        () => setRolloutSaved(false),
        2500
      );

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Failed to save rollout percentage."
      );

    } finally {

      setRolloutSaving(false);

    }

  };


  // =========================================================
  // EVALUATE FLAG
  // =========================================================

  const evaluateCurrentFlag = async () => {

    const user =
      evaluationUserId.trim();


    if (!user) {

      return alert(
        "Please enter a User ID."
      );

    }


    if (!evaluationEnvironmentId) {

      return alert(
        "Please select an environment."
      );

    }


    try {

      setEvaluationLoading(true);

      setEvaluationResult(null);


      const response =
        await api.post(
          "/evaluation/",
          {
            flag_key:
              flag.flag_key,

            environment_id:
              Number(
                evaluationEnvironmentId
              ),

            user_id:
              user,
          }
        );


      setEvaluationResult(
        response.data
      );


      // Refresh analytics after evaluation
      setTimeout(
        () => fetchEvaluationAnalytics(),
        500
      );

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Evaluation failed."
      );

    } finally {

      setEvaluationLoading(false);

    }

  };


  // =========================================================
  // DAY 16 - FETCH EVALUATION ANALYTICS
  // =========================================================

  const fetchEvaluationAnalytics = async () => {

    if (!key) return;


    try {

      setAnalyticsLoading(true);

      setAnalyticsError("");


      /*
       * Backend endpoint expected:
       *
       * GET /evaluation/analytics/{flag_key}?days=7
       *
       * Example response:
       *
       * [
       *   {
       *     "date": "2026-08-24",
       *     "count": 120
       *   },
       *   {
       *     "date": "2026-08-25",
       *     "count": 175
       *   }
       * ]
       */


      const response =
        await api.get(
          `/evaluation/analytics/${key}`,
          {
            params: {
              days: analyticsRange,
            },
          }
        );


      let data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.data;


      if (!Array.isArray(data)) {
        data = [];
      }


      const formatted =
        data.map((item) => {

          const date =
            item.date ||
            item.day ||
            item.timestamp ||
            item.hour;


          const count =
            Number(
              item.count ??
              item.evaluation_count ??
              item.evaluations ??
              0
            );


          return {
            date: formatAnalyticsDate(date),
            rawDate: date,
            count,
          };

        });


      setAnalytics(formatted);

    } catch (err) {

      console.error(
        "Failed to load evaluation analytics:",
        err
      );


      setAnalytics([]);

      setAnalyticsError(
        err.response?.data?.detail ||
        "Evaluation analytics are not available yet."
      );

    } finally {

      setAnalyticsLoading(false);

    }

  };


  // =========================================================
  // FORMAT ANALYTICS DATE
  // =========================================================

  const formatAnalyticsDate = (date) => {

    if (!date) {
      return "—";
    }


    const parsed =
      new Date(date);


    if (Number.isNaN(parsed.getTime())) {
      return String(date);
    }


    return parsed.toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
      }
    );

  };


  // =========================================================
  // DELETE FLAG
  // =========================================================

  const deleteFlag = async () => {

    if (
      !window.confirm(
        "Delete this feature flag?"
      )
    ) {

      return;

    }


    try {

      await api.delete(
        `/flags/${key}`
      );

      alert(
        "Flag deleted successfully."
      );

      navigate("/flags");

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Delete failed."
      );

    }

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div style={page}>

        <div style={centerCard}>

          <div style={spinner} />

          <h2>
            Loading Flag Details...
          </h2>

          <p style={muted}>
            Please wait while we load the configuration.
          </p>

        </div>

      </div>

    );

  }


  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!flag) {

    return (

      <div style={page}>

        <div style={centerCard}>

          <div style={{ fontSize: 48 }}>
            🚩
          </div>

          <h2>
            Flag not found
          </h2>

          <p style={muted}>
            The requested feature flag could not be found.
          </p>

          <button
            style={primaryBtn}
            onClick={() =>
              navigate("/flags")
            }
          >
            ← Back to Dashboard
          </button>

        </div>

      </div>

    );

  }


  // =========================================================
  // RULE GROUPS
  // =========================================================

  const userRules =
    rules.filter(
      (r) =>
        r.attribute === "user_id" &&
        r.operator === "equals"
    );


  const groupRules =
    rules.filter(
      (r) =>
        r.attribute === "group" &&
        r.operator === "equals"
    );


  // =========================================================
  // ANALYTICS TOTAL
  // =========================================================

  const totalEvaluations =
    analytics.reduce(
      (sum, item) =>
        sum + Number(item.count || 0),
      0
    );


  // =========================================================
  // MAIN
  // =========================================================

  return (

    <div style={page}>

      <div style={container}>


        {/* =====================================================
            HEADER
        ===================================================== */}

        <header style={header}>

          <div>

            <button
              style={backBtn}
              onClick={() =>
                navigate("/flags")
              }
            >
              ← Dashboard
            </button>

            <div style={eyebrow}>
              FEATURE FLAG
            </div>

            <h1 style={title}>
              {flag.flag_key}
            </h1>

            <p style={muted}>
              Configure targeting, environments and rollout behavior.
            </p>

          </div>


          <div style={actions}>

            <button
              style={editBtn}
              onClick={() =>
                navigate(
                  `/edit-flag/${flag.flag_key}`
                )
              }
            >
              ✏ Edit
            </button>

            <button
              style={deleteBtn}
              onClick={deleteFlag}
            >
              🗑 Delete
            </button>

          </div>

        </header>


        {/* =====================================================
            STATUS
        ===================================================== */}

        <div style={statusBanner}>

          <div>

            <span style={statusDot} />

            <strong>
              {flag.enabled
                ? "Feature is enabled"
                : "Feature is disabled"}
            </strong>

            <span style={statusEnv}>
              {getEnvironmentName(
                flag.environment_id
              )}
            </span>

          </div>


          <span
            style={
              flag.enabled
                ? enabledBadge
                : disabledBadge
            }
          >
            {flag.enabled
              ? "ENABLED"
              : "DISABLED"}
          </span>

        </div>


        {/* =====================================================
            CONFIGURATION
        ===================================================== */}

        <Section
          eyebrow="CONFIGURATION"
          title="Flag Details"
        >

          <div style={grid}>

            <Detail
              label="Flag Key"
              value={flag.flag_key}
            />

            <Detail
              label="Type"
              value={flag.type}
            />

            <Detail
              label="Default Value"
              value={String(
                flag.default_value
              )}
            />

            <Detail
              label="Environment"
              value={getEnvironmentName(
                flag.environment_id
              )}
            />

            <Detail
              label="Owner Team"
              value={
                flag.owner_team ||
                "Unassigned"
              }
            />

            <Detail
              label="Description"
              value={
                flag.description ||
                "No description"
              }
            />

          </div>

        </Section>


        {/* =====================================================
            DAY 16 - EVALUATION ANALYTICS
        ===================================================== */}

        <Section
          eyebrow="ANALYTICS"
          title="Evaluation Count"
          description="See how many times this feature flag was evaluated."
          right={
            <div style={rangeButtons}>

              <button
                style={
                  analyticsRange === 7
                    ? rangeButtonActive
                    : rangeButton
                }
                onClick={() =>
                  setAnalyticsRange(7)
                }
              >
                7 Days
              </button>

              <button
                style={
                  analyticsRange === 30
                    ? rangeButtonActive
                    : rangeButton
                }
                onClick={() =>
                  setAnalyticsRange(30)
                }
              >
                30 Days
              </button>

            </div>
          }
        >

          <div style={analyticsSummary}>

            <div>

              <span style={smallLabel}>
                TOTAL EVALUATIONS
              </span>

              <strong style={analyticsTotal}>
                {analyticsLoading
                  ? "..."
                  : totalEvaluations.toLocaleString()}
              </strong>

            </div>

            <div style={analyticsSummaryText}>
              Last {analyticsRange} days
            </div>

          </div>


          <div style={chartCard}>

            {analyticsLoading ? (

              <div style={chartMessage}>
                <div style={smallSpinner} />
                Loading evaluation analytics...
              </div>

            ) : analytics.length === 0 ? (

              <div style={chartMessage}>

                <div style={emptyChartIcon}>
                  ◷
                </div>

                <strong>
                  No evaluation data yet
                </strong>

                <span>
                  Evaluate this flag to start tracking usage.
                </span>

                {analyticsError && (
                  <small>
                    {analyticsError}
                  </small>
                )}

              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <LineChart
                  data={analytics}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toLocaleString()} evaluations`,
                      "Evaluations",
                    ]}
                    labelFormatter={(label) =>
                      `Date: ${label}`
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>

        </Section>


        {/* =====================================================
            TARGETING
        ===================================================== */}

        <Section
          eyebrow="TARGETING"
          title="Targeting Rules"
          description="Control exactly which users or groups receive this feature."
          right={
            <Badge>
              Priority: User → Group → Rollout
            </Badge>
          }
        >

          {/* USER TARGETING */}

          <TargetCard
            icon="👤"
            title="User Targeting"
            description="Allow specific users to receive this feature."
          >

            <div style={row}>

              <input
                style={input}
                placeholder="Enter User ID e.g. user123"
                value={userId}
                onChange={(e) =>
                  setUserId(
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  addUserRule()
                }
              />

              <button
                style={greenBtn}
                onClick={addUserRule}
              >
                + Add User
              </button>

            </div>


            <ListHeader
              text="Targeted Users"
              count={userRules.length}
            />


            {rulesLoading ? (

              <LoadingLine />

            ) : userRules.length === 0 ? (

              <Empty
                icon="👤"
                text="No specific users are targeted."
              />

            ) : (

              userRules.map(
                (rule) => (

                  <RuleRow
                    key={rule.id}
                    icon="👤"
                    value={rule.value}
                    label="User"
                    onDelete={() =>
                      deleteRule(
                        rule.id,
                        "user"
                      )
                    }
                  />

                )
              )

            )}

          </TargetCard>


          {/* GROUP TARGETING */}

          <TargetCard
            icon="👥"
            title="Group Targeting"
            description="Target everyone belonging to a configured user group."
            marginTop
            iconBackground="#ede9fe"
          >

            <div style={row}>

              <select
                style={input}
                value={selectedGroup}
                onChange={(e) =>
                  setSelectedGroup(
                    e.target.value
                  )
                }
                disabled={groupsLoading}
              >

                <option value="">
                  {groupsLoading
                    ? "Loading groups..."
                    : "Select a group"}
                </option>

                {availableGroups.map(
                  (group) => (

                    <option
                      key={group}
                      value={group}
                    >
                      {group}
                    </option>

                  )
                )}

              </select>


              <button
                style={purpleBtn}
                onClick={addGroupRule}
                disabled={
                  groupsLoading ||
                  !selectedGroup
                }
              >
                + Add Group
              </button>

            </div>


            <ListHeader
              text="Targeted Groups"
              count={groupRules.length}
            />


            {rulesLoading ? (

              <LoadingLine />

            ) : groupRules.length === 0 ? (

              <Empty
                icon="👥"
                text="No groups are currently targeted."
              />

            ) : (

              groupRules.map(
                (rule) => (

                  <RuleRow
                    key={rule.id}
                    icon="👥"
                    value={rule.value}
                    label="Group"
                    group
                    onDelete={() =>
                      deleteRule(
                        rule.id,
                        "group"
                      )
                    }
                  />

                )
              )

            )}


            {!groupsLoading &&
              availableGroups.length === 0 && (

                <div style={hint}>
                  No groups are available yet. Add a user to a group first using the User Group Membership API.
                </div>

              )}

          </TargetCard>


          {/* PERCENTAGE ROLLOUT */}

          <TargetCard
            icon="🚀"
            title="Percentage Rollout"
            description="Gradually release this feature to a percentage of users."
            marginTop
            iconBackground="#dcfce7"
          >

            <div style={rolloutTop}>

              <div>

                <div style={smallLabel}>
                  Current rollout
                </div>

                <div style={rolloutValue}>
                  {rolloutPercentage}%
                </div>

              </div>


              <Badge>

                {rolloutPercentage === 0
                  ? "Not rolling out"
                  : rolloutPercentage === 100
                  ? "100% rollout"
                  : "Gradual rollout"}

              </Badge>

            </div>


            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={rolloutPercentage}
              onChange={(e) => {

                setRolloutPercentage(
                  Number(e.target.value)
                );

                setRolloutSaved(false);

              }}
              style={slider}
            />


            <div style={sliderLabels}>

              <span>0%</span>

              <span>25%</span>

              <span>50%</span>

              <span>75%</span>

              <span>100%</span>

            </div>


            <div style={infoBox}>

              ℹ️

              <div>

                <strong>
                  Enabled for {rolloutPercentage}% of users
                </strong>

                <p
                  style={{
                    ...muted,
                    margin: "5px 0 0",
                    fontSize: 12,
                  }}
                >
                  Users are assigned to a deterministic bucket, so the same user consistently receives the same result.
                </p>

              </div>

            </div>


            <div style={saveRow}>

              {rolloutSaved && (

                <span style={saved}>
                  ✓ Rollout saved
                </span>

              )}


              <button
                style={purpleBtn}
                disabled={rolloutSaving}
                onClick={saveRollout}
              >
                {rolloutSaving
                  ? "Saving..."
                  : "Save Rollout"}
              </button>

            </div>

          </TargetCard>

        </Section>


        {/* =====================================================
            ENVIRONMENT OVERRIDES
        ===================================================== */}

        <Section
          eyebrow="ENVIRONMENTS"
          title="Environment Overrides"
          description="Configure a different enabled state or value for each environment."
        >

          {environmentLoading ? (

            <LoadingLine />

          ) : environments.length === 0 ? (

            <Empty
              icon="🌍"
              text="No environments configured."
            />

          ) : (

            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >

              {environments.map(
                (env) => (

                  <EnvironmentOverride
                    key={env.id}
                    environment={env}
                    override={getOverride(
                      env.id
                    )}
                    defaultValue={
                      flag.default_value
                    }
                    saving={
                      overrideSaving ===
                      env.id
                    }
                    onSave={
                      saveEnvironmentOverride
                    }
                    onDelete={
                      deleteEnvironmentOverride
                    }
                  />

                )
              )}

            </div>

          )}

        </Section>


        {/* =====================================================
            EVALUATION TEST
        ===================================================== */}

        <Section
          eyebrow="EVALUATION"
          title="Evaluation Test Panel"
          description="Test how this flag resolves for a specific user and environment."
        >

          <div style={row}>

            <input
              style={input}
              placeholder="Enter User ID e.g. user123"
              value={evaluationUserId}
              onChange={(e) =>
                setEvaluationUserId(
                  e.target.value
                )
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                evaluateCurrentFlag()
              }
            />


            <select
              style={input}
              value={evaluationEnvironmentId}
              onChange={(e) =>
                setEvaluationEnvironmentId(
                  Number(e.target.value)
                )
              }
              disabled={
                environmentLoading ||
                environments.length === 0
              }
            >

              {environments.length === 0 ? (

                <option value="">
                  No environments
                </option>

              ) : (

                environments.map(
                  (env) => (

                    <option
                      key={env.id}
                      value={env.id}
                    >
                      {env.name}
                    </option>

                  )
                )

              )}

            </select>


            <button
              style={primaryBtn}
              disabled={
                evaluationLoading ||
                !evaluationEnvironmentId
              }
              onClick={
                evaluateCurrentFlag
              }
            >
              {evaluationLoading
                ? "Evaluating..."
                : "Evaluate"}
            </button>

          </div>


          {evaluationResult && (

            <div
              style={{
                marginTop: 18,
                padding: 18,
                background:
                  evaluationResult.enabled
                    ? "#f0fdf4"
                    : "#fef2f2",
                border:
                  `1px solid ${
                    evaluationResult.enabled
                      ? "#bbf7d0"
                      : "#fecaca"
                  }`,
                borderRadius: 12,
              }}
            >

              <div style={resultHeader}>

                <strong
                  style={{
                    color:
                      evaluationResult.enabled
                        ? "#166534"
                        : "#991b1b",
                  }}
                >
                  {evaluationResult.enabled
                    ? "✓ Feature Enabled"
                    : "✕ Feature Disabled"}
                </strong>

                <Badge>

                  {evaluationResult.enabled
                    ? "ENABLED"
                    : "DISABLED"}

                </Badge>

              </div>


              <div
                style={{
                  display: "grid",
                  gap: 8,
                  fontSize: 13,
                  color: "#475569",
                }}
              >

                <div>
                  <strong>Flag:</strong>{" "}
                  {evaluationResult.flag_key}
                </div>


                <div>

                  <strong>
                    Environment:
                  </strong>{" "}

                  {getEnvironmentName(
                    evaluationResult.environment_id
                  )}

                </div>


                <div>

                  <strong>User:</strong>{" "}

                  {evaluationUserId}

                </div>


                <div>

                  <strong>Value:</strong>{" "}

                  {String(
                    evaluationResult.value ??
                    evaluationResult.default_value
                  )}

                </div>


                <div>

                  <strong>Reason:</strong>{" "}

                  {evaluationResult.reason}

                </div>

              </div>

            </div>

          )}

        </Section>

      </div>

    </div>

  );

}


// =============================================================
// ENVIRONMENT OVERRIDE
// =============================================================

function EnvironmentOverride({
  environment,
  override,
  defaultValue,
  saving,
  onSave,
  onDelete,
}) {

  const [enabled, setEnabled] =
    useState(
      override?.enabled ?? true
    );

  const [value, setValue] =
    useState(
      override?.value ?? ""
    );


  useEffect(() => {

    setEnabled(
      override?.enabled ?? true
    );

    setValue(
      override?.value ?? ""
    );

  }, [override]);


  return (

    <div style={overrideCard}>

      <div style={overrideTitle}>

        <div>

          <strong>
            {environment.name}
          </strong>

          <div style={mutedSmall}>
            Environment #{environment.id}
          </div>

        </div>


        {override ? (

          <span style={overrideBadge}>
            OVERRIDE ACTIVE
          </span>

        ) : (

          <span style={neutralBadge}>
            DEFAULT
          </span>

        )}

      </div>


      <div style={row}>

        <label style={toggleLabel}>

          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) =>
              setEnabled(
                e.target.checked
              )
            }
          />

          Enabled

        </label>


        <input
          style={input}
          placeholder={
            `Override value (default: ${defaultValue})`
          }
          value={value}
          onChange={(e) =>
            setValue(
              e.target.value
            )
          }
        />


        <button
          style={primaryBtn}
          disabled={saving}
          onClick={() =>
            onSave(
              environment.id,
              enabled,
              value
            )
          }
        >
          {saving
            ? "Saving..."
            : "Save"}
        </button>


        {override && (

          <button
            style={removeBtn}
            disabled={saving}
            onClick={() =>
              onDelete(
                environment.id
              )
            }
          >
            Remove
          </button>

        )}

      </div>

    </div>

  );

}


// =============================================================
// SECTION
// =============================================================

function Section({
  eyebrow,
  title,
  description,
  right,
  children,
}) {

  return (

    <section style={section}>

      <div style={sectionHeader}>

        <div>

          <div style={sectionEyebrow}>
            {eyebrow}
          </div>

          <h2 style={sectionTitle}>
            {title}
          </h2>

          {description && (

            <p style={muted}>
              {description}
            </p>

          )}

        </div>


        {right}

      </div>


      {children}

    </section>

  );

}


// =============================================================
// TARGET CARD
// =============================================================

function TargetCard({
  icon,
  title,
  description,
  children,
  marginTop,
  iconBackground,
}) {

  return (

    <div
      style={{
        ...targetCard,

        ...(marginTop
          ? { marginTop: 16 }
          : {}),
      }}
    >

      <div style={targetHeader}>

        <div
          style={{
            ...targetIcon,
            background:
              iconBackground ||
              "#dbeafe",
          }}
        >
          {icon}
        </div>


        <div>

          <h3 style={targetTitle}>
            {title}
          </h3>

          <p style={muted}>
            {description}
          </p>

        </div>

      </div>


      {children}

    </div>

  );

}


// =============================================================
// DETAIL
// =============================================================

function Detail({
  label,
  value,
}) {

  return (

    <div style={detailCard}>

      <span style={smallLabel}>
        {label}
      </span>

      <strong
        style={{
          color: "#0f172a",
          fontSize: 14,
        }}
      >
        {value}
      </strong>

    </div>

  );

}


// =============================================================
// RULE ROW
// =============================================================

function RuleRow({
  icon,
  value,
  label,
  group,
  onDelete,
}) {

  return (

    <div style={ruleRow}>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
        }}
      >

        <div
          style={{
            ...ruleIcon,
            background:
              group
                ? "#ede9fe"
                : "#eff6ff",
          }}
        >
          {icon}
        </div>


        <div>

          <div style={ruleValue}>
            {value}
          </div>

          <div style={mutedSmall}>
            {label} targeting
          </div>

        </div>

      </div>


      <div style={rowActions}>

        <span style={targetedBadge}>
          ✓ Targeted
        </span>

        <button
          style={removeBtn}
          onClick={onDelete}
        >
          Remove
        </button>

      </div>

    </div>

  );

}


// =============================================================
// LIST HEADER
// =============================================================

function ListHeader({
  text,
  count,
}) {

  return (

    <div style={listHeader}>

      <span>
        {text}
      </span>

      <span style={countBadge}>
        {count}
      </span>

    </div>

  );

}


// =============================================================
// EMPTY
// =============================================================

function Empty({
  icon,
  text,
}) {

  return (

    <div style={empty}>

      {icon}

      <span>
        {text}
      </span>

    </div>

  );

}


// =============================================================
// LOADING
// =============================================================

function LoadingLine() {

  return (
    <div style={loadingLine}>
      Loading...
    </div>
  );

}


// =============================================================
// BADGE
// =============================================================

function Badge({
  children,
}) {

  return (
    <span style={badge}>
      {children}
    </span>
  );

}


// =============================================================
// STYLES
// =============================================================

const page = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)",
  padding:
    "32px 20px 60px",
};


const container = {
  maxWidth: 1100,
  margin: "0 auto",
};


const centerCard = {
  maxWidth: 500,
  margin: "80px auto",
  padding: 40,
  background: "#fff",
  borderRadius: 20,
  textAlign: "center",
  boxShadow:
    "0 20px 50px rgba(15,23,42,.08)",
};


const spinner = {
  width: 35,
  height: 35,
  borderRadius: "50%",
  border:
    "4px solid #e2e8f0",
  borderTop:
    "4px solid #2563eb",
  margin:
    "0 auto 20px",
};


const smallSpinner = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  border:
    "3px solid #e2e8f0",
  borderTop:
    "3px solid #7c3aed",
};


const header = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems:
    "flex-start",
  gap: 20,
  marginBottom: 25,
  flexWrap: "wrap",
};


const actions = {
  display: "flex",
  gap: 10,
  marginTop: 45,
};


const eyebrow = {
  marginTop: 24,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 2,
  color: "#6366f1",
};


const title = {
  margin: "5px 0",
  fontSize: 36,
  color: "#0f172a",
  fontWeight: 800,
};


const muted = {
  margin: "5px 0",
  color: "#64748b",
  fontSize: 14,
  lineHeight: 1.5,
};


const mutedSmall = {
  marginTop: 3,
  color: "#94a3b8",
  fontSize: 11,
};


const backBtn = {
  background: "#fff",
  color: "#334155",
  border:
    "1px solid #e2e8f0",
  padding:
    "9px 15px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 600,
};


const editBtn = {
  ...backBtn,
  background: "#2563eb",
  color: "#fff",
  border: "none",
};


const deleteBtn = {
  ...backBtn,
  background: "#fff1f2",
  color: "#dc2626",
  border:
    "1px solid #fecdd3",
};


const primaryBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding:
    "11px 18px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 700,
};


const greenBtn = {
  ...primaryBtn,
  background: "#16a34a",
};


const purpleBtn = {
  ...primaryBtn,
  background: "#7c3aed",
};


const removeBtn = {
  background: "#fff1f2",
  color: "#dc2626",
  border:
    "1px solid #fecdd3",
  padding:
    "8px 11px",
  borderRadius: 7,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
};


const statusBanner = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  padding:
    "15px 18px",
  background: "#fff",
  border:
    "1px solid #e2e8f0",
  borderRadius: 14,
  marginBottom: 22,
};


const statusDot = {
  display: "inline-block",
  width: 9,
  height: 9,
  borderRadius: "50%",
  background: "#22c55e",
  marginRight: 9,
};


const statusEnv = {
  color: "#64748b",
  marginLeft: 12,
  fontSize: 13,
};


const enabledBadge = {
  background: "#dcfce7",
  color: "#15803d",
  padding:
    "6px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
};


const disabledBadge = {
  background: "#fee2e2",
  color: "#b91c1c",
  padding:
    "6px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
};


const section = {
  background: "#fff",
  border:
    "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 28,
  marginBottom: 22,
  boxShadow:
    "0 10px 30px rgba(15,23,42,.04)",
};


const sectionHeader = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems:
    "flex-start",
  gap: 20,
  marginBottom: 22,
  flexWrap: "wrap",
};


const sectionEyebrow = {
  fontSize: 11,
  letterSpacing: 1.5,
  fontWeight: 800,
  color: "#6366f1",
};


const sectionTitle = {
  margin: "5px 0",
  color: "#0f172a",
  fontSize: 23,
};


const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 12,
};


const detailCard = {
  padding: 15,
  background: "#f8fafc",
  border:
    "1px solid #e2e8f0",
  borderRadius: 11,
  display: "flex",
  flexDirection: "column",
  gap: 7,
};


const targetCard = {
  border:
    "1px solid #e2e8f0",
  borderRadius: 15,
  padding: 20,
  background: "#fbfdff",
};


const targetHeader = {
  display: "flex",
  alignItems: "center",
  gap: 13,
  marginBottom: 18,
};


const targetIcon = {
  width: 42,
  height: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 11,
  fontSize: 20,
};


const targetTitle = {
  margin: 0,
  fontSize: 17,
  color: "#0f172a",
};


const row = {
  display: "flex",
  gap: 10,
  marginBottom: 18,
  flexWrap: "wrap",
};


const input = {
  flex: 1,
  minWidth: 180,
  padding:
    "12px 14px",
  border:
    "1px solid #cbd5e1",
  borderRadius: 9,
  fontSize: 14,
  background: "#fff",
  color: "#334155",
};


const listHeader = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 10,
  fontSize: 13,
  fontWeight: 700,
  color: "#334155",
};


const countBadge = {
  minWidth: 22,
  height: 22,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#e2e8f0",
  color: "#475569",
  borderRadius: 999,
  fontSize: 11,
};


const ruleRow = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 15,
  padding: 13,
  marginBottom: 8,
  background: "#fff",
  border:
    "1px solid #e2e8f0",
  borderRadius: 10,
  flexWrap: "wrap",
};


const ruleIcon = {
  width: 35,
  height: 35,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9,
};


const ruleValue = {
  fontWeight: 700,
  color: "#0f172a",
  fontSize: 14,
};


const rowActions = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};


const targetedBadge = {
  background: "#dcfce7",
  color: "#15803d",
  padding:
    "5px 9px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
};


const empty = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: 16,
  background: "#fff",
  border:
    "1px dashed #cbd5e1",
  borderRadius: 10,
  color: "#64748b",
  fontSize: 13,
};


const loadingLine = {
  padding: 15,
  color: "#64748b",
  fontSize: 13,
};


const hint = {
  marginTop: 12,
  padding:
    "11px 13px",
  background: "#f5f3ff",
  color: "#6d28d9",
  borderRadius: 8,
  fontSize: 12,
};


const badge = {
  background: "#f8fafc",
  border:
    "1px solid #e2e8f0",
  color: "#475569",
  padding:
    "7px 11px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
};


const smallLabel = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 600,
};


const rolloutTop = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 15,
  flexWrap: "wrap",
};


const rolloutValue = {
  color: "#0f172a",
  fontSize: 34,
  fontWeight: 800,
  lineHeight: 1,
};


const slider = {
  width: "100%",
  height: 7,
  cursor: "pointer",
  accentColor: "#7c3aed",
};


const sliderLabels = {
  display: "flex",
  justifyContent:
    "space-between",
  color: "#94a3b8",
  fontSize: 12,
  marginTop: 7,
};


const infoBox = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  marginTop: 22,
  padding:
    "14px 16px",
  background: "#f8fafc",
  border:
    "1px solid #e2e8f0",
  borderRadius: 10,
  color: "#334155",
};


const saveRow = {
  display: "flex",
  justifyContent:
    "flex-end",
  alignItems: "center",
  gap: 12,
  marginTop: 20,
};


const saved = {
  color: "#15803d",
  fontSize: 13,
  fontWeight: 700,
};


const overrideCard = {
  padding: 16,
  background: "#fbfdff",
  border:
    "1px solid #e2e8f0",
  borderRadius: 12,
};


const overrideTitle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
};


const overrideBadge = {
  background: "#dbeafe",
  color: "#1d4ed8",
  padding:
    "5px 9px",
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 800,
};


const neutralBadge = {
  background: "#f1f5f9",
  color: "#64748b",
  padding:
    "5px 9px",
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 800,
};


const toggleLabel = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  padding: "0 5px",
  fontSize: 13,
  color: "#334155",
  whiteSpace: "nowrap",
};


const resultHeader = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  marginBottom: 12,
};


// =============================================================
// ANALYTICS STYLES
// =============================================================

const rangeButtons = {
  display: "flex",
  gap: 6,
  background: "#f8fafc",
  padding: 4,
  borderRadius: 10,
  border:
    "1px solid #e2e8f0",
};


const rangeButton = {
  border: "none",
  background: "transparent",
  color: "#64748b",
  padding:
    "7px 12px",
  borderRadius: 7,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
};


const rangeButtonActive = {
  ...rangeButton,
  background: "#7c3aed",
  color: "#fff",
};


const analyticsSummary = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 20,
  padding:
    "16px 18px",
  marginBottom: 16,
  background:
    "linear-gradient(135deg,#f5f3ff,#faf5ff)",
  border:
    "1px solid #ddd6fe",
  borderRadius: 12,
};


const analyticsTotal = {
  display: "block",
  marginTop: 4,
  fontSize: 30,
  color: "#5b21b6",
  fontWeight: 800,
};


const analyticsSummaryText = {
  color: "#7c3aed",
  fontSize: 13,
  fontWeight: 700,
};


const chartCard = {
  width: "100%",
  minHeight: 320,
  border:
    "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 15,
  background: "#fff",
};


const chartMessage = {
  minHeight: 290,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  color: "#64748b",
  fontSize: 13,
};


const emptyChartIcon = {
  fontSize: 42,
  color: "#c4b5fd",
};


export default FlagDetail;