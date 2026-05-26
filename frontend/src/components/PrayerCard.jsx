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
    color: 'text-emerald-200',
    icon: CheckCircle2,
    cardClass: 'card-ontime',
    iconBg: 'bg-emerald-400/18',
    btnActive:
      'bg-emerald-400/30 text-emerald-200 border-emerald-400/60 ring-1 ring-emerald-400/50',
  },

  qada: {
    labelKey: 'qada',
    color: 'text-amber-200',
    icon: Clock,
    cardClass: 'card-qada',
    iconBg: 'bg-amber-400/18',
    btnActive:
      'bg-amber-400/30 text-amber-200 border-amber-400/60 ring-1 ring-amber-400/50',
  },

  missed: {
    labelKey: 'missed',
    color: 'text-rose-200',
    icon: XCircle,
    cardClass: 'card-missed',
    iconBg: 'bg-rose-400/18',
    btnActive:
      'bg-rose-400/30 text-rose-200 border-rose-400/60 ring-1 ring-rose-400/50',
  },

  pending: {
    labelKey: 'pending',
    color: 'text-slate-400',
    icon: Circle,
    cardClass: 'card-pending',
    iconBg: 'bg-slate-700/60',
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
      'bg-emerald-400/12 hover:bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
  },

  {
    status: 'qada',
    labelKey: 'qada',
    base:
      'bg-amber-400/12 hover:bg-amber-400/20 text-amber-300 border-amber-400/30',
  },

  {
    status: 'missed',
    labelKey: 'missed',
    base:
      'bg-rose-400/12 hover:bg-rose-400/20 text-rose-300 border-rose-400/30',
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
        rounded-3xl
        p-5
        transition-all
        duration-500
        ${config.cardClass}
        ${
          isNext
            ? 'ring-1 ring-emerald-400/40'
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
              left-5
              bg-emerald-500
              text-white
              text-xs
              font-bold
              px-3
              py-1
              rounded-full
            "
          >
            Next Prayer
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-5">

        <div className="flex items-center gap-4">

          <div
            className={`
              w-14
              h-14
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
              size={26}
              className={config.color}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="font-bold text-slate-100 capitalize text-2xl leading-tight">
              {prayer}
            </p>

            <p
              className={`text-slate-400 text-base ${
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

          <p className="text-slate-200 font-bold text-xl">
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
            className={`text-sm font-semibold ${config.color}`}
          >
            {t(config.labelKey)}
          </motion.span>

        </div>

      </div>

      {/* Ayatul Kursi */}
      <div
        className="
          mb-4
          flex
          items-center
          gap-3
          rounded-2xl
          border
          border-cyan-300/20
          bg-cyan-300/10
          px-4
          py-3
          text-cyan-100/90
        "
      >
        <BookOpen
          size={16}
          className="
            shrink-0
            text-cyan-300
          "
        />

        <span className="truncate text-sm font-semibold">
          {language === 'ml'
            ? 'ആയത്തുൽ കുർസി ഓതുക'
            : t('ayatulKursiBonus')}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">

        {ACTIONS.map((action) => {
          const isActive =
            status === action.status

          return (
            <motion.button
              key={action.status}
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                onMark(
                  prayer,
                  action.status
                )
              }
              className={`
                flex-1
                py-3
                rounded-2xl
                text-sm
                font-bold
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