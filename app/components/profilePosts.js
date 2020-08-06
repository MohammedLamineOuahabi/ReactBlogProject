import React, { useEffect, useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Axios from "axios";

import Page from "./page";
import LoadingDots from "./LoadingDots";

Axios.defaults.baseURL = "http://localhost:8080";

function ProfilePosts() {
  //using useParams to get username from url
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    //async inside a function inside useEffect we can not use async inside useEffect directaly
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`);
        console.log(response.data);
        setPosts(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("There Wase a problem.");
      }
    }
    fetchPosts();
  }, []);

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
      {posts.map(post => {
        const date = new Date(post.createdDate);
        const dateFormated = `${date.getDay()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        return (
          <Link
            key={post._id}
            to={`/post/${post._id}`}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong>
            <span className="text-muted small"> on {dateFormated} </span>
          </Link>
        );
      })}
    </div>
  );
}

export default ProfilePosts;
