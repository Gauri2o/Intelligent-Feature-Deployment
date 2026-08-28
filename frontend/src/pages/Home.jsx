import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={pageStyle}>
      {/* ================= NAVBAR ================= */}

      <header style={navbar}>
        <div style={navInner}>
          <Link to="/" style={brand}>
            <div style={brandIcon}>⚡</div>

            <div>
              <div style={brandName}>FlagCtrl</div>
              <div style={brandSub}>Feature Management</div>
            </div>
          </Link>

          <nav style={navLinks}>
            <a href="#features" style={navLink}>
              Features
            </a>

            <a href="#how-it-works" style={navLink}>
              How it works
            </a>

            <a href="#about" style={navLink}>
              About
            </a>
          </nav>

          <div style={navActions}>
            <Link to="/login" style={loginLink}>
              Login
            </Link>

            <Link to="/signup" style={navSignup}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <main>
        <section style={heroSection}>
          <div style={heroContent}>
            <div style={heroBadge}>
              <span style={badgeDot}></span>
              Intelligent Feature Deployment
            </div>

            <h1 style={heroTitle}>
              Ship features with
              <span style={heroAccent}> confidence.</span>
            </h1>

            <p style={heroSubtitle}>
              Manage feature flags, control rollouts, target users and
              evaluate releases across environments — all from one
              powerful dashboard.
            </p>

            <div style={heroActions}>
              <Link to="/signup" style={primaryHeroButton}>
                Get Started
                <span>→</span>
              </Link>

              <Link to="/login" style={secondaryHeroButton}>
                Sign in
              </Link>
            </div>

            <div style={trustText}>
              <span>✓ Environment aware</span>
              <span>✓ User targeting</span>
              <span>✓ Percentage rollout</span>
            </div>
          </div>

          {/* Dashboard Preview */}

          <div style={previewWrapper}>
            <div style={browserWindow}>
              <div style={browserHeader}>
                <div style={browserDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div style={browserAddress}>
                  app.flagctrl.local/dashboard
                </div>
              </div>

              <div style={dashboardPreview}>
                {/* Sidebar */}

                <aside style={previewSidebar}>
                  <div style={previewLogo}>
                    <span>⚡</span>
                    FlagCtrl
                  </div>

                  <div style={sidebarItemActive}>
                    <span>▦</span>
                    Overview
                  </div>

                  <div style={sidebarItem}>
                    <span>⚑</span>
                    Flags
                  </div>

                  <div style={sidebarItem}>
                    <span>□</span>
                    Environments
                  </div>

                  <div style={sidebarItem}>
                    <span>◎</span>
                    Targeting
                  </div>

                  <div style={sidebarItem}>
                    <span>◷</span>
                    Audit Log
                  </div>

                  <div style={sidebarItem}>
                    <span>▥</span>
                    Analytics
                  </div>
                </aside>

                {/* Main preview */}

                <div style={previewMain}>
                  <div style={previewTop}>
                    <div>
                      <div style={previewEyebrow}>
                        DASHBOARD
                      </div>

                      <div style={previewTitle}>
                        Overview
                      </div>
                    </div>

                    <div style={previewDate}>
                      August 2026
                    </div>
                  </div>

                  {/* Stats */}

                  <div style={previewStats}>
                    <PreviewStat
                      label="Active Flags"
                      value="42"
                      icon="⚡"
                      tone="blue"
                    />

                    <PreviewStat
                      label="Evaluations Today"
                      value="284K"
                      icon="◎"
                      tone="purple"
                    />

                    <PreviewStat
                      label="In Rollout"
                      value="8"
                      icon="↗"
                      tone="green"
                    />

                    <PreviewStat
                      label="Disabled"
                      value="6"
                      icon="○"
                      tone="gray"
                    />
                  </div>

                  {/* Lower preview */}

                  <div style={previewGrid}>
                    <div style={chartCard}>
                      <div style={previewCardHeader}>
                        <div>
                          <strong>Flag Evaluations</strong>
                          <small>Requests per feature flag</small>
                        </div>

                        <span style={chartBadge}>Today</span>
                      </div>

                      <div style={chartArea}>
                        <ChartBar
                          height="85%"
                          label="new_checkout"
                        />

                        <ChartBar
                          height="68%"
                          label="dark_mode"
                        />

                        <ChartBar
                          height="53%"
                          label="ai_search"
                        />

                        <ChartBar
                          height="42%"
                          label="beta_dash"
                        />

                        <ChartBar
                          height="31%"
                          label="v2_api"
                        />

                        <ChartBar
                          height="22%"
                          label="exp_feed"
                        />
                      </div>
                    </div>

                    <div style={changesCard}>
                      <div style={previewCardHeader}>
                        <div>
                          <strong>Recent Changes</strong>
                          <small>Latest flag activity</small>
                        </div>
                      </div>

                      <ChangeRow
                        flag="new_checkout"
                        text="Rollout 20% → 50%"
                        badge="Rollout"
                      />

                      <ChangeRow
                        flag="dark_mode"
                        text="Added group target"
                        badge="Targeted"
                      />

                      <ChangeRow
                        flag="ai_search"
                        text="Feature disabled"
                        badge="Disabled"
                      />

                      <ChangeRow
                        flag="exp_feed"
                        text="Targeting rule updated"
                        badge="Updated"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}

        <section id="features" style={sectionStyle}>
          <div style={sectionHeading}>
            <div style={sectionBadge}>POWERFUL CONTROLS</div>

            <h2 style={sectionTitle}>
              Everything you need to
              <span style={sectionAccent}> ship safely.</span>
            </h2>

            <p style={sectionSubtitle}>
              Replace risky deployments with controlled, observable and
              reversible feature releases.
            </p>
          </div>

          <div style={featureGrid}>
            <FeatureCard
              icon="⚡"
              iconBackground="#eff6ff"
              iconColor="#2563eb"
              title="Feature Flags"
              text="Enable or disable features instantly without redeploying your application."
            />

            <FeatureCard
              icon="🎯"
              iconBackground="#f5f3ff"
              iconColor="#7c3aed"
              title="Smart Targeting"
              text="Target individual users or groups with precise evaluation rules."
            />

            <FeatureCard
              icon="🚀"
              iconBackground="#ecfdf5"
              iconColor="#16a34a"
              title="Percentage Rollouts"
              text="Gradually release features to a controlled percentage of users."
            />

            <FeatureCard
              icon="🌎"
              iconBackground="#ecfeff"
              iconColor="#0891b2"
              title="Environments"
              text="Keep Development, Staging and Production configurations separated."
            />

            <FeatureCard
              icon="📊"
              iconBackground="#fff7ed"
              iconColor="#ea580c"
              title="Evaluation"
              text="Test exactly how a feature resolves for a specific user and environment."
            />

            <FeatureCard
              icon="📝"
              iconBackground="#f8fafc"
              iconColor="#475569"
              title="Audit Tracking"
              text="Keep visibility into feature changes and deployment activity."
            />
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}

        <section id="how-it-works" style={workflowSection}>
          <div style={sectionHeading}>
            <div style={sectionBadge}>SIMPLE WORKFLOW</div>

            <h2 style={sectionTitle}>
              From code to controlled release.
            </h2>

            <p style={sectionSubtitle}>
              A simple workflow designed to give your team confidence
              before and after deployment.
            </p>
          </div>

          <div style={stepsGrid}>
            <StepCard
              number="01"
              title="Create a flag"
              text="Create a feature flag and configure its default behavior."
            />

            <StepCard
              number="02"
              title="Add targeting"
              text="Target users, groups or gradually roll the feature out."
            />

            <StepCard
              number="03"
              title="Evaluate"
              text="Test the final result for different users and environments."
            />

            <StepCard
              number="04"
              title="Ship confidently"
              text="Release safely and adjust the rollout whenever needed."
            />
          </div>
        </section>

        {/* ================= CTA ================= */}

        <section id="about" style={ctaSection}>
          <div style={ctaCard}>
            <div style={ctaGlow}></div>

            <div style={ctaContent}>
              <div style={ctaBadge}>READY TO DEPLOY?</div>

              <h2 style={ctaTitle}>
                Make every release
                <br />
                more predictable.
              </h2>

              <p style={ctaText}>
                Start managing your feature releases with FlagCtrl.
              </p>

              <Link to="/signup" style={ctaButton}>
                Create your account
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}

      <footer style={footer}>
        <div style={footerInner}>
          <div style={brand}>
            <div style={brandIcon}>⚡</div>

            <div>
              <div style={brandName}>FlagCtrl</div>
              <div style={brandSub}>Feature Management</div>
            </div>
          </div>

          <div style={footerText}>
            Intelligent Feature Deployment
          </div>

          <div style={footerCopy}>
            © 2026 FlagCtrl
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =========================================
   REUSABLE COMPONENTS
