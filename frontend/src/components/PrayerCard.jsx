import { motion } from 'framer-motion'
import { CheckCircle2, Clock, XCircle, Circle } from 'lucide-react'

const STATUS_CONFIG = {
  ontime:  { label: 'On Time', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', icon: CheckCircle2, glow: 'glow-green' },
  qada:    { label: 'Qada',    color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30',   icon: Clock,        glow: 'glow-amber' },
  missed:  { label: 'Missed',  color: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/30',    icon: XCircle,      glow: 'glow-red'   },
  pending: { label: 'Pending', color: 'text-slate-400',   bg: 'bg-slate-400/10',   border: 'border-slate-400/30',   icon: Circle,       glow: ''           },
}

const PRAYER_ARABIC = {
  fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء'
}

const ACTIONS = [
  { status: 'ontime', label: '✓ On Time', color: 'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border-emerald-500/30' },
  { status: 'qada',   label: '↺ Qada',   color: 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border-amber-500/30'   },
  { status: 'missed', label: '✕ Missed', color: 'bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border-rose-500/30'     },
]

export default function PrayerCard({ prayer, time, status, onMark, index }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`glass rounded-2xl p-4 border ${config.border} ${config.glow} transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
            <Icon size={20} className={config.color} strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-slate-100 capitalize text-base leading-tight">{prayer}</p>
            <p className="font-arabic text-slate-400 text-sm">{PRAYER_ARABIC[prayer]}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-200 font-medium text-sm">{time || '—'}</p>
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        {ACTIONS.map((action) => (
          <button
            key={action.status}
            onClick={() => onMark(prayer, action.status)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${action.color} ${status === action.status ? 'ring-1 ring-offset-1 ring-offset-card ring-current' : ''}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </motion.div>
  )
}