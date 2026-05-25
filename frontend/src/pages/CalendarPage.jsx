import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns'
import api from '../api/axios'
import usePreferencesStore from '../store/preferencesStore'
import { getLocale, getTranslator } from '../i18n'

const STATUS_KEYS = {
  ontime:  { labelKey: 'onTime', color: 'text-emerald-400' },
  qada:    { labelKey: 'qada',    color: 'text-amber-400'   },
  missed:  { labelKey: 'missed',  color: 'text-rose-400'    },
  pending: { labelKey: 'pending', color: 'text-slate-500'   },
}

function getDayStyle(data) {
  if (!data) return 'bg-slate-900/70 text-slate-600 border-white/5'
  const { ontime = 0, qada = 0, missed = 0 } = data
  const total = ontime + qada + missed
  if (total === 0) return 'bg-slate-900/70 text-slate-600 border-white/5'
  if (ontime === 5) return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
  if (missed === 5) return 'bg-rose-500/20 text-rose-200 border-rose-400/40'
  if (qada >= ontime && qada >= missed) return 'bg-amber-500/20 text-amber-200 border-amber-400/30'
  if (missed > ontime) return 'bg-rose-500/20 text-rose-200 border-rose-400/30'
  return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
}

function DayStatus({ ontime = 0, qada = 0, missed = 0, pending = 0 }) {
  const colors = [
    ...Array(ontime).fill('bg-emerald-400'),
    ...Array(qada).fill('bg-amber-400'),
    ...Array(missed).fill('bg-rose-400'),
    ...Array(pending).fill('bg-slate-600'),
  ].slice(0, 5)

  while (colors.length < 5) colors.push('bg-slate-800')

  return (
    <div className="grid w-full grid-cols-5 gap-0.5" aria-hidden="true">
      {colors.map((color, i) => (
        <span key={i} className={`h-2 rounded-sm ${color}`} />
      ))}
    </div>
  )
}

function formatMonthLabel(date, locale) {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date)
}

function formatDayLabel(date, locale) {
  return new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(date)
}

