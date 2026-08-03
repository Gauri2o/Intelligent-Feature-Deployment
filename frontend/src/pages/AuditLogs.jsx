import { useEffect, useState } from "react";
import api from "../services/api";


function AuditLogs() {

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchLogs();
  }, []);



  const fetchLogs = async () => {

    try {

      const response = await api.get("/audit/");

      setLogs(response.data);

    } catch (error) {

      console.error(
        "Failed to fetch audit logs",
        error
      );

    } finally {

      setLoading(false);

    }

  };



  if (loading) {

    return (
      <h2 style={{ padding: "30px" }}>
        Loading Audit Logs...
      </h2>
    );

  }



  return (

    <div
      style={{
        padding: "30px"
      }}
    >

      <h2>
        📋 Audit Logs
      </h2>


      {
        logs.length === 0 ?

        (

          <p>
            No activity found
          </p>

        )

        :

        (

          <table
            style={tableStyle}
          >

            <thead>

              <tr>

                <th style={thStyle}>
                  ID
                </th>

                <th style={thStyle}>
                  Action
                </th>

                <th style={thStyle}>
                  Flag Key
                </th>

                <th style={thStyle}>
                  User
                </th>

                <th style={thStyle}>
                  Time
                </th>

              </tr>

            </thead>


            <tbody>

              {
                logs.map(
                  (log) => (

                    <tr key={log.id}>

                      <td style={tdStyle}>
                        {log.id}
                      </td>


                      <td style={tdStyle}>
                        {log.action}
                      </td>


                      <td style={tdStyle}>
                        {log.flag_key}
                      </td>


                      <td style={tdStyle}>
                        {log.user}
                      </td>


                      <td style={tdStyle}>
                        {
                          new Date(
                            log.timestamp
                          ).toLocaleString()
                        }
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



const tableStyle = {

  width: "100%",

  borderCollapse: "collapse",

  background: "white",

};



const thStyle = {

  padding: "12px",

  border: "1px solid #ddd",

  textAlign: "left",

  background: "#f3f4f6",

};



const tdStyle = {

  padding: "12px",

  border: "1px solid #ddd",

};



export default AuditLogs;