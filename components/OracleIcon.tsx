interface OracleIconProps {
  className?: string;
}

export default function OracleIcon({ className = "w-6 h-6" }: OracleIconProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Crystal ball/oracle icon */}
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18" opacity="0.3" />
      <path d="M3 12h18" opacity="0.3" />
      <circle cx="12" cy="12" r="3" />
      <path d="M8 8l8 8" opacity="0.2" />
      <path d="M16 8l-8 8" opacity="0.2" />
    </svg>
  );
}
