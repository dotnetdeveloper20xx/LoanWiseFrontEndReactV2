import { Outlet } from "react-router-dom";
import Navbar from "../shared/components/Navbar";

export default function RootLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
}
