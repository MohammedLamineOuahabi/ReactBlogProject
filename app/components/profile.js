import React, { useEffect, useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";

import StateContext from "../context/StateContext";

import Axios from "axios";
import Page from "./page";
import ProfilePosts from "./profilePosts";

function Profile() {
  const { username } = useParams();
  const appState = useContext(StateContext);
  const [profileData, setProfileData] = useState({
    profileUsername: "...",
    profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
    isFollowing: false,
    counts: { postCount: "", followerCount: "", followingCount: "" }
  });

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("token..", appState.user.token);
        const response = await Axios.post(`http://localhost:8080/profile/${username}`, {
          token: appState.user.token
        });
        //console.log("response .. ", response);
        setProfileData(response.data);
      } catch (e) {
        console.log("there was a problem.");
      }
    }
    fetchData();
  }, []);
  return (
    <Page title="Profile">
      {" "}
      <h2>
        <img className="avatar-small" src={profileData.profileAvatar} />{" "}
        {profileData.profileUsername}
        <button className="btn btn-primary btn-sm ml-2">
          Follow <i className="fas fa-user-plus"></i>
        </button>
      </h2>
      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <Link to="#" className="active nav-item nav-link">
          Posts: {profileData.counts.postCount}
        </Link>
        <Link to="#" className="nav-item nav-link">
          Followers: {profileData.counts.followerCount}
        </Link>
        <Link to="#" className="nav-item nav-link">
          Following: {profileData.counts.followingCount}
        </Link>
      </div>
      <ProfilePosts />
    </Page>
  );
}

export default Profile;
