import { useState, useEffect, useCallback, useRef } from "react";
import { API_URL } from "../lib/authApi";

const COUNTDOWN_SECONDS = 30;

function isDevToolsOpen(): boolean {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;

  if (widthThreshold || heightThreshold) return true;

  const element = new Image();
  Object.defineProperty(element, "id", {
    get: () => {
      throw new Error("devtools");
    },
  });
  try {
    console.log("%c", element);
  } catch {
    return true;
  }

  const start = performance.now();
  debugger;
  const end = performance.now();
  if (end - start > 50) return true;

  return false;
}

export default function DevToolsGuard({ children }: { children: React.ReactNode }) {
  const [detected, setDetected] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [banned, setBanned] = useState(false);
  const [bannedMessage, setBannedMessage] = useState("");
  const [exempt, setExempt] = useState(false);
  const reportedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/bans/check`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.banned) {
          setBanned(true);
          setBannedMessage(data.message || "Your IP has been banned");
        }
        if (data.exempt) {
          setExempt(true);
        }
      })
      .catch(() => {});
  }, []);

  const reportAndBan = useCallback(async () => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    try {
      const res = await fetch(`${API_URL}/api/v1/bans/report-devtools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.exempt) {
        setDetected(false);
        return;
      }
      setBanned(true);
      setBannedMessage(data.message || "Your IP has been banned for opening DevTools");
    } catch {
      setBanned(true);
      setBannedMessage("Your IP has been banned for opening DevTools");
    }
  }, []);

  useEffect(() => {
    if (exempt || banned) return;

    const check = () => {
      if (isDevToolsOpen()) {
        if (!detected) {
          setDetected(true);
          setCountdown(COUNTDOWN_SECONDS);
          reportedRef.current = false;
        }
      } else {
        if (detected) {
          setDetected(false);
          setCountdown(COUNTDOWN_SECONDS);
          reportedRef.current = false;
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }
    };

    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, [detected, exempt, banned]);

  useEffect(() => {
    if (!detected || exempt || banned) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          reportAndBan();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [detected, exempt, banned, reportAndBan]);

  if (banned) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black">
        <div className="text-center p-8 max-w-lg">
          <div className="text-6xl mb-6">&#128683;</div>
          <h1 className="text-3xl font-bold text-red-500 mb-4">ACCESS DENIED</h1>
          <p className="text-xl text-zinc-300 mb-2">{bannedMessage}</p>
          <p className="text-sm text-zinc-500">
            Your IP has been permanently banned. Contact the owner to appeal.
          </p>
        </div>
      </div>
    );
  }

  if (detected && !exempt) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95">
        <div className="text-center p-8 max-w-lg">
          <div className="text-6xl mb-6">&#9888;&#65039;</div>
          <h1 className="text-3xl font-bold text-red-500 mb-4">CLOSE DEVTOOLS IMMEDIATELY</h1>
          <p className="text-xl text-zinc-300 mb-4">
            DevTools has been detected on your browser.
          </p>
          <p className="text-zinc-400 mb-6">
            Close DevTools now or your IP will be <span className="text-red-400 font-bold">permanently banned</span> in:
          </p>
          <div className="text-7xl font-mono text-red-500 font-bold mb-6">
            {countdown}s
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3 mb-4">
            <div
              className="bg-red-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / COUNTDOWN_SECONDS) * 100}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600">
            Only the owner is exempt from this security check.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
