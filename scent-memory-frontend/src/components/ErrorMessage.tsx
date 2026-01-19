interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div 
      role="alert" 
      className="bg-red-900/20 border border-red-500/30 text-red-300 p-3 rounded text-sm"
    >
      {message}
    </div>
  );
}