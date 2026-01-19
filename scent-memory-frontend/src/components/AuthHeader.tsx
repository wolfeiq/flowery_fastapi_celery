interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <>
      <div className="text-center mb-8">
        <p className="text-sm font-light tracking-wider text-white/90">SCENT MEMORY</p>
      </div>
      <div className="mb-10">
        <h2 
          className="text-7xl font-light mb-4 text-white/90 text-center" 
          style={{ fontFamily: "'HUMANE', sans-serif" }}
        >
          {title}
        </h2>
        <p className="text-white/70 font-light text-center">{subtitle}</p>
      </div>
    </>
  );
}