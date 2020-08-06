import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";

import DispatchContext from "../context/DispatchContext";

Axios.defaults.baseURL = "http://localhost:8080";

function HeaderLoggedOut() {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const appDispatch = useContext(DispatchContext);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await Axios.post("/login", { username, password });
      if (response.data) {
        console.log(response.data);
        appDispatch({ type: "login", data: response.data });

        //reset values
        setUsername("");
        setPassword("");
      } else {
        console.log("username / password incorrect.");
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            onChange={e => setUsername(e.target.value)}
            value={username || ""}
            name="username"
            className="form-control form-control-sm input-dark"
            type="text"
            placeholder="Username"
            autoComplete="off"
          />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            onChange={e => setPassword(e.target.value)}
            value={password || ""}
            name="password"
            className="form-control form-control-sm input-dark"
            type="password"
            placeholder="Password"
            autoComplete="off"
          />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  );
}

export default HeaderLoggedOut;
