import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame, MapPin, RefreshCw } from 'lucide-react'
import { format, subDays } from 'date-fns'

import api from '../api/axios'
import useAuthStore from '../store/authStore'
import PrayerCard from '../components/PrayerCard'

const PRAYER_ORDER = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
]

function getGreeting() {
  const h = new Date().getHours()

  const greeting =
    h < 5
      ? 'Good Evening'
      : h < 12
      ? 'Good Morning'
      : h < 17
      ? 'Good Afternoon'
      : 'Good Evening'

  return `${greeting}, السلام عليكم!`
}

function formatDate(d = new Date()) {
  return d.toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )
}

function parseTime(timeStr) {
  if (!timeStr) return null

  const [h, m] = String(timeStr)
    .slice(0, 5)
    .split(':')
    .map(Number)

  const d = new Date()

  d.setHours(h, m, 0, 0)

  return d
}

function getNextPrayerIndex(
  prayers,
  times
) {
  const now = new Date()

  for (
    let i = 0;
    i < PRAYER_ORDER.length;
    i++
  ) {
    const t = parseTime(
      times[PRAYER_ORDER[i]]
    )

    if (t && t > now) return i
  }

  return -1
}

export default function DashboardPage() {
  const { user } = useAuthStore()

  const today = useMemo(
    () =>
      format(
        new Date(),
        'yyyy-MM-dd'
      ),
    []
  )

  const [selectedDate, setSelectedDate] =
    useState(today)

  const [prayers, setPrayers] =
    useState([])

  const [times, setTimes] =
    useState({})

  const [streak, setStreak] =
    useState(0)

  const [loading, setLoading] =
    useState(true)

  const [nextIdx, setNextIdx] =
    useState(-1)

  const [refreshing, setRefreshing] =
    useState(false)

  const isSelectedToday =
    selectedDate === today

  const last7 = useMemo(
    () =>
      Array.from(
        { length: 7 },
        (_, i) =>
          subDays(
            new Date(),
            6 - i
          )
      ),
    []
  )

  const autoMarkMissed =
    useCallback(
      async (
        prayerList,
        prayerTimes
      ) => {
        if (!isSelectedToday)
          return prayerList

        const now = new Date()

        const updated = [
          ...prayerList,
        ]

        for (
          let i = 0;
          i < updated.length;
          i++
        ) {
          const p = updated[i]

          if (
            p.status !== 'pending'
          )
            continue

          const nextPrayerName =
            PRAYER_ORDER[i + 1]

          const deadline =
            nextPrayerName
              ? parseTime(
                  prayerTimes[
                    nextPrayerName
                  ]
                )
              : (() => {
                  const d =
                    new Date()

                  d.setHours(
                    23,
                    59,
                    59,
                    999
                  )

                  return d
                })()

          if (
            deadline &&
            now > deadline
          ) {
            try {
              const res =
                await api.post(
                  '/prayers/mark/',
                  {
                    prayer:
                      p.prayer,
                    status:
                      'missed',
                    date:
                      selectedDate,
                  }
                )

              updated[i] = {
                ...updated[i],
                status:
                  res.data.status,
              }
            } catch {}
          }
        }

        return updated
      },
      [
        isSelectedToday,
        selectedDate,
      ]
    )

  const loadData =
    useCallback(
      async (
        date,
        silent = false
      ) => {
        const target =
          date || selectedDate

        if (!silent)
          setLoading(true)

        try {
          const isToday_ =
            target === today

          const [
            prayerRes,
            streakRes,
          ] = await Promise.all([
            isToday_
              ? api.get(
                  '/prayers/today/'
                )
              : api.get(
                  '/prayers/date/',
                  {
                    params: {
                      date: target,
                    },
                  }
                ),

            api.get(
              '/prayers/streak/'
            ),
          ])

          const prayerMap = {}

          prayerRes.data.prayers.forEach(
            (p) => {
              prayerMap[
                p.prayer
              ] = p
            }
          )

          let prayerList =
            PRAYER_ORDER.map(
              (name) =>
                prayerMap[
                  name
                ] || {
                  prayer: name,
                  status:
                    'pending',
                }
            )

          const fetchedTimes =
            prayerRes.data.times ||
            {}

          setTimes(fetchedTimes)

          if (isToday_) {
            prayerList =
              await autoMarkMissed(
                prayerList,
                fetchedTimes
              )
          }

          setPrayers(prayerList)

          setStreak(
            streakRes.data.streak
          )

          setNextIdx(
            isToday_
              ? getNextPrayerIndex(
                  prayerList,
                  fetchedTimes
                )
              : -1
          )
        } catch (e) {
          console.error(e)
        } finally {
          setLoading(false)
          setRefreshing(false)
        }
      },
      [
        selectedDate,
        today,
        autoMarkMissed,
      ]
    )

  useEffect(() => {
    loadData(selectedDate)

    if (isSelectedToday) {
      const interval =
        setInterval(() => {
          if (
            document.visibilityState ===
            'visible'
          ) {
            loadData(
              selectedDate,
              true
            )
          }
        }, 60000)

      return () =>
        clearInterval(interval)
    }
  }, [selectedDate])

  const markPrayer = async (
    prayerName,
    newStatus
  ) => {
    try {
      const res = await api.post(
        '/prayers/mark/',
        {
          prayer: prayerName,
          status: newStatus,
          date: selectedDate,
        }
      )

      setPrayers((prev) =>
        prev.map((p) =>
          p.prayer === prayerName
            ? {
                ...p,
                status:
                  res.data.status,
              }
            : p
        )
      )
    } catch (e) {
      console.error(e)
    }
  }

  const stats = prayers.reduce(
    (acc, p) => {
      acc[p.status] =
        (acc[p.status] || 0) + 1

      return acc
    },
    {}
  )

  const prayedCount =
    5 - (stats.pending || 0)

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )

  return (
    <div className="px-4 pt-10 pb-6 space-y-5">

      {/* Header */}
      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div className="flex items-start justify-between">

          <div>
            <p className="text-slate-500 text-sm">
              {getGreeting()}
            </p>

            <h1 className="text-2xl font-bold text-slate-100 mt-0.5">
              {user?.username} 👋
            </h1>

            <div className="flex items-center gap-1 mt-1">
              <MapPin
                size={11}
                className="text-slate-600"
              />

              <span className="text-slate-600 text-xs">
                {user?.city ||
                  'Malappuram'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {streak > 0 && (
              <motion.div
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/25 rounded-2xl px-3 py-2"
              >
                <Flame
                  size={15}
                  className="text-amber-400"
                />

                <span className="text-amber-300 font-bold text-sm">
                  {streak}
                </span>
              </motion.div>
            )}

            <motion.button
              whileTap={{
                scale: 0.92,
              }}
              onClick={() => {
                setRefreshing(true)
                loadData(
                  selectedDate,
                  true
                )
              }}
              className="p-2.5 glass-light rounded-2xl text-slate-500 hover:text-slate-300 transition-colors"
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? 'animate-spin'
                    : ''
                }
              />
            </motion.button>

          </div>
        </div>

        <p className="text-slate-600 text-xs mt-2">
          {isSelectedToday
            ? formatDate()
            : `Viewing: ${format(
                new Date(
                  selectedDate +
                    'T00:00:00'
                ),
                'EEEE, MMMM d, yyyy'
              )}`}
        </p>
      </motion.div>

      {/* Last 7 days */}
      <div className="flex gap-2 overflow-x-auto pb-1">

        {last7.map((d) => {
          const ds = format(
            d,
            'yyyy-MM-dd'
          )

          const isSelected =
            ds === selectedDate

          const isToday_ =
            ds === today

          return (
            <motion.button
              key={ds}
              whileTap={{
                scale: 0.93,
              }}
              onClick={() =>
                setSelectedDate(ds)
              }
              className={`shrink-0 px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 border ${
                isSelected
                  ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25'
                  : 'glass-light text-slate-500 border-white/5 hover:text-slate-300'
              }`}
            >
              <p>
                {isToday_
                  ? 'Today'
                  : format(
                      d,
                      'EEE d'
                    )}
              </p>

              <p
                className={`text-xs mt-0.5 ${
                  isSelected
                    ? 'text-emerald-400'
                    : 'text-slate-600'
                }`}
              >
                {format(
                  d,
                  'MMM d'
                )}
              </p>
            </motion.button>
          )
        })}

      </div>

      {/* Progress */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
        className="glass-light rounded-2xl p-4"
      >
        <div className="flex justify-between items-center text-xs text-slate-500 mb-3">

          <span className="font-medium">
            Today's Progress
          </span>

          <span className="text-slate-400 font-semibold">
            {prayedCount} / 5
            prayed
          </span>

        </div>

        <div className="flex gap-1.5 h-2.5">

          {prayers.map((p) => (
            <motion.div
              key={p.prayer}
              layout
              className={`flex-1 rounded-full transition-all duration-700 ${
                p.status ===
                'ontime'
                  ? 'bg-emerald-400'
                  : p.status ===
                    'qada'
                  ? 'bg-amber-400'
                  : p.status ===
                    'missed'
                  ? 'bg-rose-400'
                  : 'bg-slate-800'
              }`}
            />
          ))}

        </div>

      </motion.div>

      {/* Prayer Cards */}
      <div className="space-y-3">

        {prayers.map((p, i) => (
          <PrayerCard
            key={`${selectedDate}-${p.prayer}`}
            prayer={p.prayer}
            time={times[p.prayer]}
            status={p.status}
            onMark={markPrayer}
            index={i}
            isNext={
              isSelectedToday &&
              i === nextIdx
            }
          />
        ))}

      </div>

    </div>
  )
}