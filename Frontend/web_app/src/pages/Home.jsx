import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-white text-white overflow-hidden relative">
      {/* Main Content */}
      <div className="container mx-auto relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="bg-white mb-8 overflow-hidden">
            <div className="md:p-20 md:flex items-center">
              <div className="md:w-2/3 md:pr-8">
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-4">
                  Slotter Administrative Portal
                </h1>
                <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                  Transform your scheduling with state-of-the-art tools, actionable analytics, and intuitive customization for unparalleled efficiency.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {currentUser ? (
                    <>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/signin"
                        className="flex items-center justify-center bg-green-500 font-semibold py-3 px-8 rounded-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Enter Portal
                      </Link>
                      {/* <Link
                        to="/signup"
                        className="flex items-center justify-center bg-gray-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Sign Up
                      </Link> */}
                    </>
                  )}
                </div>
              </div>
              <div className="">
                <img
                  src="\illustrator.png"
                  alt="illustrator"
                  className="w-82 h-82 object-contain mx-auto brightness-100 transition-transform duration-700 hover:scale-110 "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}