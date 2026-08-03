import { useState } from "react";
import api from "../services/api";


function EvaluateFlag() {


  const [flagKey, setFlagKey] = useState("");

  const [environmentId, setEnvironmentId] = useState(1);


  const [role, setRole] = useState("");


  const [result, setResult] = useState(null);


  const [error, setError] = useState("");





  const evaluateFlag = async (e) => {


    e.preventDefault();


    setResult(null);

    setError("");



    try {


      const response = await api.post(
        "/flags/evaluate",
        {

          flag_key: flagKey,

          environment_id:
            Number(environmentId),


          user_context: {

            role: role

          }

        }
      );



      setResult(
        response.data
      );



    }

    catch(err){


      console.error(err);


      setError(
        "Evaluation failed"
      );


    }


  };






  return (

    <div
      style={{
        padding:"30px"
      }}
    >


      <h1>
        🎯 Feature Flag Evaluation
      </h1>



      <form
        onSubmit={evaluateFlag}
      >



        <input

          style={input}

          placeholder="Flag Key"

          value={flagKey}

          onChange={
            (e)=>
            setFlagKey(
              e.target.value
            )
          }

          required

        />




        <input

          style={input}

          type="number"

          value={environmentId}

          onChange={
            (e)=>
            setEnvironmentId(
              e.target.value
            )
          }

          placeholder="Environment ID"

        />





        <input

          style={input}

          placeholder="User Role (admin/user)"

          value={role}

          onChange={
            (e)=>
            setRole(
              e.target.value
            )
          }

        />





        <button

          style={button}

        >

          Evaluate Feature

        </button>



      </form>






      {
        error &&

        <h3
          style={{
            color:"red"
          }}
        >

          {error}

        </h3>
      }







      {
        result &&


        <div

          style={resultBox}

        >

          <h2>
            Evaluation Result
          </h2>



          <p>
            <b>Flag:</b>
            {" "}
            {result.flag_key}
          </p>




          <p>

            <b>Status:</b>

            {

              result.enabled

              ?

              " 🟢 Enabled"

              :

              " 🔴 Disabled"

            }

          </p>




          <p>

            <b>Reason:</b>

            {" "}

            {result.reason}

          </p>




        </div>


      }



    </div>

  );

}





const input = {

  display:"block",

  width:"350px",

  padding:"12px",

  marginBottom:"15px",

  borderRadius:"8px",

  border:"1px solid #ccc"

};





const button = {

  background:"#2563eb",

  color:"white",

  border:"none",

  padding:"12px 25px",

  borderRadius:"8px",

  cursor:"pointer"

};





const resultBox = {

  marginTop:"30px",

  padding:"20px",

  background:"#f1f5f9",

  borderRadius:"10px",

  width:"400px"

};





export default EvaluateFlag;