import { useEffect, useState } from "react";

function Profile() {

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "Developer",
  });

  const [saved, setSaved] = useState(false);


  /* =========================================
     LOAD PROFILE
  ========================================= */

  useEffect(() => {

    const savedProfile =
      localStorage.getItem("profile");

    if (savedProfile) {

      try {

        setProfile(
          JSON.parse(savedProfile)
        );

      } catch (error) {

        console.error(
          "Failed to load profile",
          error
        );

      }

    } else {

      const email =
        localStorage.getItem("email") || "";

      setProfile({
        name: "",
        email,
        role: "Developer",
      });

    }

  }, []);


  /* =========================================
     HANDLE CHANGE
  ========================================= */

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
  };


  /* =========================================
     SAVE PROFILE
  ========================================= */

  const handleSave = (event) => {

    event.preventDefault();

    localStorage.setItem(
      "profile",
      JSON.stringify(profile)
    );

    if (profile.email) {

      localStorage.setItem(
        "email",
        profile.email
      );

    }

    setSaved(true);

  };


  /* =========================================
     INITIALS
  ========================================= */

  const getInitials = () => {

    if (profile.name) {

      return profile.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
          (part) =>
            part.charAt(0).toUpperCase()
        )
        .join("");

    }

    if (profile.email) {
      return profile.email
        .charAt(0)
        .toUpperCase();
    }

    return "U";
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
            Profile
          </h1>

          <p>
            Manage your personal information
            and account details.
          </p>

        </div>

      </div>


      {/* ==================================
          PROFILE LAYOUT
      ================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "280px minmax(0, 1fr)",
          gap: "20px",
          marginTop: "25px",
        }}
      >

        {/* ==================================
            PROFILE CARD
        ================================== */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "28px 22px",
            textAlign: "center",
          }}
        >

          {/* Avatar */}

          <div
            style={{
              width: "78px",
              height: "78px",
              borderRadius: "50%",
              margin: "0 auto 15px",
              background:
                "linear-gradient(135deg,#7c3aed,#8b5cf6)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "25px",
              fontWeight: "800",
              boxShadow:
                "0 10px 25px rgba(124,58,237,.22)",
            }}
          >
            {getInitials()}
          </div>


          <h2
            style={{
              margin: "0",
              fontSize: "18px",
              color: "#0f172a",
            }}
          >
            {profile.name || "Your Name"}
          </h2>


          <p
            style={{
              margin: "6px 0 0",
              color: "#64748b",
              fontSize: "12px",
              wordBreak: "break-word",
            }}
          >
            {profile.email || "your@email.com"}
          </p>


          <div
            style={{
              display: "inline-flex",
              marginTop: "14px",
              padding: "5px 10px",
              borderRadius: "999px",
              background: "#f3e8ff",
              color: "#7c3aed",
              fontSize: "10px",
              fontWeight: "800",
            }}
          >
            {profile.role}
          </div>


          {/* Status */}

          <div
            style={{
              marginTop: "25px",
              paddingTop: "18px",
              borderTop:
                "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
            }}
          >

            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />

            <span
              style={{
                color: "#64748b",
                fontSize: "11px",
                fontWeight: "600",
              }}
            >
              Account Active
            </span>

          </div>

        </div>


        {/* ==================================
            EDIT PROFILE
        ================================== */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "25px",
          }}
        >

          <div
            style={{
              marginBottom: "22px",
            }}
          >

            <h2
              style={{
                margin: "0",
                fontSize: "17px",
                color: "#0f172a",
              }}
            >
              Personal Information
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#94a3b8",
                fontSize: "12px",
              }}
            >
              Update the information associated
              with your account.
            </p>

          </div>


          <form onSubmit={handleSave}>

            {/* Name */}

            <div
              style={{
                marginBottom: "18px",
              }}
            >

              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your name"
                style={inputStyle}
              />

            </div>


            {/* Email */}

            <div
              style={{
                marginBottom: "18px",
              }}
            >

              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={inputStyle}
              />

            </div>


            {/* Role */}

            <div
              style={{
                marginBottom: "22px",
              }}
            >

              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                Role
              </label>

              <select
                name="role"
                value={profile.role}
                onChange={handleChange}
                style={inputStyle}
              >

                <option value="Developer">
                  Developer
                </option>

                <option value="Team Lead">
                  Team Lead
                </option>

                <option value="Product Manager">
                  Product Manager
                </option>

                <option value="Administrator">
                  Administrator
                </option>

              </select>

            </div>


            {/* Actions */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >

              <button
                type="submit"
                className="primary-button"
              >
                Save Changes
              </button>


              {saved && (

                <span
                  style={{
                    color: "#16a34a",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  ✓ Profile saved successfully
                </span>

              )}

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}


/* =========================================
   INPUT STYLE
========================================= */

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


export default Profile;