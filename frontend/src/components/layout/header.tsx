"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { LogOut, Menu } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { BrandMark } from "@/components/brand/brand-mark"

export function Header() {
  const { user, logout } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="flex items-center gap-3 md:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <Menu className="size-4" />
        </Button>
        <BrandMark compact />
      </div>

      <div className="hidden md:block">
        <BrandMark compact />
      </div>

      {mobileNavOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <nav className="fixed left-0 top-16 z-50 w-64 border-r border-border/70 bg-background/95 p-3 shadow-[0_20px_60px_rgba(11,42,85,0.16)] md:hidden">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/dashboard/usuarios", label: "Usuarios" },
              { href: "/dashboard/roles", label: "Roles" },
              { href: "/dashboard/instituciones", label: "Instituciones" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileNavOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-border/70 bg-card px-3 py-1 text-sm text-muted-foreground sm:inline">
          {user?.email}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </Button>
      </div>
    </header>
  )
}
