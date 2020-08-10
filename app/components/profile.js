import React, { useEffect, useContext } from "react";
import { useParams, NavLink, Switch, Route } from "react-router-dom";
import Axios from "axios";
import { useImmer } from "use-immer";

import Page from "./page";
import ProfilePosts from "./profilePosts";
import ProfileFollows from "./profileFollows";
import StateContext from "../context/StateContext";

function Profile() {
  const appState = useContext(StateContext);
  const { username } = useParams();
  const [state, setState] = useImmer({
    followActionLoading: false,
    startfollowingRequestCount: 0,
    stopfollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" }
    }
  });

  useEffect(() => {
    //create a cancel token to clean up if the comp not rendering anymore
    const ourRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, {
          token: appState.user.token
        });
        //console.log("response .. ", response);
        setState(draft => {
          draft.profileData = response.data;
        });
      } catch (e) {
        console.log("there was a problem.");
      }
    }
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  function startFollowing() {
    setState(draft => {
      draft.startfollowingRequestCount++;
    });
  }

  function stopFollowing() {
    setState(draft => {
      draft.stopfollowingRequestCount++;
    });
  }

  //watching if inc state.startfollowingRequestCount send follow request
  useEffect(() => {
    //create a cancel token to clean up if the comp not rendering anymore
    const ourRequest = Axios.CancelToken.source();
    if (state.startfollowingRequestCount) {
      //disable follow button when action start
      setState(draft => {
        draft.followActionLoading = true;
      });
      async function fetchData() {
        try {
          //console.log("token..", appState.user.token);
          const response = await Axios.post(
            `http://localhost:8080/addFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token
            }
          );
          //console.log("response .. ", response);
          setState(draft => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followerCount++;
            draft.followActionLoading = false;
          });
        } catch (e) {
          console.log("there was a problem.");
        }
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.startfollowingRequestCount]);

  //useeffect for stop following action
  useEffect(() => {
    //create a cancel token to clean up if the comp not rendering anymore
    const ourRequest = Axios.CancelToken.source();
    if (state.stopfollowingRequestCount) {
      async function fetchData() {
        try {
          //disable stop follow button when action start
          setState(draft => {
            draft.followActionLoading = true;
          });
          //console.log("token..", appState.user.token);
          //
          const response = await Axios.post(
            `http://localhost:8080/removeFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token
            }
          );
          //console.log("response .. ", response);
          setState(draft => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.followActionLoading = false;
          });
        } catch (e) {
          console.log("there was a problem.");
        }
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.stopfollowingRequestCount]);
  return (
    <Page title="Profile">
      {" "}
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} />{" "}
        {state.profileData.profileUsername}
        {/*  following button */}
        {appState.loggedIn &&
          !state.profileData.isFollowing &&
          state.profileData.profileUsername != "..." &&
          state.profileData.profileUsername != appState.user.username && (
            <button
              onClick={startFollowing}
              disabled={state.followActionLoading}
              className="btn btn-primary btn-sm ml-2"
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          )}
        {/* stop following button */}
        {appState.loggedIn &&
          state.profileData.isFollowing &&
          state.profileData.profileUsername != "..." &&
          state.profileData.profileUsername != appState.user.username && (
            <button
              onClick={stopFollowing}
              disabled={state.followActionLoading}
              className="btn btn-danger btn-sm ml-2"
            >
              Stop follow <i className="fas fa-user-times"></i>
            </button>
          )}
      </h2>
      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        {/* using exact to avoid confiousing */}
        <NavLink
          exact
          to={`/profile/${state.profileData.profileUsername}`}
          className=" nav-item nav-link"
        >
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/followers`}
          className=" nav-item nav-link"
        >
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/following`}
          className=" nav-item nav-link"
        >
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route path="/profile/:username" exact>
          <ProfilePosts />
        </Route>

        <Route path="/profile/:username/followers">
          <ProfileFollows action="followers" />
        </Route>

        <Route path="/profile/:username/following">
          <ProfileFollows action="following" />
        </Route>
      </Switch>
    </Page>
  );
}

export default Profile;