========================================= */

function FeatureCard({
  icon,
  iconBackground,
  iconColor,
  title,
  text,
}) {
  return (
    <div style={featureCard}>
      <div
        style={{
          ...featureIcon,
          background: iconBackground,
          color: iconColor,
        }}
      >
        {icon}
      </div>

      <h3 style={featureTitle}>{title}</h3>

      <p style={featureText}>{text}</p>

      <div style={featureArrow}>Learn more →</div>
    </div>
  );
}

function StepCard({
  number,
  title,
  text,
}) {
  return (
    <div style={stepCard}>
      <div style={stepNumber}>{number}</div>

      <div style={stepLine}></div>

      <h3 style={stepTitle}>{title}</h3>

      <p style={stepText}>{text}</p>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  icon,
  tone,
}) {
  const tones = {
    blue: {
      background: "#eff6ff",
      color: "#2563eb",
    },

    purple: {
      background: "#f5f3ff",
      color: "#7c3aed",
    },

    green: {
      background: "#ecfdf5",
      color: "#16a34a",
    },

    gray: {
      background: "#f8fafc",
      color: "#64748b",
    },
  };

  return (
    <div style={previewStat}>
      <div
        style={{
          ...previewStatIcon,
          background: tones[tone].background,
          color: tones[tone].color,
        }}
      >
        {icon}
      </div>

      <div>
        <div style={previewStatLabel}>{label}</div>
        <div style={previewStatValue}>{value}</div>
      </div>
    </div>
  );
}

