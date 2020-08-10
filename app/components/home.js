import React, { useEffect, useContext } from "react";
import { useImmer } from "use-immer";
import { Link } from "react-router-dom";
import Axios from "axios";

import Page from "./page";
import Post from "./post";
import LoadingDots from "./loadingdots";
import StateContext from "../context/StateContext";

function Home() {
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    isLoading: true,
    feed: []
  });

  useEffect(() => {
    //create a cancel token to clean up if the comp not rendering anymore
    const ourRequest = Axios.CancelToken.source();

    async function fetchData() {
      try {
        const response = await Axios.post(`http://localhost:8080/getHomefeed`, {
          token: appState.user.token
        });

        setState(draft => {
          draft.isLoading = false;
          draft.feed = response.data;
        });
      } catch (e) {
        console.log("there was a problem.");
      }
    }
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, []);

  if (state.isLoading) {
    return (
      <Page title="Loading ">
        {" "}
        <LoadingDots />{" "}
      </Page>
    );
  }
  return (
    <Page title="your feed">
      {state.feed.length > 0 && (
        <>
          <h2 className="text-center mb-4">The latest from those you follow</h2>
          <div className="list-group">
            {state.feed.map(result => {
              return <Post post={result} key={result._id} />;
            })}
          </div>
        </>
      )}

      {state.feed.length == 0 && (
        <>
          <h2 className="text-center">
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">
            Your feed displays the latest posts from the people you follow. If you don&rsquo;t have
            any friends to follow that&rsquo;s okay; you can use the &ldquo;Search&rdquo; feature in
            the top menu bar to find content written by people with similar interests and then
            follow them.
          </p>
        </>
      )}
    </Page>
  );
}

export default Home;
