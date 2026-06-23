'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, UtensilsCrossed, ShoppingCart, TrendingUp, Settings } from 'lucide-react'

const TABS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/workout', label: 'Workout', icon: Dumbbell },
  { href: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { href: '/grocery', label: 'Grocery', icon: ShoppingCart },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center z-50">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
