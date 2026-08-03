import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";


function FlagPage() {


  const [flags, setFlags] = useState([]);

  const [environments, setEnvironments] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);




  useEffect(() => {

    fetchData();

  }, []);





  const fetchData = async () => {

    try {

      setLoading(true);


      const flagResponse =
        await api.get("/flags/");


      const envResponse =
        await api.get("/environments/");



      setFlags(
        flagResponse.data
      );


      setEnvironments(
        envResponse.data
      );


    }

    catch(error){

      console.error(
        "Failed to load dashboard",
        error
      );

    }


    finally{

      setLoading(false);

    }

  };





  // Environment id -> name

  const getEnvironmentName = (id) => {


    const environment =
      environments.find(
        (env) =>
          env.id === id
      );


    return environment
      ? environment.name
      : "Unknown";

  };






  const deleteFlag = async (key) => {


    const confirmDelete =
      window.confirm(
        "Delete this flag?"
      );



    if(!confirmDelete)
      return;




    try{


      await api.delete(
        `/flags/${key}`
      );



      alert(
        "Flag deleted successfully"
      );


      fetchData();



    }

    catch(error){

      console.error(error);


      alert(
        "Delete failed"
      );

    }

  };






  const enabledCount =
    flags.filter(
      (flag)=>flag.enabled
    ).length;




  const disabledCount =
    flags.length - enabledCount;






  const filteredFlags =
    flags.filter(

      (flag)=>

        flag.flag_key
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )

    );





  if(loading){


    return (

      <h2
        style={{
          padding:"30px"
        }}
      >

        Loading Dashboard...

      </h2>

    );

  }
    return (

    <div

      style={{

        padding:"30px",

        background:"#f1f5f9",

        minHeight:"100vh"

      }}

    >


      <h1>
        🚀 Feature Flag Dashboard
      </h1>





      <div

        style={{

          display:"flex",

          gap:"20px",

          margin:"25px 0",

          flexWrap:"wrap"

        }}

      >


        <Card
          title="Total Flags"
          value={flags.length}
        />


        <Card
          title="Enabled"
          value={enabledCount}
        />


        <Card
          title="Disabled"
          value={disabledCount}
        />


        <Card
          title="Environments"
          value={environments.length}
        />


      </div>






      <div

        style={{

          display:"flex",

          justifyContent:"space-between",

          marginBottom:"20px"

        }}

      >



        <input

          placeholder="Search Flag..."

          value={search}

          onChange={
            (e)=>
            setSearch(
              e.target.value
            )
          }

          style={inputStyle}

        />




        <Link to="/create-flag">


          <button

            style={createButton}

          >

            + Create Flag


          </button>


        </Link>



      </div>







      {

        filteredFlags.length === 0 ?


        (

          <div

            style={{

              background:"white",

              padding:"30px",

              borderRadius:"10px"

            }}

          >

            <h3>
              No flags found 🚩
            </h3>


            <p>
              Create your first feature flag.
            </p>


          </div>

        )

        :



        (

        <table

          style={{

            width:"100%",

            background:"white",

            borderCollapse:"collapse"

          }}

        >


          <thead

            style={{

              background:"#1e293b",

              color:"white"

            }}

          >

            <tr>

              <th style={th}>
                Flag Key
              </th>


              <th style={th}>
                Type
              </th>


              <th style={th}>
                Environment
              </th>


              <th style={th}>
                Status
              </th>


              <th style={th}>
                Owner
              </th>


              <th style={th}>
                Actions
              </th>


            </tr>


          </thead>





          <tbody>


          {

            filteredFlags.map(

              (flag)=>(


              <tr key={flag.id}>


                <td style={td}>


                  <Link

                    to={`/flag/${flag.flag_key}`}

                  >

                    {flag.flag_key}

                  </Link>


                </td>




                <td style={td}>
                  {flag.type}
                </td>




                <td style={td}>

                  {
                    getEnvironmentName(
                      flag.environment_id
                    )
                  }

                </td>





                <td style={td}>

                  {

                    flag.enabled

                    ?

                    "🟢 Enabled"

                    :

                    "🔴 Disabled"

                  }

                </td>





                <td style={td}>
                  {flag.owner_team}
                </td>





                <td style={td}>


                  <Link

                    to={`/edit-flag/${flag.flag_key}`}

                  >

                    <button style={editButton}>

                      ✏ Edit

                    </button>


                  </Link>





                  <button

                    onClick={() =>
                      deleteFlag(
                        flag.flag_key
                      )
                    }

                    style={deleteButton}

                  >

                    🗑 Delete

                  </button>


                </td>


              </tr>


              )

            )

          }


          </tbody>


        </table>


        )

      }



    </div>


  );

}






function Card({title,value}){


  return (

    <div

      style={{

        background:"#2563eb",

        color:"white",

        padding:"20px",

        borderRadius:"10px",

        width:"180px"

      }}

    >

      <h3>
        {title}
      </h3>

      <h1>
        {value}
      </h1>


    </div>

  );


}






const inputStyle={

  padding:"10px",

  width:"280px",

  borderRadius:"8px",

  border:"1px solid #ccc"

};




const createButton={

  background:"#16a34a",

  color:"white",

  border:"none",

  padding:"10px 18px",

  borderRadius:"8px",

  cursor:"pointer"

};




const th={

  padding:"12px"

};




const td={

  padding:"12px",

  borderBottom:"1px solid #ddd"

};




const editButton={

  background:"#2563eb",

  color:"white",

  border:"none",

  padding:"8px",

  borderRadius:"5px",

  marginRight:"8px"

};




const deleteButton={

  background:"#dc2626",

  color:"white",

  border:"none",

  padding:"8px",

  borderRadius:"5px"

};




export default FlagPage;