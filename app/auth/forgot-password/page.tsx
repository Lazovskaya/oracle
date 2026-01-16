'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 text-center">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
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
                {loading ? 'Sending...' : 'Send Reset Link'}
              </div>
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to login
              </Link>
            </div>
          </form>
        ) : (
          <div className="rounded-3xl border border-green-200/50 dark:border-green-800/50 p-8 bg-gradient-to-br from-white/90 to-green-50/90 dark:from-gray-900/90 dark:to-green-950/90 backdrop-blur-xl shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
              ✓
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If an account exists with <span className="font-semibold text-gray-900 dark:text-white">{email}</span>, 
                you will receive a password reset link shortly.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The link will expire in 1 hour for security.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Link
                href="/login"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Return to Login
              </Link>
              
              <button
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                className="block w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Send to a different email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
