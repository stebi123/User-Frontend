import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, ShieldAlert, AlertCircle } from "lucide-react";
import AuthService from "../services/auth.service";
import { useAuth } from "../contexts/AuthContext";

export default function SignIn() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Collection of motivational/interesting quotes
  const quotes = [
    {
      text: "Security is not a product, but a process.",
      author: "Bruce Schneier"
    },
    {
      text: "Simplicity is the soul of efficiency in code.",
      author: "Austin Freeman"
    },
    {
      text: "The best way to learn is to build, break, and fix.",
      author: "Unknown"
    },
    {
      text: "Complexity is the enemy of execution and trust.",
      author: "Tony Robbins"
    },
    {
      text: "The quieter you become, the more you can hear.",
      author: "Ram Dass"
    }
  ];

  // Rotate quotes every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        const userData = await AuthService.login(username, password);
        setCurrentUser(userData);
        navigate("/dashboard");
      } catch (error) {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setMessage("Failed to sign in. Please check your credentials.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background animation elements */}
      <div className="absolute inset-0 z-0">
        <div className="animate-pulse bg-green-200 opacity-5 h-28 w-28 rounded-full absolute -top -right-2 delay-400"></div>
        <div className="animate-pulse bg-green-300 opacity-5 h-96 w-96 rounded-full absolute top-1/2 -right-20 delay-300"></div>
        <div className="animate-pulse bg-gray-400 opacity-5 h-64 w-64 rounded-full absolute -bottom-20 right-1/3"></div>
      </div>
      
      {/* Left side branding/info panel */}
      <div className="hidden md:flex md:w-1/2 bg-gray-900 text-white flex-col justify-center px-12 relative z-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-6">Slotter</h1>
          
          {/* Quote section with fade-in/fade-out effect */}
          <div className="mb-8">
            <div className="flex items-start mb-4">
              <div className="text-green-400 mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                </svg>
              </div>
              <div className="transition-opacity duration-700 ease-in-out">
                <p className="text-lg mb-2 italic">{quotes[quoteIndex].text}</p>
                <p className="text-sm text-gray-400">— {quotes[quoteIndex].author}</p>
              </div>
            </div>
          </div>
          
          <p className="mb-6 text-lg">
            Welcome to the administrative portal. 
          </p>
          
          {/* Information card */}
          <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-green-500 mb-6">
            <h3 className="font-semibold text-green-400 text-xs mb-3 flex items-center">
              <ShieldAlert className="mr-2" size={16} />
              HEY!!
            </h3>
            <p className="text-xs text-green-200">
              You don’t belong here? Don’t worry — the system knows.
            </p>
          </div>
          
          {/* Warning for unauthorized access */}
          <div className="bg-gray-950 p-4 rounded-lg border-l-4 border-red-500 mt-6">
            <h3 className="font-semibold text-sm mb-1 flex items-center text-red-400">
              <AlertCircle className="mr-2" size={16} />
              UNAUTHORIZED ACCESS PROHIBITED
            </h3>
            <p className="text-xs text-red-200">
              This system is restricted to authorized personnel only. All access attempts are logged and monitored.
              Unauthorized access is prohibited and may result in legal action. Proceed only if you have explicit permission.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side sign-in form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 rounded-lg shadow-xl p-8">
            {/* Header moved inside container */}
            <div className="text-center mb-8">
              <div className="inline-flex justify-center items-center mb-4 bg-green-500 rounded-full p-2 shadow-lg">
                <User size={24} className="text-gray-900" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Access Admin Account
              </h2>
              <p className="text-green-400 text-sm">
                Enter your credentials to sign in
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              {message && (
                <div className="p-4 mb-5 rounded-md bg-gray-900 border border-red-600 text-red-500">
                  <p className="text-sm font-medium flex items-center">
                    <AlertCircle size={18} className="mr-2" />
                    {message}
                  </p>
                </div>
              )}
              
              {/* Username Input */}
              <div className="mb-5">
                <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-green-500">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-3 pl-10 border bg-gray-700 border-gray-600 rounded-md focus:outline-none focus:ring-2 transition duration-200 text-white placeholder-gray-400 focus:ring-green-500"
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
              </div>
              
              {/* Password Input */}
              <div className="mb-5">
                <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-green-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-3 pl-10 border bg-gray-700 border-gray-600 rounded-md focus:outline-none focus:ring-2 transition duration-200 text-white placeholder-gray-400 focus:ring-green-500"
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-base font-bold text-gray-950 bg-green-400 hover:bg-green-500 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center text-gray-900">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Authorized personnel only
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}