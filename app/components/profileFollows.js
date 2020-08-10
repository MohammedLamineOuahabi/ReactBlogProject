import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Axios from "axios";

import Page from "./page";
import LoadingDots from "./loadingdots";

Axios.defaults.baseURL = "http://localhost:8080";

function ProfileFollow(props) {
  //using useParams to get username from url
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [Follows, setFollows] = useState([]);
  const [Action, setAction] = useState(props.action);

  useEffect(() => {
    //async inside a function inside useEffect we can not use async inside useEffect directaly
    async function fetchFollows() {
      try {
        //console.log(`/profile/${username}/${props.action}`);
        const response = await Axios.get(`/profile/${username}/${props.action}`);
        setFollows(response.data);
        setAction(props.action);
        setIsLoading(false);
      } catch (e) {
        console.log("There Wase a problem.");
      }
    }
    fetchFollows();
  }, [username, props.action]);

  if (isLoading) {
    return (
      <Page title="Loading...">
        {" "}
        <LoadingDots />
      </Page>
    );
  }
  return (
    <div className="list-group">
      {Follows.map((Follow, index) => {
        return (
          <Link
            key={index}
            to={`/profile/${Follow.username}`}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={Follow.avatar} /> <strong>{Follow.username}</strong>
          </Link>
        );
      })}
      {!Boolean(Follows.length) && (
        <div className="alert alert-warning" role="alert">
          There are no {Action} yet.
        </div>
      )}
    </div>
  );
}

export default ProfileFollow;
