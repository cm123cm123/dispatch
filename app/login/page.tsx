'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const code = hash.get('error_code')
    if (code === 'otp_expired') return 'That login link has expired or already been used. Request a new one below.'
    if (hash.get('error')) return 'Login link invalid. Please request a new one.'
    return null
  })

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px',
      }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
            Dispatch<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Task &amp; Comms Tracker</div>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'var(--red-soft)', border: '1px solid rgba(255,92,92,0.3)', borderRadius: '6px', fontSize: '13px', color: 'var(--red)', lineHeight: 1.5 }}>
            {errorMsg}
          </div>
        )}

        {sent ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>📬</div>
            Check your inbox — a login link was sent to{' '}
            <strong style={{ color: 'var(--text)' }}>{email}</strong>
          </div>
        ) : (
          <form onSubmit={sendMagicLink}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="form-input"
                style={{ fontSize: '14px' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '10px', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                fontFamily: 'var(--font)',
              }}
            >
              {loading ? 'Sending…' : 'Send login link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
