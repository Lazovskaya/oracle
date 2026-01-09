'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import OracleIcon from '@/components/OracleIcon';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [magicLink, setMagicLink] = useState('');
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
        if (data.magicLink) {
          setMagicLink(data.magicLink);
          // Auto-open in development mode
          if (data.isDevelopment) {
            window.open(data.magicLink, '_blank');
          }
        }
      } else {
        alert(data.error || 'Failed to send magic link');
      }
    } catch (err) {
      alert('Error sending magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl animate-float">
              <OracleIcon className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Market Oracle
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            AI-Powered Decision Engine for Smart Trading
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-center">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">
              {error === 'invalid_token' && 'Invalid login link'}
              {error === 'expired_token' && 'Login link expired. Please request a new one.'}
              {error === 'user_not_found' && 'User not found'}
              {error === 'server_error' && 'Server error. Please try again.'}
            </p>
          </div>
        )}

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-blue-200/50 dark:border-blue-800/50 p-8 bg-gradient-to-br from-white/90 to-purple-50/90 dark:from-gray-900/90 dark:to-purple-950/90 backdrop-blur-xl shadow-2xl">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
              <div className="relative">
                {loading ? 'Sending...' : '✉️ Send Magic Link'}
              </div>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                  OR
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/oracle' })}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              We'll send you a secure login link. No password needed.
            </p>
          </form>
        ) : (
          <div className="rounded-3xl border border-green-200/50 dark:border-green-800/50 p-8 bg-gradient-to-br from-white/90 to-green-50/90 dark:from-gray-900/90 dark:to-green-950/90 backdrop-blur-xl shadow-2xl text-center space-y-4">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Check Your Email</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Link expires in 15 minutes
            </p>
            
            {magicLink && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs font-bold text-yellow-800 dark:text-yellow-300 mb-2">DEV MODE - Direct link:</p>
                <a href={magicLink} className="text-xs text-blue-600 dark:text-blue-400 break-all hover:underline">
                  {magicLink}
                </a>
              </div>
            )}
          </div>
        )}

        <div className="text-center space-y-4 pt-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">What You Get</h3>
          <div className="grid gap-4">
            <div className="rounded-xl bg-white/50 dark:bg-gray-900/50 p-4 backdrop-blur-sm">
              <p className="font-bold text-blue-600 dark:text-blue-400">📊 Decision Engine</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered market analysis with Elliott Wave structure</p>
            </div>
            <div className="rounded-xl bg-white/50 dark:bg-gray-900/50 p-4 backdrop-blur-sm">
              <p className="font-bold text-purple-600 dark:text-purple-400">🗺️ Risk Map</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clear entry, stop-loss, and target levels for each idea</p>
            </div>
            <div className="rounded-xl bg-white/50 dark:bg-gray-900/50 p-4 backdrop-blur-sm">
              <p className="font-bold text-pink-600 dark:text-pink-400">🌊 Market Regime Detector</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Identify current market phase and wave structure</p>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              <strong>Free:</strong> Market analysis and trade ideas
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              <strong>Premium (€9-29/mo):</strong> Full entry/stop/target levels + performance tracking
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
