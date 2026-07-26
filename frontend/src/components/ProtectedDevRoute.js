// frontend/src/components/ProtectedDevRoute.js
import { Navigate } from "react-router-dom";

function ProtectedDevRoute({ children }) {
  const token = sessionStorage.getItem("devLabToken");

  if (!token) {
    return <Navigate to="/research" replace />;
  }

  return children;
}

export default ProtectedDevRoute;