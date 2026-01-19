import { ReactNode } from 'react';
import ShaderGradientBackground from './ShaderGradientBackground';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative bg-[#1a1818]">
      <ShaderGradientBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-8 py-12">
        <div className="backdrop-blur-3xl bg-black/30 border border-white/10 rounded-lg p-8 md:p-12 w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}