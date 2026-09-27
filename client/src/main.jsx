import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { initPortOne } from "./config/portone.js";
import "./index.css";

initPortOne();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
