'use client';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pass)) return 'Password must contain uppercase letter';
    if (!/[0-9]/.test(pass)) return 'Password must contain a number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      return;
    }

    try {
      await register(email, password, fullName);
      toast.success('Welcome!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
      toast.error(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero with image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-100">
        {/* Background image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2008" 
            alt="Perfume composition"
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
            Begin Your Journey,<br />Create Your Story ✨
          </h1>
          <p className="text-sm font-light leading-relaxed opacity-80">
            Together, we can craft a narrative that not only captivates but also leaves a 
            lasting impression. Let's transform your story into something unforgettable.
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
              Create Account
            </h2>
            <p className="text-neutral-600 font-light">Enter your details to get started</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-light text-neutral-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-600 transition-colors"
                required
              />
            </div>

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
                placeholder="Create a password"
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-600 transition-colors"
                minLength={8}
                required
              />
              <p className="text-xs text-neutral-500 mt-2 font-light">
                Minimum 8 characters, 1 uppercase, 1 number
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-neutral-800 text-white py-3 rounded hover:bg-neutral-900 transition font-light tracking-wide"
            >
              Create Account
            </button>
          </form>
          
          <p className="text-center mt-8 text-neutral-600 font-light text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-neutral-800 hover:text-neutral-900 font-normal transition">
              Login
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