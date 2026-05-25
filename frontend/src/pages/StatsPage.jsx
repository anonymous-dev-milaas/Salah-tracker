import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Award, AlertCircle } from 'lucide-react'
import api from '../api/axios'

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [streak, setStreak] = useState(0)
  const year = new Date().getFullYear()

  useEffect(() => {
    Promise.all([
      api.get('/prayers/yearly-stats/', { params: { year } }),
      api.get('/prayers/streak/'),
    ]).then(([sRes, stRes]) => {
      setStats(sRes.data)
      setStreak(stRes.data.streak)
    })
  }, [])

  if (!stats) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const prayed = stats.ontime + stats.qada
  const pct = stats.total > 0 ? Math.round((stats.ontime / stats.total) * 100) : 0

  const CARDS = [
    { label: 'On Time', value: stats.ontime, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: Award },
    { label: 'Qada',    value: stats.qada,   color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   icon: TrendingUp },
    { label: 'Missed',  value: stats.missed, color: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/20',    icon: AlertCircle },
  ]

  return (
    <div className="px-4 pt-12 pb-6 space-y-5">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-slate-100">
        Statistics
      </motion.h1>

      {/* Year + streak */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Year</p>
          <p className="text-2xl font-bold text-slate-100">{year}</p>
          <p className="text-slate-500 text-xs mt-1">{stats.total} total prayers</p>
        </div>
        <div className="glass rounded-2xl p-4 border border-amber-400/20 bg-amber-400/5">
          <p className="text-slate-400 text-xs mb-1">Best Streak 🔥</p>
          <p className="text-2xl font-bold text-amber-400">{streak} days</p>
          <p className="text-slate-500 text-xs mt-1">All 5 on time</p>
        </div>
      </div>

      {/* On-time percentage ring */}
      <div className="glass rounded-2xl p-5 flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#1E293B" strokeWidth="8" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="#10B981" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-emerald-400">{pct}%</span>
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-100">On-Time Rate</p>
          <p className="text-slate-400 text-sm">{stats.ontime} of {stats.total} prayers on time</p>
          <p className="text-slate-500 text-xs mt-1">{prayed} total prayed ({stats.qada} as qada)</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {CARDS.map(({ label, value, color, bg, border, icon: Icon }) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`glass rounded-2xl p-4 border ${border} ${bg}`}>
            <Icon size={16} className={`${color} mb-2`} />
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-400 text-xs mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Prayer breakdown */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-semibold text-slate-200 mb-4">Year at a Glance</h3>
        <div className="space-y-3">
          {[
            { label: 'On Time', value: stats.ontime, color: 'bg-emerald-400', total: stats.total },
            { label: 'Qada',    value: stats.qada,   color: 'bg-amber-400',  total: stats.total },
            { label: 'Missed',  value: stats.missed, color: 'bg-rose-400',   total: stats.total },
          ].map(({ label, value, color, total }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{label}</span>
                <span>{total > 0 ? Math.round((value/total)*100) : 0}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${total > 0 ? (value/total)*100 : 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }} className={`h-full ${color} rounded-full`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}