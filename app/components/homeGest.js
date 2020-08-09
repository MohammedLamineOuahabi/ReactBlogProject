import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import Page from "./page";

import DispatchContext from "../context/DispatchContext";

Axios.defaults.baseURL = "http://localhost:8080";

function HomeGest() {
  const appDispatch = useContext(DispatchContext);

  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnic: false,
      checkCount: 0
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnic: false,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      message: ""
    },
    submitCount: 0
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasErrors = false;
        draft.username.value = action.value;
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true;
          draft.username.message = "username cannot exceed 30 caracters.";
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true;
          draft.username.message = "username can only containt letters & numbers.";
        }
        return;
      case "usernameAfterDelay":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true;
          draft.username.message = "username cannot under 3 caracters.";
        }
        if (!draft.hasErrors) {
          //only if no errors we check if the username exists or not from the database
          draft.username.checkCount++;
        }
        return;
      case "usernameUniqueResults":
        if (action.value) {
          draft.username.hasErrors = true;
          draft.username.isUnique = false;
          draft.username.message = "username already taken.";
        } else {
          draft.username.isUnique = true;
        }
        return;
      case "emailImmediately":
        draft.email.hasErrors = false;
        draft.email.value = action.value;
        return;
      case "emailAfterDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true;
          draft.email.message = "email not valide.";
        } else if (!draft.email.hasErrors) {
          draft.email.checkCount++;
        }

        return;
      case "emailUniqueResults":
        console.log(action.value);
        if (action.value) {
          draft.email.hasErrors = true;
          draft.email.isUnique = false;
          draft.email.message = "email already being used.";
        } else {
          draft.email.isUnique = true;
        }

        return;
      case "passwordImmediately":
        draft.password.hasErrors = false;
        draft.password.value = action.value;
        if (draft.password.value.length > 30) {
          draft.password.hasErrors = true;
          draft.password.message = "password cannot exceed 30 caracters.";
        }
        return;
      case "passwordAfterDelay":
        if (draft.password.value.length < 3) {
          draft.password.hasErrors = true;
          draft.password.message = "password must be at least 3 caracters.";
        }

        return;
      case "submitForm":
        if (
          !draft.username.hasErrors &&
          draft.username.isUnique &&
          !draft.email.hasErrors &&
          draft.email.isUnique &&
          !draft.password.hasErrors
        ) {
          draft.submitCount++;
        }
        return;
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  //delayed check username
  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "usernameAfterDelay" });
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [state.username.value]);

  //delayed check email
  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "emailAfterDelay" });
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [state.email.value]);

  //delayed check password
  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "passwordAfterDelay" });
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [state.password.value]);

  //existance check
  useEffect(() => {
    if (state.username.checkCount) {
      //create a cancel token to clean up if the comp not rendering anymore
      const ourRequest = Axios.CancelToken.source();
      //send Axios request to backend //console.log(state.searchTerm);
      async function fetchResults() {
        try {
          const response = await Axios.post(
            `/doesUsernameExist`,
            {
              username: state.username.value
            },
            {
              cancelToken: ourRequest.token
            }
          );
          //server will response true or false
          dispatch({ type: "usernameUniqueResults", value: response.data });
        } catch (e) {
          console.log("There Wase a problem or the request was canceled");
        }
      }
      fetchResults();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.username.checkCount]);

  //existance check email
  useEffect(() => {
    console.log("state.email.value", state.email.value);
    if (state.email.checkCount) {
      //create a cancel token to clean up if the comp not rendering anymore
      const ourRequest = Axios.CancelToken.source();
      //send Axios request to backend //console.log(state.searchTerm);
      async function fetchResults() {
        try {
          const response = await Axios.post(
            `/doesEmailExist`,
            {
              email: state.email.value
            },
            {
              cancelToken: ourRequest.token
            }
          );
          //server will response true or false
          dispatch({ type: "emailUniqueResults", value: response.data });
        } catch (e) {
          console.log("There Wase a problem or the request was canceled");
        }
      }
      fetchResults();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.email.checkCount]);

  //submit data
  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/register",
            {
              username: state.username.value,
              email: state.email.value,
              password: state.password.value
            },
            { cancelToken: ourRequest.token }
          );
          appDispatch({ type: "login", data: response.data });
          appDispatch({ type: "flashMessage", value: "Congrats! Welcome to your new account." });
        } catch (e) {
          console.log(e, "There was a problem or the request was cancelled.");
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.submitCount]);
  async function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "usernameImmediately", value: state.username.value });
    dispatch({ type: "usernameAfterDelay", value: state.username.value, noRequest: true });
    dispatch({ type: "emailImmediately", value: state.email.value });
    dispatch({ type: "emailAfterDelay", value: state.email.value, noRequest: true });
    dispatch({ type: "passwordImmediately", value: state.password.value });
    dispatch({ type: "passwordAfterDelay", value: state.password.value });
    dispatch({ type: "submitForm" });
    /* try {
      await Axios.post("/register", {
        username,
        email,
        password
      });
      console.log("user was succefully registred.");
      //empty fields
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (e) {
      console.log("registration error.");
    } */
  }

  return (
    <Page wide={true} title="Home page">
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">
            Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are
            reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually
            writing is the key to enjoying the internet again.
          </p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input
                onChange={e => {
                  dispatch({ type: "usernameImmediately", value: e.target.value });
                }}
                id="username-register"
                name="username"
                className="form-control"
                type="text"
                placeholder="Pick a username"
                autoComplete="off"
              />
              <CSSTransition
                in={state.username.hasErrors}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidateMessage">
                  {state.username.message}
                </div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input
                onChange={e => {
                  dispatch({ type: "emailImmediately", value: e.target.value });
                }}
                id="email-register"
                name="email"
                className="form-control"
                type="text"
                placeholder="you@example.com"
                autoComplete="off"
              />
              <CSSTransition
                in={state.email.hasErrors}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidateMessage">
                  {state.email.message}
                </div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input
                onChange={e => {
                  dispatch({ type: "passwordImmediately", value: e.target.value });
                }}
                id="password-register"
                name="password"
                className="form-control"
                type="password"
                placeholder="Create a password"
                autoComplete="off"
              />
              <CSSTransition
                in={state.password.hasErrors}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidateMessage">
                  {state.password.message}
                </div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}

export default HomeGest;
