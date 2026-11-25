import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { isLoggedIn, checkSession } from "./api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import { ToastProvider } from "./components/Toast";
import "./theme.css";

// pages after login are only for signed-in users
function Private({ children }) {
  const [state, setState] = useState(isLoggedIn() ? "checking" : "no");
  useEffect(() => {
    if (state !== "checking") return;
    checkSession().then((ok) => setState(ok ? "yes" : "no"));
  }, []);
  if (state === "checking") return null;
  return state === "yes" ? children : <Navigate to="/login" replace />;
}

createRoot(document.getElementById("root")).render(
  <ToastProvider>
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
      <Route path="/inventory" element={<Private><Inventory /></Private>} />
      <Route path="/sales" element={<Private><Sales /></Private>} />
      <Route path="/expenses" element={<Private><Expenses /></Private>} />
      <Route path="/transactions" element={<Private><Transactions /></Private>} />
      <Route path="/reports" element={<Private><Reports /></Private>} />
      <Route path="*" element={<Navigate to={isLoggedIn() ? "/dashboard" : "/login"} replace />} />
    </Routes>
  </BrowserRouter>
  </ToastProvider>
);
