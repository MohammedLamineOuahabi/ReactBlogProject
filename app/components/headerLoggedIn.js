import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import ReactTooltip from "react-tooltip";

import DispatchContext from "../context/DispatchContext";
import StateContext from "../context/StateContext";

function HeaderLoggedIn() {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  function handleLogout() {
    appDispatch({ type: "logout" });
  }
  function handleSearchIcon(e) {
    e.preventDefault();
    appDispatch({ type: "openSearch" });
  }
  return (
    <div className="flex-row my-3 my-md-0">
      <Link
        onClick={handleSearchIcon}
        to="#"
        data-tip="Search"
        data-for="searchx"
        className="text-white mr-2 header-search-icon"
      >
        <i className="fas fa-search"></i>
      </Link>
      <ReactTooltip place="bottom" id="searchx" className="custom-tooltip" />
      <span data-tip="Chat" data-for="chatx" className="mr-3 ml-3  header-chat-icon text-white">
        <i className="fas fa-comment"></i>
        <span className="chat-count-badge text-white"> </span>
      </span>
      <ReactTooltip place="bottom" id="chatx" className="custom-tooltip" />
      <Link
        data-tip="Profile"
        data-for="profilex"
        to={`/profile/${appState.user.username}`}
        className="mr-2"
      >
        <img className="small-header-avatar" src={appState.user.avatar} />
      </Link>
      <ReactTooltip place="bottom" id="profilex" className="custom-tooltip" />
      <Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>
      <button onClick={handleLogout} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  );
}

export default HeaderLoggedIn;
