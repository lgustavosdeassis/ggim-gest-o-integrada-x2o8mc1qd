import localLogo from '@/assets/logo-cmtecs-a4c2e.jpeg'

export function GgimLogo({ className = 'w-full h-full object-contain' }: { className?: string }) {
  return <img src={localLogo} alt="GGIM Foz do Iguaçu Logo" className={className} />
}