function ChartBar({
  height,
  label,
}) {
  return (
    <div style={chartColumn}>
      <div
        style={{
          ...chartBar,
          height,
        }}
      ></div>

      <span style={chartLabel}>{label}</span>
    </div>
  );
}

function ChangeRow({
  flag,
  text,
  badge,
}) {
  return (
    <div style={changeRow}>
      <div>
        <strong style={changeFlag}>{flag}</strong>

        <div style={changeText}>{text}</div>
      </div>

      <span style={changeBadge}>{badge}</span>
    </div>
  );
}

/* =========================================
   PAGE
========================================= */

const pageStyle = {
  minHeight: "100vh",
  background: "#f8fafc",
  color: "#0f172a",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

/* =========================================
   NAVBAR
========================================= */

const navbar = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  background: "rgba(255,255,255,.92)",
  backdropFilter: "blur(14px)",
  borderBottom: "1px solid #e2e8f0",
};

const navInner = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "13px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "25px",
};

const brand = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  textDecoration: "none",
  color: "#0f172a",
};

const brandIcon = {
  width: "34px",
  height: "34px",
  borderRadius: "9px",
  background: "#7c3aed",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "17px",
  boxShadow: "0 5px 15px rgba(124,58,237,.22)",
};

const brandName = {
  fontSize: "15px",
  fontWeight: "800",
  lineHeight: 1,
};

const brandSub = {
  fontSize: "9px",
  color: "#94a3b8",
  marginTop: "3px",
};

const navLinks = {
  display: "flex",
  alignItems: "center",
  gap: "28px",
};

const navLink = {
  textDecoration: "none",
  color: "#64748b",
  fontSize: "13px",
  fontWeight: "600",
};

const navActions = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const loginLink = {
  textDecoration: "none",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "700",
  padding: "9px 13px",
};

const navSignup = {
  textDecoration: "none",
  color: "white",
  background: "#7c3aed",
  padding: "9px 15px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "700",
};

/* =========================================
   HERO
========================================= */

const heroSection = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "85px 24px 75px",
};

const heroContent = {
  textAlign: "center",
  maxWidth: "800px",
  margin: "0 auto",
};

const heroBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "7px 12px",
  borderRadius: "999px",
  background: "#f5f3ff",
  border: "1px solid #ddd6fe",
  color: "#6d28d9",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: ".5px",
};

const badgeDot = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#8b5cf6",
};

const heroTitle = {
  margin: "22px 0 18px",
  fontSize: "clamp(42px, 6vw, 68px)",
  lineHeight: "1.04",
  letterSpacing: "-2.5px",
  fontWeight: "850",
  color: "#0f172a",
};

const heroAccent = {
  color: "#7c3aed",
};

const heroSubtitle = {
  maxWidth: "700px",
  margin: "0 auto",
  color: "#64748b",
  fontSize: "17px",
  lineHeight: "1.7",
};

