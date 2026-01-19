'use client';
import { useState, FormEvent, ChangeEvent } from 'react';
import { useRegister } from '@/hooks/useAuth';
import { useHumaneFont } from '@/hooks/humaneFonts';
import AuthLayout from '@/components/AuthLayout';
import AuthHeader from '@/components/AuthHeader';
import AuthFooter from '@/components/AuthFooter';
import ErrorMessage from '@/components/ErrorMessage';

interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [validationError, setValidationError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUppercase: false,
    hasNumber: false,
  });
  
  const register = useRegister();

  useHumaneFont();

  const checkPasswordStrength = (pass: string): PasswordStrength => {
    return {
      hasMinLength: pass.length >= 8,
      hasUppercase: /[A-Z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
    };
  };

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pass)) return 'Password must contain uppercase letter';
    if (!/[0-9]/.test(pass)) return 'Password must contain a number';
    return null;
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setValidationError('');
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError('');
    
    const passError = validatePassword(password);
    if (passError) {
      setValidationError(passError);
      return;
    }

    register.mutate({ 
      email, 
      password, 
      full_name: fullName 
    });
  };

  const displayError = validationError || (register.isError 
    ? (register.error.response?.data as any)?.detail || 'Registration failed'
    : '');

  return (
    <AuthLayout>
      <AuthHeader 
        title="Create Account"
        subtitle="Enter your details to get started"
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <ErrorMessage message={displayError} />
        
        <div>
          <label htmlFor="fullName" className="block text-sm font-light text-white/80 mb-2">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setValidationError('');
            }}
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-[#c98e8f]/50 transition-colors"
            required
            disabled={register.isPending}
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-light text-white/80 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setValidationError('');
            }}
            placeholder="hello@example.com"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-[#c98e8f]/50 transition-colors"
            required
            disabled={register.isPending}
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
            onChange={handlePasswordChange}
            placeholder="Create a password"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-[#c98e8f]/50 transition-colors"
            minLength={8}
            required
            disabled={register.isPending}
            autoComplete="new-password"
          />
          
          <div className="mt-3 space-y-1">
            <PasswordRequirement 
              met={passwordStrength.hasMinLength} 
              text="At least 8 characters"
            />
            <PasswordRequirement 
              met={passwordStrength.hasUppercase} 
              text="One uppercase letter"
            />
            <PasswordRequirement 
              met={passwordStrength.hasNumber} 
              text="One number"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={register.isPending}
          aria-busy={register.isPending}
          className="w-full bg-[#c69193] hover:bg-[#d4a5a7] text-white py-3 rounded transition font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {register.isPending ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <AuthFooter 
        text="Already have an account?"
        linkText="Login"
        linkHref="/login"
      />
    </AuthLayout>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
        met ? 'bg-green-500/20' : 'bg-white/5'
      }`}>
        {met && (
          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={met ? 'text-green-400/80' : 'text-white/40'}>
        {text}
      </span>
    </div>
  );
}