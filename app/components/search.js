import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import Axios from "axios";
import Post from "./post";

import DispatchContext from "../context/DispatchContext";

function Search() {
  const appDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0
  });

  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler);
    //clean up when the comp unmounted or state changes again
    return () => document.removeEventListener("keyup", searchKeyPressHandler);
  }, []);

  function searchKeyPressHandler(e) {
    if (e.keyCode == 27) appDispatch({ type: "closeSearch" });
  }
  function handleInput(e) {
    const value = e.target.value;
    setState(draft => {
      draft.searchTerm = value;
    });
  }
  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        draft.show = "loading";
      });
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++;
        });
      }, 750);
      //cancel if state changes again
      return () => clearTimeout(delay);
    } else {
      setState(draft => {
        draft.show = "neither";
      });
    }
  }, [state.searchTerm]);

  useEffect(() => {
    if (state.requestCount) {
      //create a cancel token to clean up if the comp not rendering anymore
      const ourRequest = Axios.CancelToken.source();
      //send Axios request to backend //console.log(state.searchTerm);
      async function fetchResults() {
        try {
          const response = await Axios.post(`/search`, {
            searchTerm: state.searchTerm,
            cancelToken: ourRequest.token
          });
          //console.log(response.data);
          setState(draft => {
            draft.results = response.data;
            draft.show = "results";
          });
        } catch (e) {
          console.log("There Wase a problem or the request was canceled..");
        }
      }
      fetchResults();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.requestCount]);

  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input
            onChange={handleInput}
            autoFocus
            type="text"
            autoComplete="off"
            id="live-search-field"
            className="live-search-field"
            placeholder="What are you interested in?"
          />
          <span onClick={() => appDispatch({ type: "closeSearch" })} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div
            className={"circle-loader" + (state.show == "loading" ? "circle-loader--visible" : "")}
          ></div>
          <div
            className={
              "live-search-results " +
              (state.show == "results" ? "live-search-results--visible" : "")
            }
          >
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length}{" "}
                  {state.results.length > 1 ? " items" : " item"} found)
                </div>
                {state.results.map(result => {
                  return (
                    <Post
                      post={result}
                      key={result._id}
                      onClick={() => appDispatch({ type: "closeSearch" })}
                    />
                  );
                })}
              </div>
            )}
            {!Boolean(state.results.length) && (
              <div className="alert alert-danger text-center shadow-sm">
                there is no result for your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Search;
