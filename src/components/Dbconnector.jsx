import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./dbconnector.css";
 
const Dbconnector2 = () => {
  const [formData, setFormData] = useState({
    database_user: "",
    database_password: "",
    database_host: "",
    database_port: "",
    database_name: [],
    database_dialect: "",
  });
  const [dbformData, setDbformData] = useState({
    database_user: "",
    database_password: "",
    database_host: "",
    database_port: "",
    database_dialect: "",
  });
  const [validationPassed, setValidationPassed] = useState(false);
  const [dbinfo, setDbinfo] = useState([]);
  const [dbnames, setDbnames] = useState(null);
  const [connectionMsg, setConnectionMsg] = useState("");
  const [connectionMsgType, setConnectionMsgType] = useState("");
  const [isOkClicked, setIsOkClicked] = useState(false);
  const [selectedDatabases, setSelectedDatabases] = useState([]);
 
  const navigate = useNavigate();
 
  const tok = Cookies.get("auth_token");
  const validateApi = `http://127.0.0.1:8000/databaseinfo/validate_database_information/?token=${tok}`;
  const saveApi = `http://127.0.0.1:8000/databaseinfo/save/?token=${tok}`;
  const connectApi = `http://127.0.0.1:8000/databaseinfo/connect_to_database?token=${tok}`;
  const fetchApi = `http://127.0.0.1:8000/databaseinfo/?token=${tok}`;
  const fetchdbApi = `http://127.0.0.1:8000/databaseinfo/get_database_names?token=${tok}`;
 
  useEffect(() => {
    // Fetch database information when the component mounts
    const fetchdbinfo = async () => {
      try {
        const response = await fetch(fetchApi, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setDbinfo(data);
        } else {
          console.error("Failed to fetch database info:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching database info:", error);
      }
    };
    fetchdbinfo();
  }, []);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setDbformData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
 
  const handleValidate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(validateApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
 
      const data = await response.json();
 
      if (response.ok && data.valid) {
        setConnectionMsgType("success");
        setConnectionMsg("Database information is valid. Proceed to connect to the database.");
        setValidationPassed(true);
      } else {
        setConnectionMsgType("error");
        setConnectionMsg("Database information is invalid!. Please try again.");
        setValidationPassed(false);
      }
    } catch (error) {
      console.error("Validation error:", error);
      setConnectionMsgType("error");
      setConnectionMsg("Database information is invalid!. Please try again.");
    }
  };
 
  const handleSave = async () => {
    try {
      const response = await fetch(saveApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
 
      const data = await response.json();
 
      if (response.ok) {
        alert(data.message || "Database info saved successfully!");
      } else {
        alert(data.message || "Failed to save database info.");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("An error occurred while saving database info.");
    }
  };
 
  const handleSubmit = async (dbData = formData) => {
    try {
      const response = await fetch(connectApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dbData),
      });
 
      const data = await response.json();
 
      if (response.ok && data.message === "Database connected successfully") {
        navigate("/chatsam");
      } else {
        alert(data.message || "Failed to connect to the database.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("An error occurred while connecting to the database.");
    }
  };
 
  const fetchdb = async (dbData = dbformData) => {
    try {
      const response = await fetch(fetchdbApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dbData),
      });
 
      if (response.ok) {
        const data = await response.json();
        setDbnames(data);
        setConnectionMsgType("success");
        setConnectionMsg("Fetched database information successfully.");
      } else {
        console.error("Failed to fetch database names:", response.statusText);
        setConnectionMsgType("error");
        setConnectionMsg("Failed to fetch database information. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching database names:", error);
      setConnectionMsgType("error");
      setConnectionMsg("An error occurred while fetching database information.");
    }
  };
  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
 
    if (checked) {
      setSelectedDatabases((prev) => [...prev, value]);
    } else {
      setSelectedDatabases((prev) => prev.filter((db) => db !== value));
    }
  };
 
  const handleOkClick = () => {
    setFormData((prev) => ({
      ...prev,
      database_name: selectedDatabases, // Update formData with selected databases
    }));
    setIsOkClicked(true);
    console.log("Updated FormData with selected databases:", {
      ...formData,
      database_name: selectedDatabases,
    });
  };
 
 
 
  const renderDatabaseInfo = () => {
    if (!dbnames || !dbnames.database_names || dbnames.database_names.length === 0) {
      return (
        <center>
          <h5>Available Databases</h5>
        </center>
      );
    }
 
    return (
        <div>
      <div className="checkbox-container">
        {dbnames.database_names.map((dbname, index) => (
          <div key={index} className="checkbox-item">
            <input
              type="checkbox"
              id={`db-${index}`}
              name="databases"
              value={dbname}
              onChange={handleCheckboxChange}
            />
            <label htmlFor={`db-${index}`}>{dbname}</label>
          </div>
        ))}
        <center>
          <button onClick={handleOkClick}>OK</button>
        </center>
      </div>
      <br />
      {isOkClicked && (
      <div className="button-container">
                <button className="save-button" onClick={handleSave}>
                  Save
                </button>
                <button
                  className="connect-now-button"
                  onClick={() => handleSubmit()}
                >
                  Connect Now
                </button>
              </div>
      )}
              </div>
    );
  };
 
 
  <div className="scrollable-box">
  {renderDatabaseInfo()}
</div>
 
 
  return (
    <div className="db">
      <div className="glass-container-horizontal">
        <div className="form-section">
          <form
            className="glass-form"
            onSubmit={(e) => {
              handleValidate(e);
            }}
          >
            <h6><b>Database Connection</b></h6>
 
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="database_user"
                  value={formData.database_user}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="database_password"
                  value={formData.database_password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </div>
            </div>
 
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="database_host"
                  value={formData.database_host}
                  onChange={handleChange}
                  placeholder="Enter the host"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="database_port"
                  value={formData.database_port}
                  onChange={handleChange}
                  placeholder="Enter the port"
                  required
                />
              </div>
            </div>
 
            <fieldset className="radio-group">
              <legend>Dialect:</legend>
              <label>
                <input
                  type="radio"
                  name="database_dialect"
                  value="mysql"
                  checked={formData.database_dialect === "mysql"}
                  onChange={handleChange}
                  required
                />
                MySQL
              </label>
              <label>
                <input
                  type="radio"
                  name="database_dialect"
                  value="postgresql"
                  checked={formData.database_dialect === "postgresql"}
                  onChange={handleChange}
                />
                PostgreSQL
              </label>
              <label>
                <input
                  type="radio"
                  name="database_dialect"
                  value="oracle"
                  checked={formData.database_dialect === "oracle"}
                  onChange={handleChange}
                />
                Oracle
              </label>
            </fieldset>
 
            <h6 className={connectionMsgType === "error" ? "error-msg" : "success-msg"}>{connectionMsg}</h6>
 
            <div className="form-row">
              <button
                type="button"
                className="fetch-db-button"
                onClick={() => fetchdb()}
              >
                Fetch Databases
           
              </button>
            </div>
          </form>
        </div>
 
        {/* Database Names Display */}
        <div className="scrollable-box">
          {renderDatabaseInfo()}
          <br />
          {/* <center><button>OK</button></center> */}
        </div>
 
        {/* Scrollable Table */}
        <div className="scrollable-box">
          <table className="db-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Host</th>
                <th>Port</th>
                <th>Dialect</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dbinfo.length > 0 ? (
                dbinfo.map((db, index) => (
                  <tr key={index}>
                    <td>{db.database_user}</td>
                    <td>{db.database_host}</td>
                    <td>{db.database_port}</td>
                    <td>{db.database_dialect}</td>
                    <td>
                      <button className="connect-button" onClick={() => handleSubmit(db)}>
                        <center>Connect</center>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No database information available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
 
export default Dbconnector2;
 