import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./pages/App.jsx";
import Login from "./pages/Login.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";
const token = localStorage.getItem("token");
createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={token ? <App /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);
