import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns'
import api from '../api/axios'

function getDayColor(day) {
  if (!day) return ''
  const { ontime = 0, qada = 0, missed = 0, pending = 0 } = day
  const total = ontime + qada + missed + pending
  if (total === 0) return 'bg-slate-800 text-slate-500'
  if (missed === 5) return 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
  if (ontime === 5) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
  if (qada > 0 || missed > 0) return 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
  return 'bg-emerald-500/10 text-emerald-400'
}

function DotBar({ ontime = 0, qada = 0, missed = 0, pending = 0 }) {
  const dots = [
    ...Array(ontime).fill('bg-emerald-400'),
    ...Array(qada).fill('bg-amber-400'),
    ...Array(missed).fill('bg-rose-400'),
    ...Array(pending).fill('bg-slate-600'),
  ]
  return (
    <div className="flex gap-0.5 justify-center mt-1 flex-wrap">
      {dots.slice(0, 5).map((c, i) => <div key={i} className={`w-1 h-1 rounded-full ${c}`} />)}
    </div>
  )
}

export default function CalendarPage() {
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 })
  const [monthData, setMonthData] = useState({})
  const [selected, setSelected] = useState(null)
  const [dayDetail, setDayDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/prayers/month/', { params: current })
        const map = {}
        res.data.forEach(d => { map[d.date] = d })
        setMonthData(map)
      } finally { setLoading(false) }
    }
    load()
  }, [current])

  const loadDay = async (dateStr) => {
    setSelected(dateStr)
    try {
      const res = await api.get('/prayers/date/', { params: { date: dateStr } })
      setDayDetail(res.data)
    } catch { setDayDetail(null) }
  }

  const daysInMonth = getDaysInMonth(new Date(current.year, current.month - 1))
  const firstDayOfWeek = getDay(startOfMonth(new Date(current.year, current.month - 1)))
  const monthLabel = format(new Date(current.year, current.month - 1), 'MMMM yyyy')

  const prev = () => setCurrent(c => c.month === 1 ? { year: c.year - 1, month: 12 } : { ...c, month: c.month - 1 })
  const next = () => setCurrent(c => c.month === 12 ? { year: c.year + 1, month: 1 } : { ...c, month: c.month + 1 })

  const STATUS_CONFIG = {
    ontime: { label: 'On Time', color: 'text-emerald-400' },
    qada:   { label: 'Qada',    color: 'text-amber-400' },
    missed: { label: 'Missed',  color: 'text-rose-400' },
    pending:{ label: 'Pending', color: 'text-slate-400' },
  }

  return (
    <div className="px-4 pt-12 pb-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-slate-100 mb-6">
        Calendar
      </motion.h1>

      <div className="glass rounded-2xl p-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prev} className="p-2 rounded-xl hover:bg-slate-700 transition-colors">
            <ChevronLeft size={18} className="text-slate-400" />
          </button>
          <h2 className="font-semibold text-slate-100">{monthLabel}</h2>
          <button onClick={next} className="p-2 rounded-xl hover:bg-slate-700 transition-colors">
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-slate-500 py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1
              const dateStr = `${current.year}-${String(current.month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const data = monthData[dateStr]
              const isToday = dateStr === format(today, 'yyyy-MM-dd')
              const isSelected = dateStr === selected
              return (
                <button key={day} onClick={() => loadDay(dateStr)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-medium transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-emerald-400 ' : ''
                  }${isToday ? 'ring-1 ring-slate-400 ' : ''}${getDayColor(data) || 'text-slate-400 hover:bg-slate-700'}`}
                >
                  <span>{day}</span>
                  {data && <DotBar {...data} />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 px-1">
        {[['bg-emerald-400','All On Time'],['bg-amber-400','Some Qada'],['bg-rose-400','All Missed'],['bg-slate-600','Pending']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Day detail */}
      {selected && dayDetail && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 glass rounded-2xl p-4">
          <h3 className="font-semibold text-slate-200 mb-3">{format(new Date(selected + 'T00:00:00'), 'MMMM d, yyyy')}</h3>
          {dayDetail.prayers.length === 0 ? (
            <p className="text-slate-500 text-sm">No prayer data for this day</p>
          ) : (
            <div className="space-y-2">
              {dayDetail.prayers.map(p => {
                const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                return (
                  <div key={p.prayer} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <span className="text-slate-300 capitalize font-medium">{p.prayer}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs">{p.prayer_time || '—'}</span>
                      <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}