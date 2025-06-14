import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  
  // Keep track of dropdown state (default to open if in products section)
  const [isProductsOpen, setIsProductsOpen] = useState(location.pathname.startsWith('/dashboard/products'));
  
  // Check if current path is in products section
  const isProductsSection = location.pathname.startsWith('/dashboard/products');
  
  // Check if current path matches the given path
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Auto-close product dropdown when navigating to a non-product section
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/products')) {
      setIsProductsOpen(true);
    }
  }, [location]);

  return (
    <div className="bg-green-400 text-white w-64 min-h-screen flex-shrink-0 shadow-lg">
      <div className="px-7 py-5 border-b border-white">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
      </div>
      
      <nav className="mt-6">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `flex font-medium items-center px-5 py-3 hover:bg-white text-gray-900 transition-colors duration-200 ${isActive ? 'bg-white border-l-4 border-gray-900' : ''}`
          }
          end
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span>Dashboard</span>
        </NavLink>
        
        <div>
          <div 
            className={`flex font-medium items-center justify-between px-5 py-3 hover:bg-white text-gray-900 transition-colors duration-200 ${isProductsSection ? 'bg-white border-l-4 border-gray-900 font-medium' : ''}`}
            onClick={() => setIsProductsOpen(!isProductsOpen)}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              <span>Products</span>
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transition-transform duration-300 ${isProductsOpen ? 'transform rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Dropdown menu for Products - show based on state */}
          {isProductsOpen && (
            <div className="bg-green-300 font-medium py-1 border-l-2 border-white ml-5">
              <NavLink 
                to="/dashboard/products/add" 
                className={({ isActive }) => 
                  `pl-8 pr-5 py-2 border-b border-white flex items-center hover:bg-green-50 text-gray-800 transition-colors duration-200 ${isActive ? 'bg-white font-medium' : ''}`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Client</span>
              </NavLink>
              <NavLink 
                to="/dashboard/products/edit" 
                className={({ isActive }) => 
                  `pl-8 pr-5 py-2 border-b border-white flex items-center hover:bg-green-50 text-gray-800 transition-colors duration-200 ${isActive ? 'bg-white font-medium' : ''}`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span>Edit Client</span>
              </NavLink>
              <NavLink 
                to="/dashboard/products/delete" 
                className={({ isActive }) => 
                  `pl-8 pr-5 py-2 flex items-center hover:bg-green-50 text-gray-800 transition-colors duration-200 ${isActive ? 'bg-white font-medium' : ''}`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Delete Client</span>
              </NavLink>
            </div>
          )}
        </div>
        
        <NavLink 
          to="/dashboard/payment" 
          className={({ isActive }) => 
            `flex font-medium items-center px-5 py-3 hover:bg-white text-gray-900 transition-colors duration-200 ${isActive ? 'bg-white border-l-4 border-gray-900 font-medium' : ''}`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          <span>Payments</span>
        </NavLink>

        <NavLink 
          to="/dashboard/customers" 
          className={({ isActive }) => 
            `flex font-medium items-center px-5 py-3 hover:bg-white text-gray-900 transition-colors duration-200 ${isActive ? 'bg-white border-l-4 border-gray-900 font-medium' : ''}`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <span>Customers</span>
        </NavLink>

        <NavLink 
          to="/dashboard/settings" 
          className={({ isActive }) => 
            `flex font-medium items-center px-5 py-3 hover:bg-white text-gray-900 transition-colors duration-200 ${isActive ? 'bg-white border-l-4 border-gray-900 font-medium' : ''}`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="px-5 mt-auto py-5 absolute bottom-0 border-t border-white w-64">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full border border-white bg-gray-900 flex items-center justify-center mr-3">
            <span className="font-semibold text-white">A</span>
          </div>
          <div>
            <p className="text-sm text-gray-900 font-medium">Admin</p>
            <p className="text-xs text-gray-700">testoutputt@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}