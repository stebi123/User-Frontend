import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/signin");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 overflow-x-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}