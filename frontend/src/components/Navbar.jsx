import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function Navbar() {


  const navigate = useNavigate();


  const {
    token,
    user,
    logout
  } = useAuth();




  const handleLogout = () => {

    logout();

    navigate("/login");

  };




  return (

    <nav

      style={{

        display: "flex",

        justifyContent: "space-between",

        alignItems: "center",

        padding: "15px 30px",

        background: "#1e293b",

        color: "white"

      }}

    >


      <h2>
        🚀 Feature Deployment
      </h2>




      <div

        style={{

          display: "flex",

          alignItems: "center",

          gap: "18px"

        }}

      >



      {
        token ?

        <>


          <Link
            to="/flags"
            style={linkStyle}
          >
            Dashboard
          </Link>




          <Link
            to="/create-flag"
            style={linkStyle}
          >
            ➕ Create Flag
          </Link>




          <Link
            to="/audit"
            style={linkStyle}
          >
            📋 Audit Logs
          </Link>




          <div

            style={{

              marginLeft:"10px",

              textAlign:"right"

            }}

          >

            <div>
              👤 {user?.username || "User"}
            </div>


            <small>
              {user?.role || "Developer"}
            </small>


          </div>





          <button

            onClick={handleLogout}

            style={logoutButton}

          >

            Logout

          </button>



        </>


        :


        <>


          <Link
            to="/login"
            style={linkStyle}
          >
            Login
          </Link>



          <Link
            to="/signup"
            style={linkStyle}
          >
            Signup
          </Link>


        </>


      }



      </div>


    </nav>

  );

}




const linkStyle = {

  color: "white",

  textDecoration: "none",

};




const logoutButton = {

  background: "#dc2626",

  color: "white",

  border: "none",

  padding: "8px 15px",

  borderRadius: "6px",

  cursor: "pointer"

};



export default Navbar;