const heroActions = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  marginTop: "32px",
  flexWrap: "wrap",
};

const primaryHeroButton = {
  display: "inline-flex",
  alignItems: "center",
  gap: "12px",
  textDecoration: "none",
  background: "#7c3aed",
  color: "white",
  padding: "13px 21px",
  borderRadius: "9px",
  fontSize: "14px",
  fontWeight: "800",
  boxShadow: "0 10px 25px rgba(124,58,237,.22)",
};

const secondaryHeroButton = {
  display: "inline-flex",
  alignItems: "center",
  textDecoration: "none",
  background: "white",
  color: "#334155",
  border: "1px solid #cbd5e1",
  padding: "13px 21px",
  borderRadius: "9px",
  fontSize: "14px",
  fontWeight: "700",
};

const trustText = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  flexWrap: "wrap",
  marginTop: "24px",
  color: "#94a3b8",
  fontSize: "11px",
  fontWeight: "600",
};

/* =========================================
   DASHBOARD PREVIEW
========================================= */

const previewWrapper = {
  marginTop: "65px",
  perspective: "1200px",
};

const browserWindow = {
  maxWidth: "1080px",
  margin: "0 auto",
  background: "white",
  border: "1px solid #dbe2ea",
  borderRadius: "15px",
  overflow: "hidden",
  boxShadow:
    "0 30px 80px rgba(15,23,42,.13), 0 5px 20px rgba(15,23,42,.05)",
};

const browserHeader = {
  height: "36px",
  display: "flex",
  alignItems: "center",
  gap: "25px",
  padding: "0 13px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

const browserDots = {
  display: "flex",
  gap: "5px",
};

const browserAddress = {
  flex: 1,
  maxWidth: "400px",
  margin: "0 auto",
  textAlign: "center",
  fontSize: "9px",
  color: "#94a3b8",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "5px",
  padding: "4px",
};

const dashboardPreview = {
  display: "flex",
  minHeight: "465px",
  background: "#f8fafc",
};

const previewSidebar = {
  width: "145px",
  flexShrink: 0,
  background: "white",
  borderRight: "1px solid #e2e8f0",
  padding: "16px 10px",
};

const previewLogo = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  fontSize: "11px",
  fontWeight: "800",
  marginBottom: "22px",
  padding: "0 7px",
};

const sidebarItem = {
  padding: "8px 8px",
  color: "#64748b",
  fontSize: "9px",
  display: "flex",
  gap: "8px",
  alignItems: "center",
  borderRadius: "6px",
  marginBottom: "3px",
};

const sidebarItemActive = {
  ...sidebarItem,
  background: "#f3e8ff",
  color: "#7c3aed",
  fontWeight: "700",
};

const previewMain = {
  flex: 1,
  padding: "22px",
  minWidth: 0,
};

const previewTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
};

const previewEyebrow = {
  fontSize: "7px",
  letterSpacing: "1px",
  fontWeight: "800",
  color: "#8b5cf6",
};

const previewTitle = {
  fontSize: "18px",
  fontWeight: "800",
  marginTop: "3px",
};

const previewDate = {
  fontSize: "8px",
  color: "#7c3aed",
  background: "#f5f3ff",
  padding: "6px 9px",
  borderRadius: "999px",
};

const previewStats = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: "9px",
  marginBottom: "10px",
};

const previewStat = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "11px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const previewStatIcon = {
  width: "27px",
  height: "27px",
  borderRadius: "7px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "11px",
};

const previewStatLabel = {
  fontSize: "7px",
  color: "#64748b",
};

const previewStatValue = {
  fontSize: "15px",
  fontWeight: "800",
  marginTop: "2px",
};

const previewGrid = {
  display: "grid",
  gridTemplateColumns: "1.45fr 1fr",
  gap: "10px",
};

const chartCard = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "12px",
  minHeight: "225px",
};

const changesCard = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "12px",
  minHeight: "225px",
};

const previewCardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "12px",
};

const previewCardHeaderText = {};

const chartBadge = {
  fontSize: "7px",
  color: "#2563eb",
  background: "#eff6ff",
  padding: "4px 6px",
  borderRadius: "5px",
};

const chartArea = {
  height: "160px",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-around",
  gap: "8px",
  borderBottom: "1px solid #e2e8f0",
};

const chartColumn = {
  height: "100%",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "5px",
};

