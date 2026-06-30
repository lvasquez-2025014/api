import React, { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import * as api from "../lib/keyauthApi";

type IconName = "apps" | "license" | "users" | "token" | "sub" | "chat" | "session" | "webhook" | "file" | "variable" | "settings" | "eye" | "eyeOff" | "copy" | "search" | "plus" | "filter" | "chevron" | "check" | "ban" | "trash" | "edit" | "pause" | "play" | "logo" | "refresh" | "x" | "save" | "key" | "shield" | "clock" | "download" | "upload" | "link" | "zap" | "activity" | "terminal" | "database" | "globe" | "lock" | "unlock" | "arrowLeft";

const Icon = ({ name, className = "w-5 h-5" }: { name: IconName; className?: string }) => {
  const paths: Record<IconName, React.ReactNode> = {
    apps: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
    license: <><path d="M15 7h3a5 5 0 010 10h-3" /><path d="M9 12l2 2 4-4" /><path d="M6 20H3a2 2 0 01-2-2V6a2 2 0 012-2h3" /></>,
    users: <><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>,
    token: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>,
    sub: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
    session: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
    webhook: <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
    file: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />,
    variable: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><path d="M14.12 14.12a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></>,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    plus: <line x1="12" y1="5" x2="12" y2="19" />,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
    chevron: <polyline points="6 9 12 15 18 9" />,
    check: <polyline points="20 6 9 17 4 12" />,
    ban: <><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    pause: <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>,
    play: <polygon points="5 3 19 12 5 21 5 3" />,
    logo: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
    refresh: <><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    save: <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
    key: <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    upload: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    link: <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
    terminal: <><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></>,
    database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>,
    unlock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 019.9-1" /></>,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

const TopBar = ({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
    </div>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

const Row = ({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: string }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-zinc-500">{label}</span>
    <span className={`truncate font-medium ${accent === "blue" ? "text-blue-400" : accent === "red" ? "text-red-400" : accent === "green" ? "text-emerald-400" : "text-white"} ${mono ? "font-mono text-[11px]" : ""}`}>{value}</span>
  </div>
);

const Btn = ({ children, onClick, variant = "default", size = "sm", className = "" }: {
  children: React.ReactNode; onClick?: () => void; variant?: "default" | "primary" | "danger" | "ghost" | "success";
  size?: "xs" | "sm" | "md"; className?: string;
}) => {
  const v = {
    default: "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10",
    primary: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40",
    danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
    ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20",
  }[variant];
  const s = { xs: "px-2 py-1 text-[10px]", sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm" }[size];
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-lg font-semibold transition ${v} ${s} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = "" }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className={`w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500/50 transition ${className}`} />
);

const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className="rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition">
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const StatCard = ({ label, value, trend, accent }: { label: string; value: string | number; trend?: string; accent: string }) => (
  <div className="relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-5 backdrop-blur">
    <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl opacity-20 ${accent}`} />
    <div className="relative">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {trend && <p className="mt-2 text-xs text-emerald-400">{trend}</p>}
    </div>
  </div>
);

const EmptyState = ({ icon, title, desc }: { icon: IconName; title: string; desc: string }) => (
  <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-zinc-900/40">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/20">
      <Icon name={icon} className="w-7 h-7" />
    </div>
    <p className="text-lg font-semibold text-white">{title}</p>
    <p className="mt-1 text-sm text-zinc-500">{desc}</p>
  </div>
);

export default function AppDetailPage() {
  const [, params] = useRoute("/keyauth/app/:appId");
  const [, navigate] = useLocation();
  const appId = params?.appId;

  const [view, setView] = useState("licenses");
  const [app, setApp] = useState<any>(null);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [variables, setVariables] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const O = app?.ownerId || "";
  const S = app?.secret || "";

  const fetchAll = useCallback(async () => {
    if (!O || !S) return;
    try {
      const [s, l, u, t, sess, wh, v, lg] = await Promise.all([
        api.getStats(O, S),
        api.getLicenses(O, S),
        api.getUsers(O, S),
        api.getTokens(O, S),
        api.getSessions(O, S),
        api.getWebhooks(O, S),
        api.getVariables(O, S),
        api.getLogs(O, S),
      ]);
      setStats(s); setLicenses(l); setUsers(u); setTokens(t);
      setSessions(sess); setWebhooks(wh); setVariables(v); setLogs(lg);
    } catch (err) { console.error("Failed to fetch app data:", err); }
    setLoading(false);
  }, [O, S]);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedApp");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed._id === appId || parsed.id === appId) {
        setApp(parsed);
      }
    }
  }, [appId]);

  useEffect(() => {
    if (app) fetchAll();
  }, [app, fetchAll]);

  const links = [
    { id: "licenses", label: "Licenses", icon: "key" as IconName, count: licenses.length },
    { id: "users", label: "Users", icon: "users" as IconName, count: users.length },
    { id: "tokens", label: "Tokens", icon: "token" as IconName, count: tokens.length },
    { id: "sessions", label: "Sessions", icon: "session" as IconName, count: sessions.length },
    { id: "webhooks", label: "Webhooks", icon: "webhook" as IconName, count: webhooks.length },
    { id: "variables", label: "Variables", icon: "variable" as IconName, count: variables.length },
    { id: "logs", label: "Logs", icon: "terminal" as IconName, count: logs.length },
    { id: "settings", label: "Settings", icon: "settings" as IconName },
  ];

  if (!app) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950">
        <div className="text-center">
          <p className="text-sm text-zinc-500 mb-4">App not found</p>
          <Btn variant="primary" onClick={() => navigate("/keyauth")}><Icon name="arrowLeft" className="w-4 h-4" /> Back to Dashboard</Btn>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm text-zinc-500">Loading {app.name}...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case "licenses": return <LicensesView licenses={licenses} onRefresh={fetchAll} />;
      case "users": return <UsersView users={users} onRefresh={fetchAll} />;
      case "tokens": return <TokensView tokens={tokens} onRefresh={fetchAll} />;
      case "sessions": return <SessionsView sessions={sessions} onRefresh={fetchAll} />;
      case "webhooks": return <WebhooksView webhooks={webhooks} onRefresh={fetchAll} />;
      case "variables": return <VariablesView variables={variables} onRefresh={fetchAll} />;
      case "logs": return <LogsView logs={logs} onRefresh={fetchAll} />;
      case "settings": return <SettingsView app={app} onRefresh={fetchAll} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-zinc-950 text-white antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>
      <div className="relative flex w-full">
        <aside className="flex h-full w-64 flex-col border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl">
          <div className="border-b border-white/5 px-5 py-4">
            <button onClick={() => navigate("/keyauth")} className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm mb-3">
              <Icon name="arrowLeft" className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30">
                <Icon name="logo" className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white tracking-wide truncate">{app.name}</p>
                <p className="text-[10px] text-zinc-500 font-mono">v{app.version}</p>
              </div>
            </div>
          </div>

          <nav className="mt-4 flex-1 overflow-y-auto px-3">
            {links.map((l) => (
              <button key={l.id} onClick={() => setView(l.id)}
                className={`group mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  view === l.id
                    ? "bg-gradient-to-r from-blue-500/20 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}>
                <Icon name={l.icon} className="w-[18px] h-[18px]" />
                <span>{l.label}</span>
                {l.count !== undefined && <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-400">{l.count}</span>}
                {view === l.id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px] shadow-blue-400" />}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/5 p-4">
            <div className="rounded-lg bg-zinc-900/60 p-3 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-zinc-500">Users</span><span className="text-white font-bold">{stats?.totalUsers || 0}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Licenses</span><span className="text-white font-bold">{stats?.totalLicenses || 0}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Tokens</span><span className="text-white font-bold">{stats?.totalTokens || 0}</span></div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6 lg:p-8">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── LICENSES VIEW ────────────────────────────────────────────
const LicensesView = ({ licenses, onRefresh }: { licenses: any[]; onRefresh: () => void }) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showGen, setShowGen] = useState(false);
  const [genCount, setGenCount] = useState("5");
  const [genDays, setGenDays] = useState("30");
  const [genLevel, setGenLevel] = useState("1");

  const filtered = licenses.filter(l => {
    if (filter === "USED" && l.status !== "Used") return false;
    if (filter === "NOT USED" && l.status !== "Not Used") return false;
    if (query && !l.key.toLowerCase().includes(query.toLowerCase()) && !(l.hwid || "").toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const O = () => {
    const stored = sessionStorage.getItem("selectedApp");
    return stored ? JSON.parse(stored).ownerId : "";
  };
  const S = () => {
    const stored = sessionStorage.getItem("selectedApp");
    return stored ? JSON.parse(stored).secret : "";
  };

  const handleGenerate = async () => {
    await api.generateLicenses(O(), S(), { count: parseInt(genCount) || 5, durationDays: parseInt(genDays) || 30, subLevel: parseInt(genLevel) || 1 });
    setShowGen(false);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await api.deleteLicense(O(), S(), id);
    onRefresh();
  };

  return (
    <div>
      <TopBar title="Licenses" subtitle="Generate and manage license keys">
        <Btn variant="primary" onClick={() => setShowGen(true)}><Icon name="plus" className="w-4 h-4" /> Generate</Btn>
        <Btn variant="ghost" onClick={onRefresh}><Icon name="refresh" className="w-4 h-4" /></Btn>
      </TopBar>

      {showGen && (
        <div className="mb-5 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
          <h3 className="mb-3 text-sm font-bold text-white">Generate Licenses</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div><label className="mb-1 block text-[10px] uppercase tracking-widest text-zinc-500">Count</label><Input value={genCount} onChange={setGenCount} className="w-20" /></div>
            <div><label className="mb-1 block text-[10px] uppercase tracking-widest text-zinc-500">Duration (days)</label><Input value={genDays} onChange={setGenDays} className="w-28" /></div>
            <div><label className="mb-1 block text-[10px] uppercase tracking-widest text-zinc-500">Sub Level</label><Input value={genLevel} onChange={setGenLevel} className="w-20" /></div>
            <Btn variant="primary" onClick={handleGenerate}><Icon name="check" className="w-3.5 h-3.5" /> Generate</Btn>
            <Btn variant="ghost" onClick={() => setShowGen(false)}><Icon name="x" className="w-3.5 h-3.5" /> Cancel</Btn>
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-zinc-900/60 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Icon name="search" className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-zinc-500" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by key or HWID..."
            className="w-full rounded-lg border border-white/10 bg-black/40 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500/50 transition" />
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-black/40 p-1">
          {["ALL", "USED", "NOT USED"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${filter === f ? "bg-blue-500 text-white" : "text-zinc-400 hover:text-white"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(l => (
          <div key={l.id} className="group rounded-xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-5 transition hover:border-white/10">
            <div className="mb-3 flex items-start justify-between">
              <p className="truncate font-mono text-sm font-bold text-white">{l.key}</p>
              <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${l.status === "Used" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30"}`}>{l.status}</span>
            </div>
            <div className="space-y-2 text-xs">
              <Row label="Duration" value={`${l.durationDays} days`} accent="blue" />
              <Row label="Expires" value={new Date(l.expiresAt).toLocaleDateString()} />
              <Row label="HWID" value={l.hwid || "N/A"} mono />
            </div>
            <div className="mt-3 flex gap-1.5">
              <Btn variant="danger" size="xs" onClick={() => handleDelete(l.id)}><Icon name="trash" className="w-3 h-3" /> Delete</Btn>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon="key" title="No licenses" desc="Generate some licenses to get started" />}
    </div>
  );
};

// ─── USERS VIEW ───────────────────────────────────────────────
const UsersView = ({ users, onRefresh }: { users: any[]; onRefresh: () => void }) => {
  const [query, setQuery] = useState("");
  const filtered = users.filter(u => u.username.toLowerCase().includes(query.toLowerCase()) || u.ip?.includes(query));

  const getO = () => { const s = sessionStorage.getItem("selectedApp"); return s ? JSON.parse(s).ownerId : ""; };
  const getS = () => { const s = sessionStorage.getItem("selectedApp"); return s ? JSON.parse(s).secret : ""; };

  const handleBan = async (id: string) => { await api.banUser(getO(), getS(), id); onRefresh(); };
  const handleDelete = async (id: string) => { await api.deleteUser(getO(), getS(), id); onRefresh(); };

  return (
    <div>
      <TopBar title="Users" subtitle="Monitor and manage registered users">
        <Btn variant="ghost" onClick={onRefresh}><Icon name="refresh" className="w-4 h-4" /></Btn>
      </TopBar>
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={users.length} accent="bg-blue-500" />
        <StatCard label="Active" value={users.filter(u => u.status === "Active").length} accent="bg-emerald-500" />
        <StatCard label="Expired" value={users.filter(u => u.status === "Expired").length} accent="bg-amber-500" />
        <StatCard label="Banned" value={users.filter(u => u.status === "Banned").length} accent="bg-red-500" />
      </div>
      <div className="mb-5 relative">
        <Icon name="search" className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-zinc-500" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by username or IP..."
          className="w-full rounded-xl border border-white/10 bg-zinc-900/60 py-3 pl-10 pr-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500/50 transition" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(u => (
          <div key={u.id} className="rounded-xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-5 transition hover:border-white/10">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white text-sm ${u.status === "Banned" ? "bg-gradient-to-br from-red-500 to-rose-600" : "bg-gradient-to-br from-purple-500 to-pink-500"}`}>
                  {u.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white">{u.username}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">ID: {u.id.slice(0, 12)}...</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                u.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                u.status === "Banned" ? "bg-red-500/10 text-red-400 border border-red-500/30" :
                "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30"
              }`}>{u.status}</span>
            </div>
            <div className="space-y-2 text-xs">
              <Row label="IP" value={u.ip || "N/A"} mono />
              <Row label="Last Login" value={u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"} />
              <Row label="HWID" value={u.hwid || "N/A"} mono />
            </div>
            <div className="mt-3 flex gap-1.5">
              {u.status !== "Banned" && <Btn variant="danger" size="xs" onClick={() => handleBan(u.id)}><Icon name="ban" className="w-3 h-3" /> Ban</Btn>}
              <Btn variant="danger" size="xs" onClick={() => handleDelete(u.id)}><Icon name="trash" className="w-3 h-3" /> Delete</Btn>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon="users" title="No users" desc="Users will appear here after registration" />}
    </div>
  );
};

// ─── TOKENS VIEW ──────────────────────────────────────────────
const TokensView = ({ tokens, onRefresh }: { tokens: any[]; onRefresh: () => void }) => {
  const [query, setQuery] = useState("");
  const filtered = tokens.filter(t => t.token.toLowerCase().includes(query.toLowerCase()) || t.username?.toLowerCase().includes(query.toLowerCase()));

  const getO = () => { const s = sessionStorage.getItem("selectedApp"); return s ? JSON.parse(s).ownerId : ""; };
  const getS = () => { const s = sessionStorage.getItem("selectedApp"); return s ? JSON.parse(s).secret : ""; };

  const handleRevoke = async (id: string) => { await api.revokeToken(getO(), getS(), id); onRefresh(); };

  return (
    <div>
      <TopBar title="Tokens" subtitle="Active session tokens and authentication">
        <Btn variant="ghost" onClick={onRefresh}><Icon name="refresh" className="w-4 h-4" /></Btn>
      </TopBar>
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total" value={tokens.length} accent="bg-blue-500" />
        <StatCard label="Active" value={tokens.filter(t => t.status === "Active").length} accent="bg-emerald-500" />
        <StatCard label="Revoked" value={tokens.filter(t => t.status === "Banned").length} accent="bg-red-500" />
      </div>
      <div className="mb-5 relative">
        <Icon name="search" className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-zinc-500" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by token or username..."
          className="w-full rounded-xl border border-white/10 bg-zinc-900/60 py-3 pl-10 pr-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500/50 transition" />
      </div>
      <div className="space-y-3">
        {filtered.map(t => (
          <div key={t.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/60 px-5 py-4 transition hover:border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                <Icon name="shield" className="w-5 h-5" />
              </div>
              <div>
                <p className="font-mono text-sm font-bold text-white">{t.token}</p>
                <p className="text-[11px] text-zinc-500">User: {t.username} &middot; ID: {t.id.slice(0, 12)}...</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${t.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>{t.status}</span>
              {t.status === "Active" && <Btn variant="danger" size="xs" onClick={() => handleRevoke(t.id)}><Icon name="ban" className="w-3 h-3" /> Revoke</Btn>}
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon="shield" title="No tokens" desc="Tokens appear after user login" />}
    </div>
  );
};

// ─── SESSIONS VIEW ────────────────────────────────────────────
const SessionsView = ({ sessions, onRefresh }: { sessions: any[]; onRefresh: () => void }) => (
  <div>
    <TopBar title="Sessions" subtitle="Active user sessions">
      <Btn variant="ghost" onClick={onRefresh}><Icon name="refresh" className="w-4 h-4" /></Btn>
    </TopBar>
    {sessions.length > 0 ? (
      <div className="space-y-3">
        {sessions.map(s => (
          <div key={s.sessionId} className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/60 px-5 py-4 transition hover:border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                <Icon name="session" className="w-5 h-5" />
              </div>
              <div>
                <p className="font-mono text-sm font-bold text-white">{s.sessionId.slice(0, 24)}...</p>
                <p className="text-[11px] text-zinc-500">User: {s.userName || "N/A"} &middot; IP: {s.ip || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-500">{s.startedAt ? new Date(s.startedAt).toLocaleString() : "N/A"}</span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${s.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30"}`}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState icon="session" title="No active sessions" desc="Sessions appear when users log in via the C++ SDK" />
    )}
  </div>
);

// ─── WEBHOOKS VIEW ────────────────────────────────────────────
const WebhooksView = ({ webhooks, onRefresh }: { webhooks: any[]; onRefresh: () => void }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState("all");

  const getO = () => { const s = sessionStorage.getItem("selectedApp"); return s ? JSON.parse(s).ownerId : ""; };
  const getS = () => { const s = sessionStorage.getItem("selectedApp"); return s ? JSON.parse(s).secret : ""; };

  const handleCreate = async () => {
    if (!name || !url) return;
    await api.createWebhook(getO(), getS(), { name, url, events });
    setShowCreate(false); setName(""); setUrl(""); onRefresh();
  };
  const handleDelete = async (id: string) => { await api.deleteWebhook(getO(), getS(), id); onRefresh(); };

  return (
    <div>
      <TopBar title="Webhooks" subtitle="Event-driven HTTP callbacks">
        <Btn variant="primary" onClick={() => setShowCreate(true)}><Icon name="plus" className="w-4 h-4" /> New Webhook</Btn>
      </TopBar>
      {showCreate && (
        <div className="mb-5 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
          <h3 className="mb-3 text-sm font-bold text-white">Create Webhook</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <div><label className="mb-1 block text-[10px] uppercase tracking-widest text-zinc-500">Name</label><Input value={name} onChange={setName} placeholder="My Webhook" className="w-40" /></div>
              <div><label className="mb-1 block text-[10px] uppercase tracking-widest text-zinc-500">URL</label><Input value={url} onChange={setUrl} placeholder="https://..." className="w-72" /></div>
              <div><label className="mb-1 block text-[10px] uppercase tracking-widest text-zinc-500">Events</label>
                <Select value={events} onChange={setEvents} options={[{ value: "all", label: "All Events" }, { value: "login", label: "Login" }, { value: "register", label: "Register" }, { value: "ban", label: "Ban" }]} />
              </div>
            </div>
            <div className="flex gap-2">
              <Btn variant="primary" onClick={handleCreate}><Icon name="check" className="w-3.5 h-3.5" /> Create</Btn>
              <Btn variant="ghost" onClick={() => setShowCreate(false)}><Icon name="x" className="w-3.5 h-3.5" /> Cancel</Btn>
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {webhooks.map(w => (
          <div key={w.id} className="rounded-xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-5">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/20">
                  <Icon name="link" className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{w.name}</h4>
                  <p className="text-[11px] text-zinc-500 font-mono truncate max-w-[200px]">{w.url}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${w.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30"}`}>{w.status}</span>
            </div>
            <div className="space-y-2 text-xs">
              <Row label="Events" value={w.events} />
              <Row label="ID" value={w.id.slice(0, 16) + "..."} mono />
            </div>
            <div className="mt-3"><Btn variant="danger" size="xs" onClick={() => handleDelete(w.id)}><Icon name="trash" className="w-3 h-3" /> Delete</Btn></div>
          </div>
        ))}
      </div>
      {webhooks.length === 0 && <EmptyState icon="link" title="No webhooks" desc="Create webhooks to receive event callbacks" />}
    </div>
  );
};

// ─── VARIABLES VIEW ───────────────────────────────────────────
const VariablesView = ({ variables, onRefresh }: { variables: any[]; onRefresh: () => void }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const getO = () => { const s = sessionStorage.getItem("selectedApp"); return s ? JSON.parse(s).ownerId : ""; };
  const getS = () => { const s = sessionStorage.getItem("selectedApp"); return s ? JSON.parse(s).secret : ""; };

  const handleCreate = async () => {
    if (!name) return;
    await api.createVariable(getO(), getS(), { name, value });
    setShowCreate(false); setName(""); setValue(""); onRefresh();
  };
  const handleDelete = async (id: string) => { await api.deleteVariable(getO(), getS(), id); onRefresh(); };

  return (
    <div>
      <TopBar title="Variables" subtitle="Runtime configuration key-value pairs">
        <Btn variant="primary" onClick={() => setShowCreate(true)}><Icon name="plus" className="w-4 h-4" /> New Variable</Btn>
      </TopBar>
      {showCreate && (
        <div className="mb-5 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
          <h3 className="mb-3 text-sm font-bold text-white">Create Variable</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div><label className="mb-1 block text-[10px] uppercase tracking-widest text-zinc-500">Name</label><Input value={name} onChange={setName} placeholder="variable_name" className="w-48" /></div>
            <div><label className="mb-1 block text-[10px] uppercase tracking-widest text-zinc-500">Value</label><Input value={value} onChange={setValue} placeholder="value" className="w-64" /></div>
            <Btn variant="primary" onClick={handleCreate}><Icon name="check" className="w-3.5 h-3.5" /> Create</Btn>
            <Btn variant="ghost" onClick={() => setShowCreate(false)}><Icon name="x" className="w-3.5 h-3.5" /> Cancel</Btn>
          </div>
        </div>
      )}
      <div className="rounded-xl border border-white/5 bg-zinc-900/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5 text-left">
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Name</th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Value</th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">ID</th>
            <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
          </tr></thead>
          <tbody>
            {variables.map(v => (
              <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                <td className="px-5 py-3 font-bold text-white">{v.name}</td>
                <td className="px-5 py-3 font-mono text-zinc-300 text-xs">{v.value}</td>
                <td className="px-5 py-3 font-mono text-zinc-500 text-xs">{v.id.slice(0, 16)}...</td>
                <td className="px-5 py-3 text-right"><Btn variant="danger" size="xs" onClick={() => handleDelete(v.id)}><Icon name="trash" className="w-3 h-3" /></Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {variables.length === 0 && <EmptyState icon="variable" title="No variables" desc="Variables are accessible from the C++ SDK" />}
    </div>
  );
};

// ─── LOGS VIEW ────────────────────────────────────────────────
const LogsView = ({ logs, onRefresh }: { logs: any[]; onRefresh: () => void }) => {
  const [query, setQuery] = useState("");
  const filtered = logs.filter(l => l.message?.toLowerCase().includes(query.toLowerCase()) || l.pcuser?.toLowerCase().includes(query.toLowerCase()));

  const getO = () => { const s = sessionStorage.getItem("selectedApp"); return s ? JSON.parse(s).ownerId : ""; };
  const getS = () => { const s = sessionStorage.getItem("selectedApp"); return s ? JSON.parse(s).secret : ""; };

  const handleClear = async () => { await api.deleteLogs(getO(), getS()); onRefresh(); };

  return (
    <div>
      <TopBar title="Logs" subtitle="Client-side log entries from C++ SDK">
        <Btn variant="danger" onClick={handleClear}><Icon name="trash" className="w-4 h-4" /> Clear All</Btn>
        <Btn variant="ghost" onClick={onRefresh}><Icon name="refresh" className="w-4 h-4" /></Btn>
      </TopBar>
      <div className="mb-5 relative">
        <Icon name="search" className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-zinc-500" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search logs..."
          className="w-full rounded-xl border border-white/10 bg-zinc-900/60 py-3 pl-10 pr-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500/50 transition" />
      </div>
      <div className="rounded-xl border border-white/5 bg-zinc-900/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5 text-left">
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Time</th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">PC User</th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Message</th>
          </tr></thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                <td className="px-5 py-3 font-mono text-zinc-500 text-xs whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="px-5 py-3 font-mono text-zinc-300 text-xs">{l.pcuser}</td>
                <td className="px-5 py-3 text-white">{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <EmptyState icon="terminal" title="No logs" desc="Logs appear when the C++ SDK calls log()" />}
    </div>
  );
};

// ─── SETTINGS VIEW ────────────────────────────────────────────
const SettingsView = ({ app, onRefresh }: { app: any; onRefresh: () => void }) => {
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (val: string, field: string) => {
    navigator.clipboard?.writeText(val);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div>
      <TopBar title="Settings" subtitle="Application credentials and configuration" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-6">
          <h3 className="mb-4 text-lg font-bold text-white">Application Info</h3>
          <div className="space-y-4">
            <Row label="Name" value={app.name} />
            <Row label="Version" value={`v${app.version}`} accent="blue" />
            <Row label="Status" value={app.status} accent={app.status === "Active" ? "green" : "blue"} />
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Owner ID</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 font-mono text-xs text-zinc-300 truncate">{app.ownerId}</div>
                <button onClick={() => copy(app.ownerId, "ownerId")} className={`rounded-lg border p-2 transition ${copied === "ownerId" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"}`}>
                  <Icon name={copied === "ownerId" ? "check" : "copy"} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Secret</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 font-mono text-xs text-zinc-300 truncate">
                  {showSecret ? app.secret : "\u2022".repeat(32)}
                </div>
                <button onClick={() => setShowSecret(!showSecret)} className="rounded-lg border border-white/10 bg-zinc-900 p-2 text-zinc-400 hover:text-white transition">
                  <Icon name={showSecret ? "eyeOff" : "eye"} className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => copy(app.secret, "secret")} className={`rounded-lg border p-2 transition ${copied === "secret" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"}`}>
                  <Icon name={copied === "secret" ? "check" : "copy"} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-6">
          <h3 className="mb-4 text-lg font-bold text-white">API Configuration</h3>
          <div className="space-y-4">
            <div><label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Endpoint URL</label><div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 font-mono text-xs text-zinc-300">http://localhost:3001/api/1.0</div></div>
            <div><label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Protocol</label><div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-zinc-300">AES-256-CBC Encrypted</div></div>
            <div><label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-zinc-500">SDK Support</label><div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-zinc-300">C++ (WinHTTP + BCrypt), C#, Python, Java, Go</div></div>
          </div>
        </div>
      </div>
    </div>
  );
};
