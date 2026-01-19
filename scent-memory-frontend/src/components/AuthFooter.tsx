import Link from 'next/link';

interface AuthFooterProps {
  text: string;
  linkText: string;
  linkHref: string;
}

export default function AuthFooter({ text, linkText, linkHref }: AuthFooterProps) {
  return (
    <>
      <p className="text-center mt-8 text-white/70 font-light text-sm">
        {text}{' '}
        <Link href={linkHref} className="text-[#e89a9c] hover:text-white font-normal transition">
          {linkText}
        </Link>
      </p>
      <div className="mt-12 pt-8 border-t border-white/10 text-center">
        <p className="text-xs text-white/50">© 2026 Flowery Fragrances · All rights reserved</p>
      </div>
    </>
  );
}