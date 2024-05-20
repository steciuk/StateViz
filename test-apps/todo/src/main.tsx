import React from "react";
import ReactDOM from "react-dom/client";
import { ReactApp } from "./react/ReactApp.tsx";
import SvelteApp from "./svelte/SvelteApp.svelte";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("react-root")!).render(
  <React.StrictMode>
    <ReactApp />
  </React.StrictMode>
);

const svelteApp = new SvelteApp({
  target: document.getElementById("svelte-root")!,
});

export default svelteApp;
