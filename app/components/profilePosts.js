import React, { useEffect, useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Axios from "axios";

import Page from "./page";
import Post from "./post";
import LoadingDots from "./loadingdots";

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
        //console.log(response.data);
        setPosts(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("There Wase a problem.");
      }
    }
    fetchPosts();
  }, [username]);

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
        return <Post post={post} noAuthor={true} key={post._id} />;
      })}
    </div>
  );
}

export default ProfilePosts;
