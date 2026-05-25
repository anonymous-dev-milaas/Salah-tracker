import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/login/', form)
      login({ access: res.data.access, refresh: res.data.refresh }, res.data.user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🕌</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-100">Salah Tracker</h1>
          <p className="text-slate-400 mt-1">Track your 5 daily prayers</p>
        </div>

        <form onSubmit={handle} className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-200 text-lg">Sign In</h2>
          {error && <p className="text-rose-400 text-sm bg-rose-400/10 rounded-xl px-3 py-2">{error}</p>}
          {[
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-slate-400 text-xs mb-1 block">{label}</label>
              <input type={type} placeholder={placeholder} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 mt-2">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="text-center text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">Register</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
