import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'

// Import IAJ Logo
import logo from '/Assets/IAJ Orange White copy.png';

// Apple Blue Glassmorphism Styles
const styles = {
  gradientBg: {
    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #e0f2fe 60%, #f0f9ff 100%)',
    minHeight: '100vh',
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  },
  logoFilter: {
    filter: 'hue-rotate(190deg) saturate(0.8) brightness(1.1)',
    height: '50px',
    width: 'auto',
  },
  blueButton: {
    background: 'rgba(0, 122, 255, 0.9)',
    border: '1px solid rgba(0, 122, 255, 0.3)',
    boxShadow: '0 4px 20px rgba(0, 122, 255, 0.25)',
  },
};

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithEmail } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await signInWithEmail(email)
    setLoading(false)
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={styles.gradientBg}
    >
      <div 
        className="w-full max-w-md rounded-[24px] p-8"
        style={styles.glassCard}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src={logo} 
            alt="It's a Jungle" 
            style={styles.logoFilter}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: '#1D1D1F' }}
          >
            Story Grid Pro
          </h1>
          <p 
            className="text-sm"
            style={{ color: '#6B7280' }}
          >
            Sign in to access your story development workspace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="text-sm font-medium"
              style={{ color: '#1D1D1F' }}
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="itsajungletv@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-xl border-gray-200 focus:border-[#007AFF] focus:ring-[#007AFF]"
              style={{ 
                background: 'rgba(255, 255, 255, 0.6)',
                color: '#1D1D1F',
              }}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 rounded-full text-white font-semibold transition-all hover:scale-[1.02] disabled:opacity-60"
            disabled={loading}
            style={styles.blueButton}
          >
            {loading ? 'Sending magic link...' : 'Send Magic Link'}
          </button>

          <p 
            className="text-xs text-center mt-4"
            style={{ color: '#9CA3AF' }}
          >
            We'll send you a magic link to sign in. No password needed!
          </p>
        </form>
      </div>
    </div>
  )
}
