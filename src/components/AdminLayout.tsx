import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, ReactNode } from "react"
import { LayoutDashboard, Sparkles, ListChecks, MessageSquare, FolderKanban, LogOut, Search, Users } from "lucide-react"

interface AdminLayoutProps {
  children: ReactNode
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero", label: "Hero", icon: Sparkles },
  { href: "/admin/features", label: "Serviços", icon: ListChecks },
  { href: "/admin/testimonials", label: "Depoimentos", icon: MessageSquare },
  { href: "/admin/projects", label: "Projetos de Clientes", icon: FolderKanban },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/crm", label: "CRM / Leads", icon: Users },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando painel admin...</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col flex-shrink-0">
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
            EM Soluções
          </h2>
          <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-500">
            Admin CMS
          </p>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = router.pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </a>
            )
          })}
        </nav>
        <button
          onClick={() => {
            import("next-auth/react").then((mod) => mod.signOut({ callbackUrl: "/" }))
          }}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
            text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
