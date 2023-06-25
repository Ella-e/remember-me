import React from "react";
import ReactDOM from "react-dom";
import reactDom from "react-dom";
import Home from "./page";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Home></Home>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
// ReactDOM.render(<p >Hello World</p>, document.getElementById('root'));
