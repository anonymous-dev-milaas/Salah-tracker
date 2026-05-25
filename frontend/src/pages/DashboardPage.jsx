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
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

// Parse "HH:MM" time string into today's Date object
function parseTime(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

// Find the next upcoming prayer index
function getNextPrayerIndex(prayers, times) {
  const now = new Date()
  for (let i = 0; i < PRAYER_ORDER.length; i++) {
    const t = parseTime(times[PRAYER_ORDER[i]])
    if (t && t > now) return i
  }
  return -1
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [prayers, setPrayers]   = useState([])
  const [times, setTimes]       = useState({})
  const [streak, setStreak]     = useState(0)
  const [loading, setLoading]   = useState(true)
  const [nextIdx, setNextIdx]   = useState(-1)

  const autoMarkMissed = useCallback(async (prayerList, prayerTimes) => {
    const now = new Date()
    const updated = [...prayerList]

    for (let i = 0; i < updated.length; i++) {
      const p = updated[i]
      if (p.status !== 'pending') continue

      const prayerName = p.prayer
      const t = parseTime(prayerTimes[prayerName])
      if (!t) continue

      // Determine "deadline" = next prayer's time (or midnight for Isha)
      const nextPrayerName = PRAYER_ORDER[i + 1]
      const deadline = nextPrayerName
        ? parseTime(prayerTimes[nextPrayerName])
        : (() => { const d = new Date(); d.setHours(23,59,59,999); return d })()

      // If current time is past the deadline, auto-mark as missed
      if (deadline && now > deadline) {
        try {
          const res = await api.post('/prayers/mark/', {
            prayer: prayerName,
            status: 'missed',
          })
          updated[i] = { ...updated[i], status: res.data.status }
        } catch (e) {
          console.error('Auto-mark failed:', e)
        }
      }
    }

    return updated
  }, [])

  const loadData = useCallback(async () => {
    try {
      const [todayRes, streakRes] = await Promise.all([
        api.get('/prayers/today/'),
        api.get('/prayers/streak/'),
      ])

      const prayerMap = {}
      todayRes.data.prayers.forEach(p => { prayerMap[p.prayer] = p })
      let prayerList = PRAYER_ORDER.map(
        name => prayerMap[name] || { prayer: name, status: 'pending' }
      )

      const fetchedTimes = todayRes.data.times || {}
      setTimes(fetchedTimes)

      // Auto-mark past pending prayers as missed
      prayerList = await autoMarkMissed(prayerList, fetchedTimes)

      setPrayers(prayerList)
      setStreak(streakRes.data.streak)
      setNextIdx(getNextPrayerIndex(prayerList, fetchedTimes))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [autoMarkMissed])

  useEffect(() => {
    loadData()
    // Re-check every 60 seconds for auto-marking
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [loadData])

  const markPrayer = async (prayerName, newStatus) => {
    try {
      const res = await api.post('/prayers/mark/', {
        prayer: prayerName,
        status: newStatus,
      })
      setPrayers(prev =>
        prev.map(p => p.prayer === prayerName ? { ...p, status: res.data.status } : p)
      )
    } catch (e) {
      console.error(e)
    }
  }

  const stats = prayers.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  const prayedCount = 5 - (stats.pending || 0)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="px-4 pt-10 pb-6 space-y-5">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-sm">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-slate-100 mt-0.5">{user?.username} 👋</h1>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-slate-600" />
              <span className="text-slate-600 text-xs">{user?.city || 'Malappuram'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/25 rounded-2xl px-3 py-2"
              >
                <Flame size={15} className="text-amber-400" />
                <span className="text-amber-300 font-bold text-sm">{streak}</span>
              </motion.div>
            )}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={loadData}
              className="p-2.5 glass-light rounded-2xl text-slate-500 hover:text-slate-300 transition-colors"
            >
              <RefreshCw size={15} />
            </motion.button>
          </div>
        </div>
        <p className="text-slate-600 text-xs mt-2">{formatDate()}</p>
      </motion.div>

      {/* ── Progress card ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-light rounded-2xl p-4"
      >
        <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
          <span className="font-medium">Today's Progress</span>
          <span className="text-slate-400 font-semibold">{prayedCount} / 5 prayed</span>
        </div>

        {/* Segmented bar */}
        <div className="flex gap-1.5 h-2.5">
          {prayers.map((p) => (
            <motion.div
              key={p.prayer}
              layout
              className={`flex-1 rounded-full transition-all duration-700 ${
                p.status === 'ontime'  ? 'bg-emerald-400' :
                p.status === 'qada'   ? 'bg-amber-400'   :
                p.status === 'missed' ? 'bg-rose-400'    : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3">
          {[
            ['ontime',  'bg-emerald-400', 'On Time'],
            ['qada',    'bg-amber-400',   'Qada'],
            ['missed',  'bg-rose-400',    'Missed'],
          ].map(([key, color, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-slate-500">{stats[key] || 0} {label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Prayer cards ── */}
      <div className="space-y-3">
        {prayers.map((p, i) => (
          <PrayerCard
            key={p.prayer}
            prayer={p.prayer}
            time={times[p.prayer]}
            status={p.status}
            onMark={markPrayer}
            index={i}
            isNext={i === nextIdx}
          />
        ))}
      </div>

    </div>
  )
}
