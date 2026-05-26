import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, BarChart3, User } from 'lucide-react'
import usePreferencesStore from '../store/preferencesStore'
import { getTranslator } from '../i18n'

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'navToday' },
  { to: '/calendar', icon: CalendarDays, labelKey: 'navCalendar' },
  { to: '/stats', icon: BarChart3, labelKey: 'navStats' },
  { to: '/profile', icon: User, labelKey: 'navProfile' },
]

export default function Layout() {
  const { language } = usePreferencesStore()
  const t = getTranslator(language)

  return (
    <div className="page-bg flex min-h-screen w-full lg:h-screen lg:overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="relative hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen overflow-hidden p-6 glass border-r border-white/5">
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-arabic text-5xl text-emerald-300/[0.025]">
          سيد سالم
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
            <span className="text-xl">🌙</span>
          </div>
          <div>
            <p className="font-bold text-slate-100 leading-tight">Salah</p>
            <p className="text-emerald-400 text-xs font-medium">Tracker</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span>{t(labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-28 lg:h-screen lg:pb-8 overflow-y-auto">
        <div className="max-w-2xl lg:max-w-3xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
        <div className="glass rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-around px-2 py-3">
            {navItems.map(({ to, icon: Icon, labelKey }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-1.5 rounded-2xl transition-all duration-200 ${
                    isActive ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-emerald-400/12' : ''}`}>
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    </div>
                    <span className="w-full truncate text-center text-[11px] font-medium">{t(labelKey)}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

    </div>
  )
}