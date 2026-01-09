import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Checkout from '@/pages/checkout';
import AdminPanel from '@/pages/AdminPanel';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

// 1. ADMIN ROUTE 
const AdminRoute = ({ children }) => {
  const userString = localStorage.getItem('user');
  if (!userString) return <Navigate to="/login" replace />;

  const user = JSON.parse(userString);
  
  if (user.email !== ADMIN_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// 2. CUSTOMER ROUTE (For Users)
const CustomerRoute = ({ children }) => {
  const userString = localStorage.getItem('user');
  if (!userString) return <Navigate to="/login" replace />;

  const user = JSON.parse(userString);

  // IF IT IS THE ADMIN -> GO TO ADMIN PANEL
  if (user.email === ADMIN_EMAIL) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🔒 ADMIN AREA */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } 
        />

        {/* 👤 CUSTOMER AREA (Admin cannot enter) */}
        <Route 
          path="/dashboard" 
          element={
            <CustomerRoute>
              <Dashboard />
            </CustomerRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <CustomerRoute>
              <Checkout />
            </CustomerRoute>
          } 
        />

      </Routes>
    </Router>
  );
}

export default App;