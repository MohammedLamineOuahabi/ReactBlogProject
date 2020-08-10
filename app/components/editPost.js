import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, withRouter } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import Axios from "axios";

import StateContext from "../context/StateContext";
import DispatchContext from "../context/DispatchContext";
import Page from "./page";
import LoadingDots from "./loadingdots";
import NotFound from "./notFound";

function EditPost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const initialState = {
    title: { value: "", hasErrors: false, message: "" },
    body: { value: "", hasErrors: false, message: "" },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  };
  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      case "titleChange":
        draft.title.value = action.value;
        draft.title.hasErrors = false;
        return;
      case "bodyChange":
        draft.body.value = action.value;
        draft.body.hasErrors = false;
        return;
      case "submitRequest":
        //here increment sendCount will trigger Axios in useEffect to send data to server
        //inc only if no errors
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++;
        }
        return;
      case "saveRequestStarted":
        draft.isSaving = true;
        return;
      case "saveRequestFinished":
        draft.isSaving = false;
        return;
      case "titleRules":
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = "Title must not be empty!";
        }

        return;
      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = "body must not be empty!";
        }
        return;
      case "notFound":
        draft.notFound = true;
        draft.body.message = "body must not be empty!";

        return;
      case "flashMessage":
        draft.notFound = true;
        draft.body.message = "body must not be empty!";

        return;
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  // const [isLoading, setIsLoading] = useState(true);
  // const [post, setPost] = useState();
  // const { id } = useParams();

  useEffect(() => {
    //create a cancel token to clean up if the comp not rendering anymore
    const ourRequest = Axios.CancelToken.source();
    //async inside a function inside useEffect we can not use async inside useEffect directaly
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token });

        if (response.data) {
          dispatch({ type: "fetchComplete", value: response.data });
          if (response.data.author.username != appState.user.username) {
            appDispatch({
              type: "flashMessage",
              value: "you dont have permission to edit this post"
            });
            //redirect to homepage
            props.history.push("/");
          }
        } else {
          dispatch({ type: "notFound" });
        }
      } catch (e) {
        console.log("There Wase a problem or the request was canceled");
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, []);

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" });
      //create a cancel token to clean up if the comp not rendering anymore
      const ourRequest = Axios.CancelToken.source();
      //async inside a function inside useEffect we can not use async inside useEffect directaly
      async function fetchPost() {
        try {
          const response = await Axios.post(
            `/post/${state.id}/edit`,
            { title: state.title.value, body: state.body.value, token: appState.user.token },
            { cancelToken: ourRequest.token }
          );

          // setPost(response.data);
          // setIsLoading(false);
          dispatch({ type: "saveRequestFinished" });
          appDispatch({ type: "flashMessage", value: "Post was updated." });
          //dispatch({ type: "fetchComplete", value: response.data });
          //alert("congrat,post updated.");
        } catch (e) {
          console.log("There Wase a problem or the request was canceled");
        }
      }
      fetchPost();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.sendCount]);

  if (state.notFound) {
    return <NotFound />;
  }
  if (state.isFetching) {
    return (
      <Page title="Loading ...">
        <LoadingDots />
      </Page>
    );
  }

  function submitHandler(e) {
    e.preventDefault();
    dispatch({ type: "titleRules", value: state.title.value });
    dispatch({ type: "bodyRules", value: state.body.value });
    dispatch({ type: "submitRequest" });
  }
  return (
    <Page title="Edit post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to post permalink{" "}
      </Link>
      <form className="mt-3" onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            onBlur={e => dispatch({ type: "titleRules", value: e.target.value })}
            onChange={e => dispatch({ type: "titleChange", value: e.target.value })}
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            value={state.title.value}
          />
          {state.title.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            onBlur={e => dispatch({ type: "bodyRules", value: e.target.value })}
            onChange={e => dispatch({ type: "bodyChange", value: e.target.value })}
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            value={state.body.value}
          ></textarea>
          {state.body.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>
          )}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Update
        </button>
      </form>
    </Page>
  );
}

export default withRouter(EditPost);
