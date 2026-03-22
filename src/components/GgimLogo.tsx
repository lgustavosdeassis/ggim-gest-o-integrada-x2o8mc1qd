import localFallbackLogo from '@/assets/logo-cmtecs-a4c2e.jpeg'

const EXTERNAL_LOGO_URL =
  'https://storage.googleapis.com/skip-develop.appspot.com/user-content/3fdf6cde-c0bd-464a-bc91-22941edc8b82/cmtecs-GGIM_logo_1.jpg'

export function GgimLogo({ className = 'w-full h-full object-contain' }: { className?: string }) {
  return (
    <img
      src={EXTERNAL_LOGO_URL}
      alt="GGIM Foz do Iguaçu Logo"
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        // Basic fallback to local image to avoid broken image icon
        if (!target.src.includes('logo-cmtecs')) {
          target.src = localFallbackLogo
        }
      }}
    />
  )
}
