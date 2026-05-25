import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, BarChart3, User } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Today' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-lg mx-auto relative">
      {/* Main content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg glass border-t border-border z-50">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-emerald-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-emerald-400/10' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}