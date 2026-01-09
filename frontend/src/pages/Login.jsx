import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import Logo from '@/assets/logo.png'; 

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // STATE FOR INPUTS
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user details to LocalStorage to keep them logged in
        localStorage.setItem('user', JSON.stringify(data.user));
        
        const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

        if (data.user.email === ADMIN_EMAIL) {
            console.log("Admin detected, redirecting to Admin Panel");
            navigate('/admin');
        } else {
            console.log("Customer detected, redirecting to Dashboard");
            navigate('/dashboard');
        }
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col font-sans">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2000&auto=format&fit=crop" alt="Nature Background" className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="p-6 flex justify-center lg:justify-start">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={Logo} alt="Sanchi Wellness" className="h-10 w-auto object-contain bg-white/90 rounded-full p-1" />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white drop-shadow-md group-hover:opacity-90 transition-opacity">SANCHI WELLNESS</span>
            </div>
          </Link>
        </header>

        <div className="flex-grow flex items-center justify-center p-4 -mt-10">
          <Card className="w-full max-w-md shadow-2xl border-none bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-bold text-gray-800">Welcome Back</CardTitle>
              <CardDescription>Enter your credentials to access your wellness dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10" 
                      required 
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      className="pl-10 pr-10" 
                      required 
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-green-600 hover:from-cyan-600 hover:to-green-700 text-white transition-all duration-300" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</>) : (<>Login <ArrowRight className="ml-2 h-4 w-4" /></>)}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center flex-col space-y-2">
              <p className="text-sm text-gray-500">Don't have an account? <Link to="/signup" className="text-green-600 font-semibold hover:underline">Sign Up</Link></p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;