import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut,
  Bell,
  BellOff,
  User,
  MapPin,
  Search,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import api from '../api/axios'
import useAuthStore from '../store/authStore'
import usePreferencesStore from '../store/preferencesStore'
import { LANGUAGES, getTranslator } from '../i18n'
import INDIAN_CITIES from '../utils/indianCities'

export default function ProfilePage() {
  const { user, logout, updateUser } =
    useAuthStore()

  const {
    language,
    setLanguage,
  } = usePreferencesStore()

  const t = getTranslator(language)

  const navigate = useNavigate()

  const [notifEnabled, setNotifEnabled] =
    useState(
      Notification.permission ===
        'granted'
    )

  const [saving, setSaving] =
    useState(false)

  const [form, setForm] =
    useState({
      username:
        user?.username || '',
    })

  const [citySearch, setCitySearch] =
    useState(user?.city || '')

  const [showCities, setShowCities] =
    useState(false)

  const [selectedCity, setSelectedCity] =
    useState(null)

  const cityRef = useRef(null)

  const filteredCities =
    INDIAN_CITIES.filter((c) =>
      c.name
        .toLowerCase()
        .includes(
          citySearch.toLowerCase()
        )
    ).slice(0, 8)

  useEffect(() => {
    const handler = (e) => {
      if (
        cityRef.current &&
        !cityRef.current.contains(
          e.target
        )
      ) {
        setShowCities(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handler
    )

    return () =>
      document.removeEventListener(
        'mousedown',
        handler
      )
  }, [])

  const handleCitySelect = (
    city
  ) => {
    setSelectedCity(city)
    setCitySearch(city.name)
    setShowCities(false)
  }

  const handleLogout = async () => {
    try {
      await api.post(
        '/auth/logout/',
        {
          refresh:
            localStorage.getItem(
              'refresh_token'
            ),
        }
      )
    } catch {}

    logout()

    navigate('/login', {
      replace: true,
    })
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const payload = {
        username: form.username,
        city:
          selectedCity?.name ||
          citySearch,

        ...(selectedCity
          ? {
              latitude:
                selectedCity.lat,
              longitude:
                selectedCity.lng,
            }
          : {}),
      }

      const res = await api.patch(
        '/auth/profile/',
        payload
      )

      updateUser(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const toggleNotifications =
    async () => {
      if (
        Notification.permission ===
        'denied'
      ) {
        alert(
          'Notifications are blocked. Please allow them in your browser settings.'
        )

        return
      }

      if (!notifEnabled) {
        const perm =
          await Notification.requestPermission()

        if (perm === 'granted') {
          setNotifEnabled(true)

          new Notification(
            'Salah Tracker',
            {
              body:
                'Prayer reminders enabled!',
              icon: '/icon-192.png',
            }
          )
        }
      } else {
        setNotifEnabled(false)
      }
    }

  return (
    <div className="px-4 pt-12 pb-6 space-y-5">

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-slate-100"
      >
        {t('profile')}
      </motion.h1>

      {/* Avatar */}
      <div className="glass rounded-2xl p-5 flex items-center gap-4">

        <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
          <User
            size={24}
            className="text-emerald-400"
          />
        </div>

        <div>
          <p className="font-semibold text-slate-100 text-lg">
            {user?.username}
          </p>

          <p className="text-slate-400 text-sm">
            {user?.email}
          </p>

          <div className="flex items-center gap-1 mt-0.5">

            <MapPin
              size={11}
              className="text-slate-500"
            />

            <span className="text-slate-500 text-xs">
              {user?.city}
            </span>

          </div>
        </div>

      </div>

      {/* Edit form */}
      <div className="glass rounded-2xl p-4 space-y-3">

        <h3 className="font-semibold text-slate-200">
          {t('editProfile')}
        </h3>

        {/* Username */}
        <div>
          <label className="text-slate-400 text-xs mb-1 block">
            {t('displayName')}
          </label>

          <input
            type="text"
            value={form.username}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                username:
                  e.target.value,
              }))
            }
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* City Search */}
        <div
          ref={cityRef}
          className="relative"
        >

          <label className="text-slate-400 text-xs mb-1 block">
            {t('city')}
          </label>

          <div className="relative">

            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />

            <input
              type="text"
              value={citySearch}
              onChange={(e) => {
                setCitySearch(
                  e.target.value
                )

                setShowCities(true)

                setSelectedCity(
                  null
                )
              }}
              onFocus={() =>
                setShowCities(true)
              }
              placeholder={t(
                'searchCity'
              )}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />

          </div>

          <AnimatePresence>
            {showCities &&
              filteredCities.length >
                0 && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="absolute top-full left-0 right-0 mt-1 glass rounded-xl border border-white/10 z-50 overflow-hidden shadow-2xl shadow-black/40"
                >

                  {filteredCities.map(
                    (city) => (
                      <button
                        key={
                          city.name
                        }
                        onClick={() =>
                          handleCitySelect(
                            city
                          )
                        }
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-emerald-400/10 hover:text-emerald-300 transition-colors border-b border-white/5 last:border-0"
                      >
                        {city.name}
                      </button>
                    )
                  )}

                </motion.div>
              )}
          </AnimatePresence>

        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {saving
            ? t('saving')
            : t('saveChanges')}
        </button>

      </div>

      {/* Language */}
      <div className="glass rounded-2xl p-4 space-y-3">

        <h3 className="font-semibold text-slate-200">
          {t('language')}
        </h3>

        <div className="grid grid-cols-2 gap-2">

          {LANGUAGES.map(
            ({ code, label }) => {
              const active =
                language === code

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() =>
                    setLanguage(code)
                  }
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? 'border-emerald-300/50 bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/30'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              )
            }
          )}

        </div>

      </div>

      {/* Notifications */}
      <button
        onClick={
          toggleNotifications
        }
        className="w-full glass rounded-2xl p-4 flex items-center justify-between border border-slate-700 hover:border-slate-500 transition-colors"
      >

        <div className="flex items-center gap-3">

          {notifEnabled ? (
            <Bell
              size={20}
              className="text-emerald-400"
            />
          ) : (
            <BellOff
              size={20}
              className="text-slate-500"
            />
          )}

          <div className="text-left">

            <p className="font-medium text-slate-200">
              {t(
                'prayerReminders'
              )}
            </p>

            <p className="text-xs text-slate-500">
              {notifEnabled
                ? t(
                    'notificationsEnabled'
                  )
                : t(
                    'enableNotifications'
                  )}
            </p>

          </div>

        </div>

        <div
          className={`w-10 h-5 rounded-full transition-colors duration-200 ${
            notifEnabled
              ? 'bg-emerald-500'
              : 'bg-slate-700'
          } flex items-center px-0.5`}
        >

          <div
            className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
              notifEnabled
                ? 'translate-x-5'
                : 'translate-x-0'
            }`}
          />

        </div>

      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-2 text-rose-400 border border-rose-400/20 hover:bg-rose-400/10 transition-colors"
      >

        <LogOut size={18} />

        <span className="font-semibold">
          {t('logOut')}
        </span>

      </button>

    </div>
  )
}