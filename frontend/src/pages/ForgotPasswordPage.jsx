import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/axios'

const STEPS = { EMAIL: 'email', OTP: 'otp', PASSWORD: 'password', DONE: 'done' }

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(STEPS.EMAIL)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const sendOTP = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/auth/forgot-password/', { email })
      setStep(STEPS.OTP)
    } catch {
      setError('Something went wrong. Try again.')
    } finally { setLoading(false) }
  }

  const verifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/auth/verify-otp/', { email, otp })
      setStep(STEPS.PASSWORD)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/auth/reset-password/', { email, otp, new_password: newPassword })
      setStep(STEPS.DONE)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Reset Password</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {step === STEPS.EMAIL && 'Enter your email to receive an OTP'}
            {step === STEPS.OTP && `Enter the 6-digit OTP sent to ${email}`}
            {step === STEPS.PASSWORD && 'Set your new password'}
            {step === STEPS.DONE && 'Password reset successful!'}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[STEPS.EMAIL, STEPS.OTP, STEPS.PASSWORD].map((s, i) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
              step === s ? 'w-8 bg-emerald-400' :
              Object.values(STEPS).indexOf(step) > i ? 'w-4 bg-emerald-600' : 'w-4 bg-slate-700'
            }`} />
          ))}
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          {error && <p className="text-rose-400 text-sm bg-rose-400/10 rounded-xl px-3 py-2">{error}</p>}

          {step === STEPS.EMAIL && (
            <form onSubmit={sendOTP} className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === STEPS.OTP && (
            <form onSubmit={verifyOTP} className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">6-Digit OTP</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                  placeholder="123456" maxLength={6} required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600 text-center tracking-widest text-lg" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
              <button type="button" onClick={() => { setStep(STEPS.EMAIL); setError('') }}
                className="w-full py-2 text-slate-400 text-sm hover:text-slate-200 transition-colors">
                ← Back
              </button>
            </form>
          )}

          {step === STEPS.PASSWORD && (
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="8+ characters" required minLength={8}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}

          {step === STEPS.DONE && (
            <div className="text-center space-y-4">
              <div className="text-4xl">✅</div>
              <p className="text-slate-300 text-sm">Your password has been reset successfully.</p>
              <Link to="/login"
                className="block w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors text-center">
                Back to Login
              </Link>
            </div>
          )}
        </div>

        {step === STEPS.EMAIL && (
          <p className="text-center text-slate-500 text-sm mt-4">
            Remember your password?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign In</Link>
          </p>
        )}
      </motion.div>
    </div>
  )
}