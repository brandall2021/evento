"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Shield, Building2, BookOpen, ClipboardList, DollarSign, QrCode, BadgeCheck, FormInput, Layers3 } from "lucide-react"
import { BrandMark } from "@/components/brand/brand-mark"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/cursos", label: "Cursos", icon: BookOpen },
  { href: "/dashboard/inscripciones", label: "Inscripciones", icon: ClipboardList },
  { href: "/dashboard/pagos", label: "Pagos", icon: DollarSign },
  { href: "/dashboard/checkin", label: "Check-in", icon: QrCode },
  { href: "/dashboard/credenciales", label: "Credenciales", icon: BadgeCheck },
  { href: "/dashboard/formularios", label: "Formularios", icon: FormInput },
  { href: "/dashboard/programa-academico", label: "Programa académico", icon: Layers3 },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
  { href: "/dashboard/roles", label: "Roles", icon: Shield },
  { href: "/dashboard/instituciones", label: "Instituciones", icon: Building2 },
  { href: "/dashboard/permisos", label: "Permisos", icon: Shield },
  { href: "/dashboard/settings", label: "Settings", icon: Building2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(247,243,235,0.96))] md:block dark:bg-[linear-gradient(180deg,rgba(8,18,38,0.96),rgba(12,23,46,0.98))]">
      <div className="flex h-20 items-center border-b border-border/70 px-5">
        <BrandMark className="w-full justify-start" />
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-[0_10px_26px_rgba(11,42,85,0.16)]"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
