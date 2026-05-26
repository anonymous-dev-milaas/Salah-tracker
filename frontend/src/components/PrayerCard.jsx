import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  Circle,
} from 'lucide-react'

import usePreferencesStore from '../store/preferencesStore'
import { getTranslator } from '../i18n'
import { to12hr } from '../utils/timeFormat'

const STATUS_CONFIG = {
  ontime: {
    labelKey: 'onTime',
    color: 'text-emerald-300',
    icon: CheckCircle2,
    cardClass: 'card-ontime',
    iconBg: 'bg-emerald-400/15',
    btnActive:
      'bg-emerald-400/25 text-emerald-300 border-emerald-400/50 ring-1 ring-emerald-400/40',
  },

  qada: {
    labelKey: 'qada',
    color: 'text-amber-300',
    icon: Clock,
    cardClass: 'card-qada',
    iconBg: 'bg-amber-400/15',
    btnActive:
      'bg-amber-400/25 text-amber-300 border-amber-400/50 ring-1 ring-amber-400/40',
  },

  missed: {
    labelKey: 'missed',
    color: 'text-rose-300',
    icon: XCircle,
    cardClass: 'card-missed',
    iconBg: 'bg-rose-400/15',
    btnActive:
      'bg-rose-400/25 text-rose-300 border-rose-400/50 ring-1 ring-rose-400/40',
  },

  pending: {
    labelKey: 'pending',
    color: 'text-slate-500',
    icon: Circle,
    cardClass: 'card-pending',
    iconBg: 'bg-slate-700/50',
    btnActive: '',
  },
}

const PRAYER_ARABIC = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
}

const PRAYER_MALAYALAM = {
  fajr: 'സുബ്ഹി',
  dhuhr: 'ളുഹർ',
  asr: 'അസർ',
  maghrib: 'മഗ്‌രിബ്',
  isha: 'ഇശാ',
}

const ACTIONS = [
  {
    status: 'ontime',
    labelKey: 'onTime',
    base:
      'bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 border-emerald-400/20',
  },

  {
    status: 'qada',
    labelKey: 'qada',
    base:
      'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border-amber-400/20',
  },

  {
    status: 'missed',
    labelKey: 'missed',
    base:
      'bg-rose-400/10 hover:bg-rose-400/20 text-rose-400 border-rose-400/20',
  },
]

export default function PrayerCard({
  prayer,
  time,
  status,
  onMark,
  index,
  isNext,
}) {
  const { language } =
    usePreferencesStore()

  const t = getTranslator(language)

  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.pending

  const Icon = config.icon

  const prayerLabel =
    language === 'ml'
      ? PRAYER_MALAYALAM[prayer]
      : PRAYER_ARABIC[prayer]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.4,
        ease: 'easeOut',
      }}
      className={`
        relative
        rounded-2xl
        p-4
        transition-all
        duration-500
        ${config.cardClass}
        ${
          isNext
            ? 'ring-1 ring-emerald-400/30'
            : ''
        }
      `}
    >
      <AnimatePresence>
        {isNext && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
            }}
            className="
              absolute
              -top-2.5
              left-4
              bg-emerald-500
              text-white
              text-xs
              font-bold
              px-2.5
              py-0.5
              rounded-full
            "
          >
            Next Prayer
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">

        <div className="flex items-center gap-3">

          <div
            className={`
              w-11
              h-11
              rounded-2xl
              ${config.iconBg}
              flex
              items-center
              justify-center
              transition-all
              duration-500
            `}
          >
            <Icon
              size={22}
              className={config.color}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="font-semibold text-slate-100 capitalize text-base leading-tight">
              {prayer}
            </p>

            <p
              className={`text-slate-500 text-sm ${
                language === 'ml'
                  ? ''
                  : 'font-arabic'
              }`}
            >
              {prayerLabel}
            </p>
          </div>

        </div>

        <div className="text-right">

          <p className="text-slate-300 font-semibold text-sm">
            {to12hr(time)}
          </p>

          <motion.span
            key={status}
            initial={{
              opacity: 0,
              y: -4,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className={`text-xs font-semibold ${config.color}`}
          >
            {t(config.labelKey)}
          </motion.span>

        </div>

      </div>

      {/* Ayatul Kursi */}
      <div
        className="
          mb-3
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-cyan-300/20
          bg-cyan-300/10
          px-3
          py-2
          text-cyan-100/80
        "
      >
        <BookOpen
          size={14}
          className="
            shrink-0
            text-cyan-300
          "
        />

        <span className="truncate text-[11px] font-semibold">
          {language === 'ml'
            ? 'ആയത്തുൽ കുർസി ഓതുക'
            : t('ayatulKursiBonus')}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">

        {ACTIONS.map((action) => {
          const isActive =
            status === action.status

          return (
            <motion.button
              key={action.status}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                onMark(
                  prayer,
                  action.status
                )
              }
              className={`
                flex-1
                py-2
                rounded-xl
                text-xs
                font-semibold
                border
                transition-all
                duration-200
                ${
                  isActive
                    ? config.btnActive
                    : action.base
                }
              `}
            >
              {t(action.labelKey)}
            </motion.button>
          )
        })}

      </div>
    </motion.div>
  )
}