import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./dbconnector.css";

const Dbconnector = () => {
  const [formData, setFormData] = useState({
    database_user: "",
    database_password: "",
    database_host: "",
    database_port: "",
    database_name: "",
    database_dialect: "",
  });
  const [validationPassed, setValidationPassed] = useState(false);
  const [dbinfo, setDbinfo] = useState([]);
  const [connectionMsg, setConnectionMsg] = useState("");
  const [connectionMsgType, setConnectionMsgType] = useState("");
  const navigate = useNavigate();

  const tok = Cookies.get("auth_token");
  const validateApi = `http://127.0.0.1:8000/databaseinfo/validate_database_information/?token=${tok}`;
  const saveApi = `http://127.0.0.1:8000/databaseinfo/save/?token=${tok}`;
  const connectApi = `http://127.0.0.1:8000/databaseinfo/connect_to_database?token=${tok}`;
  const fetchApi = `http://127.0.0.1:8000/databaseinfo/?token=${tok}`;

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
        // navigate("/");
      }
    } catch (error) {
      console.error("Validation error:", error);
      setConnectionMsgType("error");
      setConnectionMsg("Database information is invalid!. Please try again.");
      // navigate("/");
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
        // alert("Database connected successfully!");
        navigate("/chatsam");
      } else {
        alert(data.message || "Failed to connect to the database.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("An error occurred while connecting to the database.");
    }
  };

  return (
    <div className="db">
      <div className="glass-container-horizontal">
        <div className="form-section">
          <form className="glass-form" onSubmit={handleValidate}>
            <h6><b>Database Connection</b></h6>

            {/* Input fields */}
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

            <div className="form-row">
              <div className="form-group full-width">
                <label>DB Name:</label>
                <input
                  type="text"
                  name="database_name"
                  value={formData.database_name}
                  onChange={handleChange}
                  placeholder="Enter database name"
                />
              </div>
            </div>

            {/* Radio buttons */}
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

            {validationPassed ? (
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
            )
              :
              <button type="submit" className="check-connection-button">
                Check Connection
              </button>}
          </form>

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

export default Dbconnector;
