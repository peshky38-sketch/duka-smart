import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Inventory from "./pages/Inventory.jsx";
import Sales from "./pages/Sales.jsx";
import Transactions from "./pages/Transactions.jsx";
import Expenses from "./pages/Expenses.jsx";
import Reports from "./pages/Reports.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";


function Protected({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="sales" element={<Sales />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<Reports />} />
         <Route path="profile" element={<Profile />} />
        <Route path=":page" element={<Placeholder />} />
      </Route>
    </Routes>
  );
}
