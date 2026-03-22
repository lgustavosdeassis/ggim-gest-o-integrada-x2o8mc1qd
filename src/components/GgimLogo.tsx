export function GgimLogo({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className={className} fill="none">
      <path
        d="M100 15 L25 45 V90 C25 140 55 170 100 190 C145 170 175 140 175 90 V45 L100 15 Z"
        fill="#eab308"
        stroke="#ffffff"
        strokeWidth="4"
      />
      <path
        d="M100 25 L35 52 V90 C35 130 60 155 100 175 C140 155 165 130 165 90 V52 L100 25 Z"
        fill="#0f172a"
      />
      <circle cx="100" cy="95" r="35" fill="none" stroke="#eab308" strokeWidth="6" />
      <path d="M100 65 V125 M70 95 H130" stroke="#eab308" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}
