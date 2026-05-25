import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Flame, MapPin, RefreshCw } from 'lucide-react'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import PrayerCard from '../components/PrayerCard'

const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

function getGreeting() {
  const h = new Date().getHours()
  const greeting =
    h < 5  ? 'Good Evening' :
    h < 12 ? 'Good Morning' :
    h < 17 ? 'Good Afternoon' : 'Good Evening'

  return `${greeting}, السلام عليكم!`
}

function formatDate(d = new Date()) {
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [prayers, setPrayers] = useState([])
  const [times, setTimes] = useState({})
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [todayRes, streakRes] = await Promise.all([
        api.get('/prayers/today/'),
        api.get('/prayers/streak/'),
      ])
      const prayerMap = {}
      todayRes.data.prayers.forEach(p => { prayerMap[p.prayer] = p })
      setPrayers(PRAYER_ORDER.map(name => prayerMap[name] || { prayer: name, status: 'pending' }))
      setTimes(todayRes.data.times || {})
      setStreak(streakRes.data.streak)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const markPrayer = async (prayerName, newStatus) => {
    try {
      const res = await api.post('/prayers/mark/', { prayer: prayerName, status: newStatus })
      setPrayers(prev => prev.map(p => p.prayer === prayerName ? { ...p, status: res.data.status } : p))
    } catch (e) {
      console.error(e)
    }
  }

  const stats = prayers.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc }, {})

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="px-4 pt-12 pb-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-slate-100">{user?.username} 👋</h1>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-slate-500" />
              <span className="text-slate-500 text-xs">{user?.city || 'Malappuram'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 rounded-xl px-3 py-2">
                <Flame size={16} className="text-amber-400" />
                <span className="text-amber-300 font-bold text-sm">{streak}</span>
              </div>
            )}
            <button onClick={loadData} className="p-2 glass rounded-xl text-slate-400 hover:text-slate-200 transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        <p className="text-slate-500 text-xs mt-2">{formatDate()}</p>
      </motion.div>

      {/* Day progress bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-4">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Today's Progress</span>
          <span>{5 - (stats.pending || 0)}/5 prayers</span>
        </div>
        <div className="flex gap-1">
          {prayers.map((p) => (
            <div key={p.prayer} className={`flex-1 h-2 rounded-full transition-all duration-500 ${
              p.status === 'ontime' ? 'bg-emerald-400' :
              p.status === 'qada' ? 'bg-amber-400' :
              p.status === 'missed' ? 'bg-rose-400' : 'bg-slate-700'
            }`} />
          ))}
        </div>
        <div className="flex gap-3 mt-3">
          {[['ontime','emerald','On Time'],['qada','amber','Qada'],['missed','rose','Missed']].map(([key, color, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full bg-${color}-400`} />
              <span className="text-xs text-slate-400">{stats[key] || 0} {label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Prayer cards */}
      <div className="space-y-3">
        {prayers.map((p, i) => (
          <PrayerCard
            key={p.prayer}
            prayer={p.prayer}
            time={times[p.prayer]}
            status={p.status}
            onMark={markPrayer}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}