import { getHealth, getApiBaseUrl, ApiError } from '@/lib/api/client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function fetchBridgeHealth() {
  const start = performance.now();
  try {
    const health = await getHealth();
    return {
      health,
      durationMs: Math.round(performance.now() - start),
      errorMessage: null,
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - start);
    const errorMessage =
      err instanceof ApiError
        ? `[Status ${err.statusCode}] ${err.message}`
        : err instanceof Error
        ? err.message
        : 'Unknown connection error';
    return { health: null, durationMs, errorMessage };
  }
}

export default async function ApiTestPage() {
  const { health, durationMs, errorMessage } = await fetchBridgeHealth();

  const isConnected = health?.success && health.status === 'healthy';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-mono text-sm flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              AXION PackTech Backend Bridge Test
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Next.js Server Component → Express API → MongoDB & Redis
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Target Base URL:</span>
            <span className="text-sky-400">{getApiBaseUrl()}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Round-Trip Latency:</span>
            <span className="text-amber-400">{durationMs} ms</span>
          </div>

          {health && (
            <>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">MongoDB Service:</span>
                <span
                  className={`font-semibold ${
                    health.services.mongodb === 'connected'
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {health.services.mongodb}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Redis Cache:</span>
                <span
                  className={`font-semibold ${
                    health.services.redis === 'connected'
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {health.services.redis}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Backend Environment:</span>
                <span className="text-slate-300">{health.environment}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Uptime:</span>
                <span className="text-slate-300">{health.uptimeSeconds}s</span>
              </div>
            </>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 space-y-1">
              <p className="font-semibold text-rose-200">Connection Failure:</p>
              <p className="text-xs">{errorMessage}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <Link
            href="/"
            className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-4"
          >
            ← Back to Homepage
          </Link>
          <span className="text-xs text-slate-500">
            Internal Diagnostic Route (Phase 1)
          </span>
        </div>
      </div>
    </div>
  );
}
