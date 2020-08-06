import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import Page from "./page";

function NotFound() {
  return (
    <Page title="Not found">
      <div className="text-center">
        <h2>Ooops, we cannot find that page. (404)</h2>
        <p className="lead text-muted">
          You can always visit the <Link to="/">homepage</Link> to get a fresh start.
        </p>
      </div>
    </Page>
  );
}

export default NotFound;
