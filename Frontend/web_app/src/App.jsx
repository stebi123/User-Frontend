import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/layout/Navbar";
// import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
// import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import DashboardPage from "./pages/dashboard/DashboardPage";
import PaymentPage from "./pages/dashboard/PaymentPage";
import CustomersPage from "./pages/dashboard/CustomersPage";
import AddClientPage from "./pages/dashboard/products/AddClientPage";
import EditProductPage from "./pages/dashboard/products/EditProductPage";
import DeleteProductPage from "./pages/dashboard/products/DeleteProductPage";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/signin" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              {/* <Route path="/signup" element={<SignUp />} /> */}
              
              {/* Protected routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Dashboard routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/payment" element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/customers" element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/products/add" element={
                <ProtectedRoute>
                  <AddClientPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/products/edit" element={
                <ProtectedRoute>
                  <EditProductPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/products/delete" element={
                <ProtectedRoute>
                  <DeleteProductPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          {/* <Footer /> */}
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;