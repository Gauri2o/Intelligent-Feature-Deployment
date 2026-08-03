import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    company: "",
    role: "Developer",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await api.post(
        "/auth/signup",
        formData
      );

      alert("Account created successfully!");

      navigate("/login");

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
        "Signup failed"
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f1f5f9",
      }}
    >

      <div
        style={{
          background: "white",
          padding: "35px",
          width: "420px",
          borderRadius: "12px",
          boxShadow:
            "0 5px 20px rgba(0,0,0,0.1)",
        }}
      >

        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          📝 Create Account
        </h2>


        {error && (
          <p
            style={{
              color: "red",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}


        <form onSubmit={handleSubmit}>

          <input
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
            required
            style={inputStyle}
          />


          <input
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            required
            style={inputStyle}
          />


          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            style={inputStyle}
          />


          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />


          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            style={inputStyle}
          />


          <input
            name="company"
            placeholder="Company"
            value={formData.company}
            onChange={handleChange}
            style={inputStyle}
          />


          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="Developer">
              Developer
            </option>

            <option value="Admin">
              Admin
            </option>
          </select>


          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />


          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading
              ? "Creating..."
              : "Sign Up"}
          </button>

        </form>


        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          Already have an account?

          <Link
            to="/login"
            style={{
              marginLeft: "5px",
              color: "#2563eb",
            }}
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}


const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};


const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};


export default Signup;