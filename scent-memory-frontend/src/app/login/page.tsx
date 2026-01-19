'use client';
import { useState, FormEvent } from 'react';
import { useLogin } from '@/hooks/useAuth';
import { useHumaneFont } from '@/hooks/humaneFonts';
import AuthLayout from '@/components/AuthLayout';
import AuthHeader from '@/components/AuthHeader';
import AuthFooter from '@/components/AuthFooter';
import ErrorMessage from '@/components/ErrorMessage';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  useHumaneFont();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  const errorMessage = login.isError 
    ? (login.error.response?.data as any)?.detail || 'Invalid credentials'
    : '';

  return (
    <AuthLayout>
      <AuthHeader 
        title="Welcome Back"
        subtitle="Enter your email and password to continue"
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <ErrorMessage message={errorMessage} />
        
        <div>
          <label htmlFor="email" className="block text-sm font-light text-white/80 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@example.com"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-[#c98e8f]/50 transition-colors"
            required
            disabled={login.isPending}
            autoComplete="email"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-light text-white/80 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-[#c98e8f]/50 transition-colors"
            required
            disabled={login.isPending}
            autoComplete="current-password"
          />
        </div>
        
        <button
          type="submit"
          disabled={login.isPending}
          aria-busy={login.isPending}
          className="w-full bg-[#c69193] hover:bg-[#d4a5a7] text-white py-3 rounded transition font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      
      <AuthFooter 
        text="Don't have an account?"
        linkText="Register"
        linkHref="/register"
      />
    </AuthLayout>
  );
}