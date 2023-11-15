import React from "react";
import { createRoot } from "react-dom/client";
import Frame from "./components/Frame";
import "@blueprintjs/core/lib/css/blueprint.css";

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Frame />
  </React.StrictMode>
);
