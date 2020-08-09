import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import ReactTooltip from "react-tooltip";

import Chat from "./chat";

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
  function handleChatIcon(e) {
    e.preventDefault();
    appDispatch({ type: "toggleChat" });
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
      <span
        onClick={handleChatIcon}
        data-tip="Chat"
        data-for="chatx"
        className={
          "mr-3 ml-3  header-chat-icon " + (appState.unreadChatCount ? "text-danger" : "text-white")
        }
      >
        <i className="fas fa-comment"></i>

        {!appState.unreadChatCount ? (
          ""
        ) : (
          <span className="chat-count-badge text-white">
            {appState.unreadChatCount < 10 ? appState.unreadChatCount : "9+"}{" "}
          </span>
        )}
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
