import React, { useEffect, useState, useReducer } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import Axios from "axios";
Axios.defaults.baseURL = "http://localhost:8080";
//our components
import Header from "./components/header";
import HomeGest from "./components/homeGest";
import About from "./components/about";
import Home from "./components/home";
import Footer from "./components/footer";
import CreatePost from "./components/createPost";
import ViewSinglePost from "./components/viewSinglePost";
import FlashMessages from "./components/flashMessages";
import Profile from "./components/profile";
import EditPost from "./components/editPost";
import NotFound from "./components/notFound";

import StateContext from "./context/StateContext";
import DispatchContext from "./context/DispatchContext";

function OurApp() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("ourAppToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("ourAppToken"),
      username: localStorage.getItem("ourAppUsername"),
      avatar: localStorage.getItem("ourAppAvatar")
    }
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        //return { loggedIn: true, flashMessages: state.flashMessages };
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      case "logout":
        //return { loggedIn: false, flashMessages: state.flashMessages };
        draft.loggedIn = false;
        return;
      case "flashMessage":
        //return { loggedIn: state.loggedIn, flashMessages: state.flashMessages.concat(action.value) };
        draft.flashMessages.push(action.value);
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("ourAppToken", state.user.token);
      localStorage.setItem("ourAppUsername", state.user.username);
      localStorage.setItem("ourAppAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("ourAppToken");
      localStorage.removeItem("ourAppUsername");
      localStorage.removeItem("ourAppAvatar");
    }
  }, [state.loggedIn]);
  // const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("ourAppToken")));
  // const [flashMessages, setFlashMessages] = useState([]);

  /* function addFlashMessage(msg) {
    setFlashMessages(prev => prev.concat(msg));
  }
  */
  return (
    //    <ExampleContext.Provider value={{ addFlashMessage, setLoggedIn }}>
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Switch>
            <Route path="/" exact>
              {state.loggedIn ? <Home /> : <HomeGest />}
            </Route>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/profile/:username">
              <Profile />
            </Route>
            <Route path="/create-post">
              <CreatePost />
            </Route>
            <Route path="/post/:id" exact>
              <ViewSinglePost />
            </Route>
            <Route path="/post/:id/edit" exact>
              <EditPost />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

ReactDOM.render(<OurApp />, document.querySelector("#app"));

if (module.hot) {
  module.hot.accept();
}
