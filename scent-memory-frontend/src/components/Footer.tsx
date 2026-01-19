import Link from 'next/link';

interface FooterProps {
  variant?: 'default' | 'minimal';
}

export default function Footer({ variant = 'default' }: FooterProps) {
  if (variant === 'minimal') {
    return (
      <footer className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link 
              href="/privacy" 
              className="text-xs font-light text-white/60 hover:text-white transition"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-xs font-light text-white/60 hover:text-white transition"
            >
              Terms of Use
            </Link>
          </div>
          <p className="text-xs text-white/40">© 2026 Flowery Fragrances. All rights reserved</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="backdrop-blur-sm bg-black/20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <p className="text-sm font-light tracking-wider text-white/60 mb-2">SCENT MEMORY</p>
            <p className="text-xs text-white/40">by Flowery Fragrances</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <h3 className="text-xs font-light text-white/50 uppercase tracking-wider mb-3">Legal</h3>
              <div className="space-y-2">
                <Link 
                  href="/privacy" 
                  className="block text-sm font-light text-white/60 hover:text-white transition"
                >
                  Privacy Policy & Impressum
                </Link>
                <Link 
                  href="/terms" 
                  className="block text-sm font-light text-white/60 hover:text-white transition"
                >
                  Terms of Use
                </Link>
              </div>
            </div>

          </div>

          <div className="text-center md:text-right">
            <p className="text-xs text-white/40">© 2026 Flowery Fragrances</p>
            <p className="text-xs text-white/30 mt-1">All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}