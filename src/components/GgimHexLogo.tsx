export function GgimHexLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 5L90 25V75L50 95L10 75V25L50 5Z"
        fill="rgba(255,255,255,0.05)"
        stroke="currentColor"
        strokeWidth="2"
        className="text-white/30"
      />
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fill="white"
        fontSize="24"
        fontWeight="900"
        letterSpacing="4"
        style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }}
      >
        GGIM
      </text>
    </svg>
  )
}