const chartBar = {
  width: "65%",
  minHeight: "10px",
  background: "#8b5cf6",
  borderRadius: "3px 3px 0 0",
};

const chartLabel = {
  fontSize: "6px",
  color: "#94a3b8",
  whiteSpace: "nowrap",
};

const changeRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px",
  padding: "10px 0",
  borderBottom: "1px solid #f1f5f9",
};

const changeFlag = {
  fontSize: "8px",
  color: "#334155",
};

const changeText = {
  fontSize: "7px",
  color: "#94a3b8",
  marginTop: "3px",
};

const changeBadge = {
  fontSize: "6px",
  padding: "4px 6px",
  borderRadius: "999px",
  background: "#f5f3ff",
  color: "#7c3aed",
  fontWeight: "700",
};

/* =========================================
   FEATURES
========================================= */

const sectionStyle = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "80px 24px",
};

const sectionHeading = {
  textAlign: "center",
  maxWidth: "720px",
  margin: "0 auto 40px",
};

const sectionBadge = {
  color: "#7c3aed",
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "1.5px",
};

const sectionTitle = {
  margin: "8px 0 12px",
  fontSize: "34px",
  letterSpacing: "-1px",
  color: "#0f172a",
};

const sectionAccent = {
  color: "#7c3aed",
};

const sectionSubtitle = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "1.7",
  margin: 0,
};

const featureGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(280px,1fr))",
  gap: "14px",
};

const featureCard = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "22px",
  minHeight: "185px",
  transition: "all .2s ease",
};

const featureIcon = {
  width: "42px",
  height: "42px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "19px",
  marginBottom: "16px",
};

const featureTitle = {
  margin: "0 0 7px",
  fontSize: "16px",
};

const featureText = {
  margin: 0,
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "1.6",
};

const featureArrow = {
  marginTop: "16px",
  color: "#7c3aed",
  fontSize: "11px",
  fontWeight: "800",
};

/* =========================================
   WORKFLOW
========================================= */

const workflowSection = {
  background: "white",
  borderTop: "1px solid #e2e8f0",
  borderBottom: "1px solid #e2e8f0",
  padding: "80px 24px",
};

const stepsGrid = {
  maxWidth: "1100px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "25px",
};

const stepCard = {
  position: "relative",
  padding: "5px 10px",
};

const stepNumber = {
  color: "#8b5cf6",
  fontSize: "11px",
  fontWeight: "900",
  letterSpacing: "1px",
};

const stepLine = {
  width: "35px",
  height: "2px",
  background: "#ddd6fe",
  margin: "10px 0 18px",
};

const stepTitle = {
  margin: 0,
  fontSize: "17px",
};

const stepText = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "1.6",
};

/* =========================================
   CTA
========================================= */

const ctaSection = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "80px 24px",
};

const ctaCard = {
  position: "relative",
  overflow: "hidden",
  borderRadius: "22px",
  background:
    "linear-gradient(135deg,#1e1b4b,#312e81,#6d28d9)",
  padding: "65px 30px",
  textAlign: "center",
  boxShadow: "0 25px 60px rgba(79,70,229,.2)",
};

const ctaGlow = {
  position: "absolute",
  width: "300px",
  height: "300px",
  borderRadius: "50%",
  background: "rgba(255,255,255,.07)",
  top: "-150px",
  right: "-50px",
};

const ctaContent = {
  position: "relative",
  zIndex: 1,
};

const ctaBadge = {
  color: "#ddd6fe",
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "1.5px",
};

const ctaTitle = {
  color: "white",
  fontSize: "38px",
  lineHeight: "1.15",
  letterSpacing: "-1px",
  margin: "12px 0",
};

const ctaText = {
  color: "#c4b5fd",
  fontSize: "14px",
  marginBottom: "25px",
};

const ctaButton = {
  display: "inline-flex",
  alignItems: "center",
  gap: "12px",
  textDecoration: "none",
  background: "white",
  color: "#5b21b6",
  padding: "13px 20px",
  borderRadius: "9px",
  fontSize: "13px",
  fontWeight: "800",
};

/* =========================================
   FOOTER
========================================= */

const footer = {
  background: "white",
  borderTop: "1px solid #e2e8f0",
};

const footerInner = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "22px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  flexWrap: "wrap",
};

const footerText = {
  color: "#94a3b8",
  fontSize: "11px",
};

const footerCopy = {
  color: "#94a3b8",
  fontSize: "11px",
};

/* =========================================
   EXPORT
========================================= */

export default Home;