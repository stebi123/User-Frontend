import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AuthService from "../../services/auth.service";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-white text-white shadow-gray-200 shadow-sm border-b border-gray-200">
      <div className="w-full">
        <div className="flex justify-between items-center h-16 px-0">
          <div className="flex items-center pl-7 space-x-2">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img src="/logox.png" alt="Logo" className="h-10 w-10 contrast-125 brightness-110" />
              <span className="text-2xl font-extrabold text-gray-900">slotter</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 pr-7">
            
            {currentUser ? (
              <>
                <span className="text-gray-900 font-bold text-xl">Hi, {currentUser.username}</span>
                <Link to="/profile" className="flex items-center hover:text-black">
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center mr-2 border border-green-400 hover:border-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white hover:text-green-200" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {/* Profile */}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-900 font-semibold border border-red-500 hover:text-red-500 px-4 py-1 rounded-3xl"
                >
                  Logout
                </button> 
              </>
            ) : (
              <>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}