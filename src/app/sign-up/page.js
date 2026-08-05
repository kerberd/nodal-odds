'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email to confirm your account, then sign in.');
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/markets` },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <h1 className="text-2xl font-bold mb-1">Create your account</h1>
      <p className="text-gray-500 mb-8">Sign up to get started</p>

      <div className="w-full max-w-sm border border-border rounded-lg p-6 bg-panel">
        <button
          onClick={handleGoogle}
          className="w-full border border-border rounded py-3 mb-4 text-sm font-semibold"
        >
          Continue with Google
        </button>
        <div className="text-center text-gray-600 text-xs mb-4">OR</div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-base border border-border rounded px-3 py-2 mt-1 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-base border border-border rounded px-3 py-2 mt-1 text-sm"
            />
          </div>
          <button type="submit" className="w-full bg-accent text-white py-3 rounded font-semibold">
            Create account
          </button>
        </form>
        {message && <p className="text-sm text-gray-400 mt-4">{message}</p>}
      </div>

      <p className="text-gray-500 text-sm mt-6">
        Already have an account? <a href="/sign-in" className="text-accent">Log in</a>
      </p>
    </div>
  );
}
