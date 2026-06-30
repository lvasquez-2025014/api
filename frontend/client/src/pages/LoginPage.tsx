import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "wouter";

export default function LoginPage() {
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    setLocation("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      setLocation("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="h-7 w-7">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Oficial Auth</h1>
          <p className="mt-1 text-sm text-zinc-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
