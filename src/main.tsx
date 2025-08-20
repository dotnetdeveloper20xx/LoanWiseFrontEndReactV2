import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";
import { AppProviders } from "./app/providers";
import { RouterProvider } from "react-router-dom";
import router from "./app/routes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>
);
