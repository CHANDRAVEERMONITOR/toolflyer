"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Supabase Auth के जरिए लॉगिन करना
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        alert("Login Successful!");
        // लॉगिन के बाद छात्र को उसके डैशबोर्ड पर भेजें
        router.push('/dashboard');
      }
    } catch (error) {
      alert("Login Failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Student Login</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              className="w-full p-2 border rounded mt-1" 
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded mt-1" 
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
        </div>
        
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
          Login Now
        </button>
        
        <p className="text-center text-sm text-gray-600">
          Don't have an account? <a href="/signup" className="text-blue-600 font-bold hover:underline">Sign Up</a>
        </p>
      </form>
    </div>
  );
}
