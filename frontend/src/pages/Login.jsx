import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";


function Login() {

  const navigate = useNavigate();

  const { login } = useAuth();


  const [formData, setFormData] = useState({
    email: "",
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

      const response = await api.post(
        "/auth/login",
        formData
      );


      // Save JWT token using AuthContext
      login(
        response.data.access_token
      );


      alert("Login successful!");


      navigate("/flags");


    } catch (error) {

      console.error(error);


      setError(
        error.response?.data?.detail ||
        "Invalid email or password"
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
          width: "380px",
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
          🔐 Login
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
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />



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

            {
              loading
              ? "Logging in..."
              : "Login"
            }

          </button>



        </form>




        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >

          Don't have an account?


          <Link
            to="/signup"
            style={{
              marginLeft: "5px",
              color: "#2563eb",
            }}
          >
            Sign Up
          </Link>


        </p>



      </div>


    </div>

  );

}



const inputStyle = {

  width: "100%",

  padding: "12px",

  marginBottom: "15px",

  borderRadius: "8px",

  border:
    "1px solid #cbd5e1",

  boxSizing: "border-box",

};



const buttonStyle = {

  width: "100%",

  padding: "12px",

  background: "#2563eb",

  color: "white",

  border: "none",

  borderRadius: "8px",

  cursor: "pointer",

  fontWeight: "bold",

};



export default Login;