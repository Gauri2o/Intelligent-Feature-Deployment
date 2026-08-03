import { Link } from "react-router-dom";


function Home() {


  return (

    <div style={pageStyle}>


      <div style={overlayStyle}>


        <div style={contentStyle}>


          <h1 style={titleStyle}>
            🚀 Intelligent Feature Deployment
          </h1>



          <p style={subtitleStyle}>
            Manage, control and evaluate feature releases
            with confidence using smart feature flags.
          </p>




          <div style={buttonContainer}>


            <Link to="/login">

              <button style={loginButton}>
                Login
              </button>

            </Link>



            <Link to="/signup">

              <button style={signupButton}>
                Get Started
              </button>

            </Link>


          </div>





          <div style={cardsContainer}>


            <FeatureCard
              icon="⚡"
              title="Feature Flags"
              text="Control features instantly without redeploying."
            />


            <FeatureCard
              icon="🎯"
              title="Smart Evaluation"
              text="Evaluate features using environments and rules."
            />


            <FeatureCard
              icon="📊"
              title="Audit Tracking"
              text="Monitor every feature change securely."
            />


          </div>



        </div>


      </div>


    </div>

  );

}





function FeatureCard({
  icon,
  title,
  text
}) {


  return (

    <div style={cardStyle}>

      <h2>
        {icon} {title}
      </h2>


      <p>
        {text}
      </p>


    </div>

  );

}





const pageStyle = {

  minHeight: "100vh",

  background:
    "linear-gradient(135deg,#0f172a,#2563eb,#06b6d4)",

  display:"flex",

  justifyContent:"center",

  alignItems:"center",

};



const overlayStyle = {

  width:"100%",

  padding:"50px",

};



const contentStyle = {

  textAlign:"center",

  color:"white",

};



const titleStyle = {

  fontSize:"48px",

  fontWeight:"800",

  marginBottom:"20px",

};



const subtitleStyle = {

  fontSize:"20px",

  maxWidth:"700px",

  margin:"auto",

  lineHeight:"1.6",

};



const buttonContainer = {

  marginTop:"35px",

  display:"flex",

  justifyContent:"center",

  gap:"20px",

};



const loginButton = {

  padding:"14px 35px",

  border:"none",

  borderRadius:"10px",

  background:"#ffffff",

  color:"#2563eb",

  fontSize:"16px",

  fontWeight:"bold",

  cursor:"pointer",

};



const signupButton = {

  padding:"14px 35px",

  border:"none",

  borderRadius:"10px",

  background:"#22c55e",

  color:"white",

  fontSize:"16px",

  fontWeight:"bold",

  cursor:"pointer",

};



const cardsContainer = {

  marginTop:"60px",

  display:"flex",

  justifyContent:"center",

  gap:"25px",

  flexWrap:"wrap",

};



const cardStyle = {

  background:"rgba(255,255,255,0.15)",

  backdropFilter:"blur(10px)",

  padding:"25px",

  width:"250px",

  borderRadius:"15px",

  color:"white",

};



export default Home;