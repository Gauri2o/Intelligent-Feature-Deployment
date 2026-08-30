import { useEffect, useState } from "react";

function Settings() {

  const [settings, setSettings] = useState({
    defaultEnvironment: "development",
    emailNotifications: true,
    auditNotifications: true,
    rolloutProtection: true,
    confirmDangerousActions: true,
  });

  const [saved, setSaved] = useState(false);


  /* =========================================
     LOAD SETTINGS
  ========================================= */

  useEffect(() => {

    const savedSettings =
      localStorage.getItem("app_settings");

    if (savedSettings) {

      try {

        setSettings(
          JSON.parse(savedSettings)
        );

      } catch (error) {

        console.error(
          "Failed to load settings",
          error
        );

      }

    }

  }, []);


  /* =========================================
     UPDATE SETTING
  ========================================= */

  const updateSetting = (
    name,
    value
  ) => {

    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
  };


  /* =========================================
     SAVE SETTINGS
  ========================================= */

  const handleSave = () => {

    localStorage.setItem(
      "app_settings",
      JSON.stringify(settings)
    );

    localStorage.setItem(
      "environment",
      settings.defaultEnvironment
    );

    setSaved(true);

  };


  return (

    <div className="content-page">

      {/* ==================================
          HEADER
      ================================== */}

      <div className="dashboard-header">

        <div className="dashboard-heading">

          <div className="page-eyebrow">
            ACCOUNT
          </div>

          <h1>
            Settings
          </h1>

          <p>
            Configure your FeatureFlow
            workspace preferences.
          </p>

        </div>

      </div>


      {/* ==================================
          SETTINGS CONTENT
      ================================== */}

      <div
        style={{
          maxWidth: "850px",
          marginTop: "25px",
        }}
      >

        {/* ==================================
            ENVIRONMENT
        ================================== */}

        <div style={settingsCard}>

          <div style={cardHeader}>

            <div>

              <h2 style={cardTitle}>
                Default Environment
              </h2>

              <p style={cardDescription}>
                Choose the environment used by
                default when working with flags.
              </p>

            </div>

            <div style={cardIcon}>
              ◉
            </div>

          </div>


          <label style={fieldLabel}>
            Environment
          </label>

          <select
            value={settings.defaultEnvironment}
            onChange={(event) =>
              updateSetting(
                "defaultEnvironment",
                event.target.value
              )
            }
            style={inputStyle}
          >

            <option value="development">
              Development
            </option>

            <option value="staging">
              Staging
            </option>

            <option value="production">
              Production
            </option>

          </select>

        </div>


        {/* ==================================
            NOTIFICATIONS
        ================================== */}

        <div style={settingsCard}>

          <div style={cardHeader}>

            <div>

              <h2 style={cardTitle}>
                Notifications
              </h2>

              <p style={cardDescription}>
                Control which activity notifications
                you want to receive.
              </p>

            </div>

            <div style={cardIcon}>
              ◌
            </div>

          </div>


          <SettingToggle
            title="Email Notifications"
            description="Receive important deployment and account notifications."
            checked={settings.emailNotifications}
            onChange={(value) =>
              updateSetting(
                "emailNotifications",
                value
              )
            }
          />


          <SettingToggle
            title="Audit Activity"
            description="Get notified when important feature flag changes occur."
            checked={settings.auditNotifications}
            onChange={(value) =>
              updateSetting(
                "auditNotifications",
                value
              )
            }
          />

        </div>


        {/* ==================================
            SAFETY
        ================================== */}

        <div style={settingsCard}>

          <div style={cardHeader}>

            <div>

              <h2 style={cardTitle}>
                Deployment Safety
              </h2>

              <p style={cardDescription}>
                Protect your application from
                accidental feature changes.
              </p>

            </div>

            <div style={cardIcon}>
              ⚡
            </div>

          </div>


          <SettingToggle
            title="Rollout Protection"
            description="Require safer controls when changing percentage rollouts."
            checked={settings.rolloutProtection}
            onChange={(value) =>
              updateSetting(
                "rolloutProtection",
                value
              )
            }
          />


          <SettingToggle
            title="Confirm Dangerous Actions"
            description="Ask for confirmation before disabling important flags."
            checked={settings.confirmDangerousActions}
            onChange={(value) =>
              updateSetting(
                "confirmDangerousActions",
                value
              )
            }
          />

        </div>


        {/* ==================================
            SAVE
        ================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginTop: "20px",
            marginBottom: "40px",
          }}
        >

          <button
            className="primary-button"
            onClick={handleSave}
          >
            Save Settings
          </button>


          {saved && (

            <span
              style={{
                color: "#16a34a",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              ✓ Settings saved successfully
            </span>

          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================
   TOGGLE COMPONENT
========================================= */

function SettingToggle({
  title,
  description,
  checked,
  onChange,
}) {

  return (

    <div style={toggleRow}>

      <div
        style={{
          flex: 1,
          paddingRight: "20px",
        }}
      >

        <div style={toggleTitle}>
          {title}
        </div>

        <div style={toggleDescription}>
          {description}
        </div>

      </div>


      <button
        type="button"
        onClick={() =>
          onChange(!checked)
        }
        aria-label={title}
        style={{
          ...toggleButton,
          background: checked
            ? "#7c3aed"
            : "#cbd5e1",
        }}
      >

        <span
          style={{
            ...toggleCircle,
            transform: checked
              ? "translateX(20px)"
              : "translateX(2px)",
          }}
        />

      </button>

    </div>
  );
}


/* =========================================
   STYLES
========================================= */

const settingsCard = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "23px",
  marginBottom: "15px",
  boxShadow:
    "0 6px 22px rgba(15,23,42,.035)",
};


const cardHeader = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "15px",
  marginBottom: "20px",
};


const cardTitle = {
  margin: 0,
  fontSize: "16px",
  color: "#0f172a",
};


const cardDescription = {
  margin: "6px 0 0",
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "1.6",
};


const cardIcon = {
  width: "36px",
  height: "36px",
  borderRadius: "9px",
  background: "#f3e8ff",
  color: "#7c3aed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "15px",
  flexShrink: 0,
};


const fieldLabel = {
  display: "block",
  marginBottom: "7px",
  color: "#334155",
  fontSize: "12px",
  fontWeight: "700",
};


const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
};


const toggleRow = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  padding: "15px 0",
  borderTop: "1px solid #f1f5f9",
};


const toggleTitle = {
  color: "#334155",
  fontSize: "13px",
  fontWeight: "700",
};


const toggleDescription = {
  marginTop: "4px",
  color: "#94a3b8",
  fontSize: "11px",
  lineHeight: "1.5",
};


const toggleButton = {
  position: "relative",
  width: "44px",
  height: "24px",
  padding: 0,
  border: "none",
  borderRadius: "999px",
  cursor: "pointer",
  transition: "background .2s ease",
  flexShrink: 0,
};


const toggleCircle = {
  position: "absolute",
  top: "2px",
  left: 0,
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  background: "#ffffff",
  boxShadow:
    "0 1px 4px rgba(15,23,42,.2)",
  transition: "transform .2s ease",
};


export default Settings;