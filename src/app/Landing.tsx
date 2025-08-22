import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./store";

export default function Landing() {
  const token = useSelector((s: RootState) => s.auth.token);
  return token ? <Navigate to="/notifications" replace /> : <Navigate to="/login" replace />;
}