export default function CalendarPage() {
  const { language } = usePreferencesStore()
  const t = getTranslator(language)
  const locale = getLocale(language)
  const today = new Date()
  const [current, setCurrent]   = useState({ year: today.getFullYear(), month: today.getMonth() + 1 })
  const [monthData, setMonthData] = useState({})
  const [selected, setSelected] = useState(null)
  const [dayDetail, setDayDetail] = useState(null)
  const [loading, setLoading]   = useState(false)

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
    if (selected === dateStr) { setSelected(null); setDayDetail(null); return }
    setSelected(dateStr)
    try {
      const res = await api.get('/prayers/date/', { params: { date: dateStr } })
      setDayDetail(res.data)
    } catch { setDayDetail(null) }
  }

  const daysInMonth  = getDaysInMonth(new Date(current.year, current.month - 1))
  const firstDayOfWeek = getDay(startOfMonth(new Date(current.year, current.month - 1)))
  const monthDate = new Date(current.year, current.month - 1)
  const monthLabel = formatMonthLabel(monthDate, locale)

  const prev = () => setCurrent(c =>
    c.month === 1 ? { year: c.year - 1, month: 12 } : { ...c, month: c.month - 1 }
  )
  const next = () => setCurrent(c =>
    c.month === 12 ? { year: c.year + 1, month: 1 } : { ...c, month: c.month + 1 }
  )

  const todayStr = format(today, 'yyyy-MM-dd')
  const monthEntries = Object.values(monthData)
  const monthTotals = monthEntries.reduce((acc, item) => ({
    ontime: acc.ontime + (item.ontime || 0),
    qada: acc.qada + (item.qada || 0),
    missed: acc.missed + (item.missed || 0),
    pending: acc.pending + (item.pending || 0),
  }), { ontime: 0, qada: 0, missed: 0, pending: 0 })
  const trackedPrayers = monthTotals.ontime + monthTotals.qada + monthTotals.missed
  const totalPossible = daysInMonth * 5
  const completion = totalPossible ? Math.round((trackedPrayers / totalPossible) * 100) : 0

  return (
    <div className="relative overflow-hidden px-4 pt-10 pb-6 space-y-5">
      <div className="pointer-events-none absolute -top-28 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-80px] top-40 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">{monthLabel}</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-50">{t('calendarTitle')}</h1>
            <p className="mt-1 text-sm text-slate-400">{t('calendarSubtitle')}</p>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-right shadow-lg shadow-emerald-950/20 backdrop-blur-xl">
            <p className="text-lg font-black text-emerald-200">{completion}%</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/70">{t('completed')}</p>
          </div>
        </div>
      </motion.div>

      <div className="relative rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-3.5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <div className="absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_35%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <motion.button whileTap={{ scale: 0.9 }} onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-slate-300 shadow-inner shadow-white/5 backdrop-blur-xl transition-colors hover:text-white">
              <ChevronLeft size={18} />
            </motion.button>
            <div className="text-center">
              <h2 className="text-base font-black text-slate-50">{monthLabel}</h2>
              <p className="text-xs text-slate-500">{trackedPrayers} / {totalPossible} {t('tracked')}</p>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-slate-300 shadow-inner shadow-white/5 backdrop-blur-xl transition-colors hover:text-white">
              <ChevronRight size={18} />
            </motion.button>
          </div>

          <div className="mb-2 grid grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date(2026, 1, i + 1)
              const label = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)
              return <div key={i} className="py-1 text-center text-[10px] font-bold uppercase text-slate-500">{label}</div>
            })}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-7 w-7 rounded-full border-2 border-emerald-300 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`e${i}`} className="h-14" />)}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const day = i + 1
                const dateStr = `${current.year}-${String(current.month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                const date = new Date(dateStr + 'T00:00:00')
                const data = monthData[dateStr]
                const style = getDayStyle(data)
                const isToday = dateStr === todayStr
                const isSel = dateStr === selected

                return (
                  <motion.button
                    key={day}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => loadDay(dateStr)}
                    className={`relative flex h-14 min-w-0 flex-col items-stretch justify-between overflow-hidden rounded-2xl border px-1.5 py-1.5 text-xs font-black shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 ${style} ${isToday ? 'ring-2 ring-emerald-300/70 ring-offset-1 ring-offset-slate-950' : ''} ${isSel ? 'ring-2 ring-white/40' : ''}`}
                    aria-label={`${formatDayLabel(date, locale)}${data ? `, ${data.ontime || 0} ${t('onTime')}, ${data.qada || 0} ${t('qada')}, ${data.missed || 0} ${t('missed')}` : `, ${t('noData')}`}`}
                  >
                    <span className="absolute inset-x-0 top-0 h-px bg-white/25" />
                    <span className="leading-none">{day}</span>
                    <DayStatus {...(data || {})} />
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          ['bg-emerald-400 shadow-emerald-400/30', t('onTime')],
          ['bg-amber-400 shadow-amber-400/30', t('qada')],
          ['bg-rose-400 shadow-rose-400/30', t('missed')],
          ['bg-slate-700 shadow-slate-700/20', t('noData')],
        ].map(([color, label]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2 backdrop-blur-xl">
            <div className={`mb-1 h-2.5 w-7 rounded-full shadow-lg ${color}`} />
            <span className="block truncate text-[11px] font-semibold text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {selected && dayDetail && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl"
        >
          <h3 className="mb-4 font-black text-slate-100">
            {formatDayLabel(new Date(selected + 'T00:00:00'), locale)}
          </h3>

          {dayDetail.prayers.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">{t('noPrayerData')}</p>
          ) : (
            <div className="space-y-2">
              {dayDetail.prayers.map(p => {
                const cfg = STATUS_KEYS[p.status] || STATUS_KEYS.pending
                const barColor =
                  p.status === 'ontime' ? 'bg-emerald-400' :
                  p.status === 'qada'   ? 'bg-amber-400'   :
                  p.status === 'missed' ? 'bg-rose-400'     : 'bg-slate-700'
                return (
                  <div key={p.prayer}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-1 rounded-full ${barColor}`} />
                      <span className="text-sm font-bold capitalize text-slate-100">{p.prayer}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{p.prayer_time || '-'}</span>
                      <span className={`text-xs font-black ${cfg.color}`}>{t(cfg.labelKey)}</span>
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
