import React, { useEffect, useState, useContext } from "react";
import { Link, useParams, withRouter } from "react-router-dom";
import Axios from "axios";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";

import StateContext from "../context/StateContext";
import DispatchContext from "../context/DispatchContext";

import Page from "./page";
import LoadingDots from "./LoadingDots";
import NotFound from "./notFound";

Axios.defaults.baseURL = "http://localhost:8080";

function PostView(props) {
  // withRouter pass usefull props into our component alows work with router
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  const { id } = useParams();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  useEffect(() => {
    //create a cancel token to clean up if the comp not rendering anymore
    const ourRequest = Axios.CancelToken.source();
    //async inside a function inside useEffect we can not use async inside useEffect directaly
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token });

        setPost(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("There Wase a problem or the request was canceled");
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, [id]);

  if (!isLoading && !post) {
    return <NotFound />;
  }
  if (isLoading) {
    return (
      <Page title="Loading ...">
        <LoadingDots />
      </Page>
    );
  }
  const date = new Date(post.createdDate);
  const dateFormated = `${date.getDay()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username;
    }
  }
  async function deleteHandler() {
    const areYouSure = window.confirm("do you really want to delete this post");
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, {
          data: { token: appState.user.token }
        });
        console.log(response.data);
        if (response.data == "Success") {
          //display a flash message
          appDispatch({ type: "flashMessage", value: "Post was successfully deleted." });
          //redirect to home
          props.history.push(`/profile/${appState.user.username}`);
        } else {
          appDispatch({ type: "flashMessage", value: "Post was not successfully deleted." });
        }
      } catch (e) {}
    }
  }
  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link
              to={`/post/${id}/edit`}
              data-tip="Edit"
              data-for="editx"
              className="text-primary mr-2"
            >
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="editx" className="custom-tooltip" />{" "}
            <Link
              onClick={deleteHandler}
              to="#"
              data-tip="Delete"
              data-for="deletex"
              className="delete-post-button text-danger"
            >
              <i className="fas fa-trash"></i>
            </Link>
            <ReactTooltip id="deletex" className="custom-tooltip" />
          </span>
        )}
      </div>
      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on{" "}
        {dateFormated}
      </p>
      <div className="body-content">
        {
          //use react-markdown to text formating support
        }
        <ReactMarkdown
          source={post.body}
          allowedTypes={["paragraph", "strong", "emphasis", "text", "heading", "list", "listItem"]}
        />
      </div>
    </Page>
  );
}

export default withRouter(PostView);
