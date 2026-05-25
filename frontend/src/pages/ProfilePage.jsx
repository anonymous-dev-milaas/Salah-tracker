import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Bell, BellOff, User, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import usePreferencesStore from '../store/preferencesStore'
import { LANGUAGES, getTranslator } from '../i18n'

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore()
  const { language, setLanguage } = usePreferencesStore()
  const t = getTranslator(language)
  const navigate = useNavigate()
  const [notifEnabled, setNotifEnabled] = useState(Notification.permission === 'granted')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ city: user?.city || '', username: user?.username || '' })

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') })
    } catch {
      // Continue local logout even if the server session is already gone.
    }
    logout()
    navigate('/login', { replace: true })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.patch('/auth/profile/', form)
      updateUser(res.data)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const toggleNotifications = async () => {
    if (Notification.permission === 'denied') {
      alert('Notifications are blocked. Please allow them in your browser settings.')
      return
    }
    if (!notifEnabled) {
      const perm = await Notification.requestPermission()
      if (perm === 'granted') {
        setNotifEnabled(true)
        new Notification('Salah Tracker', { body: 'Prayer reminders enabled!', icon: '/icon-192.png' })
      }
    } else {
      setNotifEnabled(false)
    }
  }

  return (
    <div className="px-4 pt-12 pb-6 space-y-5">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-slate-100">
        {t('profile')}
      </motion.h1>

      {/* Avatar */}
      <div className="glass rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
          <User size={24} className="text-emerald-400" />
        </div>
        <div>
          <p className="font-semibold text-slate-100 text-lg">{user?.username}</p>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-slate-500" />
            <span className="text-slate-500 text-xs">{user?.city}</span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-slate-200">{t('editProfile')}</h3>
        {[
          { label: t('displayName'), key: 'username', type: 'text' },
          { label: t('city'), key: 'city', type: 'text' },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="text-slate-400 text-xs mb-1 block">{label}</label>
            <input type={type} value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
          </div>
        ))}
        <button onClick={handleSave} disabled={saving}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
          {saving ? t('saving') : t('saveChanges')}
        </button>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-slate-200">{t('language')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map(({ code, label }) => {
            const active = language === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? 'border-emerald-300/50 bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/30'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Notifications toggle */}
      <button onClick={toggleNotifications}
        className="w-full glass rounded-2xl p-4 flex items-center justify-between border border-slate-700 hover:border-slate-500 transition-colors">
        <div className="flex items-center gap-3">
          {notifEnabled ? <Bell size={20} className="text-emerald-400" /> : <BellOff size={20} className="text-slate-500" />}
          <div className="text-left">
            <p className="font-medium text-slate-200">{t('prayerReminders')}</p>
            <p className="text-xs text-slate-500">{notifEnabled ? t('notificationsEnabled') : t('enableNotifications')}</p>
          </div>
        </div>
        <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${notifEnabled ? 'bg-emerald-500' : 'bg-slate-700'} flex items-center px-0.5`}>
          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${notifEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      </button>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-2 text-rose-400 border border-rose-400/20 hover:bg-rose-400/10 transition-colors">
        <LogOut size={18} />
        <span className="font-semibold">{t('logOut')}</span>
      </button>
    </div>
  )
}
