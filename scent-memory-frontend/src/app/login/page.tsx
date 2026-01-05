'use client';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
      toast.error(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero with image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-100">
        {/* Background image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1607506740505-f01f00226534?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Fragrance bottle"
            className="w-full h-full object-cover opacity-90"
          />
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-200/20 to-neutral-800/30"></div>
        </div>
        
        {/* Logo top left */}
        <div className="absolute top-8 left-8 z-10">
          <p className="text-sm font-light tracking-wider text-neutral-800">SCENT MEMORY</p>
        </div>

        {/* Content bottom left */}
        <div className="absolute bottom-8 left-8 z-10 text-neutral-800 max-w-md">
          <h1 className="text-4xl font-light mb-4 leading-tight" style={{ fontFamily: 'serif' }}>
            Capturing Moments,<br />Crafting Stories
          </h1>
          <p className="text-sm font-light leading-relaxed opacity-80">
            We bring your vision to life through striking photography that speaks louder 
            than words. Let us turn ordinary moments into timeless works of art.
          </p>
        </div>

        {/* Copyright bottom right */}
        <div className="absolute bottom-8 right-8 z-10">
          <p className="text-xs text-neutral-700">© 2025 Scent Memory · All rights reserved</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-neutral-50 px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-12">
            <p className="text-sm font-light tracking-wider text-neutral-800">SCENT MEMORY</p>
          </div>

          <div className="mb-10">
            <h2 className="text-5xl font-light mb-4 text-neutral-800" style={{ fontFamily: 'serif' }}>
              Welcome Back
            </h2>
            <p className="text-neutral-600 font-light">Enter your email and password to continue</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-light text-neutral-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-600 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-light text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-600 transition-colors"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-neutral-800" />
                <span className="ml-2 text-sm font-light text-neutral-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-light text-neutral-700 hover:text-neutral-900 transition">
                Forgot Password?
              </a>
            </div>
            
            <button
              type="submit"
              className="w-full bg-neutral-800 text-white py-3 rounded hover:bg-neutral-900 transition font-light tracking-wide"
            >
              Sign in
            </button>
          </form>
          
          <p className="text-center mt-8 text-neutral-600 font-light text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-neutral-800 hover:text-neutral-900 font-normal transition">
              Register
            </Link>
          </p>

          {/* Navigation links */}
          <div className="mt-12 pt-8 border-t border-neutral-200 space-y-2">
            <a href="#" className="block text-sm font-light text-neutral-600 hover:text-neutral-900 transition">Home</a>
            <a href="#" className="block text-sm font-light text-neutral-600 hover:text-neutral-900 transition">Services</a>
            <a href="#" className="block text-sm font-light text-neutral-600 hover:text-neutral-900 transition">News</a>
            <a href="#" className="block text-sm font-light text-neutral-600 hover:text-neutral-900 transition">Projects</a>
            <a href="#" className="block text-sm font-light text-neutral-600 hover:text-neutral-900 transition">Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
}