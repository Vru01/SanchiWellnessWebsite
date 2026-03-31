import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Checkout from '@/pages/Checkout';
import AdminPanel from '@/pages/AdminPanel';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const AdminRoute = ({ children }) => {
  const userString = localStorage.getItem('user');
  if (!userString) return <Navigate to="/login" replace />;
  const user = JSON.parse(userString);
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />;
  return children;
};

const CustomerRoute = ({ children }) => {
  const userString = localStorage.getItem('user');
  if (!userString) return <Navigate to="/login" replace />;
  const user = JSON.parse(userString);
  if (user.email === ADMIN_EMAIL) return <Navigate to="/admin" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/dashboard" element={<CustomerRoute><Dashboard /></CustomerRoute>} />
        <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
