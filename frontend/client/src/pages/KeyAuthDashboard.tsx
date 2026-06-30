import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { API_URL } from "../lib/authApi";
import { useAuth } from "../contexts/AuthContext";

type IconName = "apps" | "license" | "users" | "token" | "sub" | "chat" | "session" | "webhook" | "file" | "variable" | "settings" | "eye" | "eyeOff" | "copy" | "search" | "plus" | "filter" | "chevron" | "check" | "ban" | "trash" | "edit" | "pause" | "play" | "logo" | "refresh" | "x" | "save" | "key" | "shield" | "clock" | "download" | "upload" | "link" | "zap" | "activity" | "terminal" | "database" | "globe" | "lock" | "unlock" | "arrowLeft" | "logOut";

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
    logOut: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

const Btn = ({ children, onClick, variant = "default", size = "sm", className = "", disabled }: {
  children: React.ReactNode; onClick?: () => void; variant?: "default" | "primary" | "danger" | "ghost" | "success";
  size?: "xs" | "sm" | "md"; className?: string; disabled?: boolean;
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
    <button onClick={onClick} disabled={disabled} className={`flex items-center gap-1.5 rounded-lg font-semibold transition ${v} ${s} ${disabled ? "opacity-50" : ""} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = "", onKeyDown }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; onKeyDown?: (e: React.KeyboardEvent) => void }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} onKeyDown={onKeyDown}
    className={`w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500/50 transition ${className}`} />
);

const Row = ({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: string }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-zinc-500">{label}</span>
    <span className={`truncate font-medium ${accent === "blue" ? "text-blue-400" : accent === "red" ? "text-red-400" : accent === "green" ? "text-emerald-400" : "text-white"} ${mono ? "font-mono text-[11px]" : ""}`}>{value}</span>
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

const CopyBtn = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className={`rounded-lg border p-2 transition ${copied ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"}`}
      title={label}>
      <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5" />
    </button>
  );
};

export default function KeyAuthDashboard() {
  const [, navigate] = useLocation();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"sellers" | "bans">("sellers");
  const [bans, setBans] = useState<any[]>([]);
  const [bansLoading, setBansLoading] = useState(false);
  const [banIpInput, setBanIpInput] = useState("");
  const { logout } = useAuth();

  const token = localStorage.getItem("token");

  const fetchSellers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/seller-management`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSellers(data.sellers || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchSellers(); }, [fetchSellers]);

  const fetchBans = useCallback(async () => {
    setBansLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/bans`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setBans(Array.isArray(data) ? data : []);
    } catch { }
    setBansLoading(false);
  }, [token]);

  useEffect(() => { if (activeTab === "bans") fetchBans(); }, [activeTab, fetchBans]);

  const handleUnban = async (ip: string) => {
    try {
      await fetch(`${API_URL}/api/v1/bans/unban`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ip }),
      });
      setBans(prev => prev.filter(b => b.ip !== ip));
    } catch { }
  };

  const handleManualBan = async () => {
    if (!banIpInput.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/bans/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ip: banIpInput.trim(), reason: "Manually banned by owner" }),
      });
      if (res.ok) {
        fetchBans();
        setBanIpInput("");
      }
    } catch { }
  };

  const handleCreate = async () => {
    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) { setError("All fields are required"); return; }
    setCreating(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/seller-management`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: newUsername.trim(), email: newEmail.trim(), password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSellers(prev => [...prev, { ...data.seller, app: null }]);
      setNewUsername(""); setNewEmail(""); setNewPassword(""); setShowCreate(false);
    } catch (err: any) { setError(err.message); }
    setCreating(false);
  };

  const handleDelete = async (e: React.MouseEvent, seller: any) => {
    e.stopPropagation();
    if (!window.confirm(`Delete seller "${seller.username}" and their app?`)) return;
    try {
      await fetch(`${API_URL}/api/v1/seller-management/${seller._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setSellers(prev => prev.filter(s => s._id !== seller._id));
    } catch (err) { console.error(err); }
  };

  const openSeller = (seller: any) => {
    sessionStorage.setItem("selectedSeller", JSON.stringify(seller));
    navigate(`/keyauth/seller/${seller._id}`);
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-white antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>
      <div className="relative flex w-full h-full">
        <aside className="flex h-full w-64 flex-col border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30">
              <Icon name="logo" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">OFICIAL AUTH</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
          <nav className="mt-4 flex-1 overflow-y-auto px-3">
            <button onClick={() => setActiveTab("sellers")} className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${activeTab === "sellers" ? "bg-gradient-to-r from-blue-500/20 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}>
              <Icon name="users" className="w-[18px] h-[18px]" />
              <span>Sellers</span>
              {activeTab === "sellers" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px] shadow-blue-400" />}
            </button>
            <button onClick={() => setActiveTab("bans")} className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${activeTab === "bans" ? "bg-gradient-to-r from-red-500/20 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(239,68,68,0.3)]" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}>
              <Icon name="ban" className="w-[18px] h-[18px]" />
              <span>Banned IPs</span>
              {bans.length > 0 && <span className="ml-auto rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-400">{bans.length}</span>}
            </button>
          </nav>
          <div className="shrink-0 border-t border-white/5 p-4">
            <div className="rounded-lg bg-zinc-900/60 p-3 text-xs space-y-1 mb-3">
              <div className="flex justify-between"><span className="text-zinc-500">Sellers</span><span className="text-white font-bold">{sellers.length}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Banned IPs</span><span className="text-red-400 font-bold">{bans.length}</span></div>
            </div>
            <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition">
              <Icon name="logOut" className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6 lg:p-8">
            {activeTab === "sellers" && (
            <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Sellers</h1>
                <p className="mt-1 text-sm text-zinc-500">Double-click a seller to manage their application</p>
              </div>
              <div className="flex items-center gap-2">
                <Btn variant="primary" onClick={() => setShowCreate(!showCreate)}><Icon name="plus" className="w-4 h-4" /> Add Seller</Btn>
                <Btn variant="ghost" onClick={fetchSellers}><Icon name="refresh" className="w-4 h-4" /></Btn>
              </div>
            </div>

            {showCreate && (
              <div className="mb-6 rounded-xl border border-white/10 bg-zinc-900/60 p-5">
                <h3 className="mb-4 text-sm font-semibold text-white">Create New Seller</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input value={newUsername} onChange={setNewUsername} placeholder="Username" onKeyDown={e => e.key === "Enter" && handleCreate()} />
                  <Input value={newEmail} onChange={setNewEmail} placeholder="Email" onKeyDown={e => e.key === "Enter" && handleCreate()} />
                  <Input value={newPassword} onChange={setNewPassword} placeholder="Password" onKeyDown={e => e.key === "Enter" && handleCreate()} />
                </div>
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                <div className="mt-3 flex gap-2">
                  <Btn variant="primary" onClick={handleCreate} disabled={creating}>
                    <Icon name="check" className="w-3.5 h-3.5" /> {creating ? "Creating..." : "Create"}
                  </Btn>
                  <Btn variant="ghost" onClick={() => { setShowCreate(false); setError(""); }}>Cancel</Btn>
                </div>
              </div>
            )}

            {sellers.length === 0 ? (
              <EmptyState icon="users" title="No sellers yet" desc="Create a seller to get started. Each seller gets their own application." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sellers.map(s => (
                  <div key={s._id} onDoubleClick={() => openSeller(s)}
                    className="cursor-pointer rounded-xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-5 transition hover:border-blue-500/30 hover:bg-zinc-900/60">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/20">
                          <Icon name="users" className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{s.username}</p>
                          <p className="text-[11px] text-zinc-500">{s.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 space-y-1 text-xs">
                      <Row label="Role" value={s.role} accent="blue" />
                      <Row label="App" value={s.app ? s.app.name : "Not created yet"} accent={s.app ? "green" : undefined} />
                      <Row label="Created" value={new Date(s.createdAt).toLocaleDateString()} />
                    </div>
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <Btn variant="primary" size="xs" onClick={() => openSeller(s)}><Icon name="settings" className="w-3 h-3" /> Manage</Btn>
                      <Btn variant="danger" size="xs" onClick={(e) => handleDelete(e, s)}><Icon name="trash" className="w-3 h-3" /> Delete</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </>
            )}

            {activeTab === "bans" && (
            <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Banned IPs</h1>
                <p className="mt-1 text-sm text-zinc-500">IPs banned for security violations (DevTools detection)</p>
              </div>
              <div className="flex items-center gap-2">
                <Btn variant="ghost" onClick={fetchBans}><Icon name="refresh" className="w-4 h-4" /></Btn>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-white/10 bg-zinc-900/60 p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Manually Ban IP</h3>
              <div className="flex gap-2">
                <Input value={banIpInput} onChange={setBanIpInput} placeholder="Enter IP address (e.g. 192.168.1.1)" onKeyDown={e => e.key === "Enter" && handleManualBan()} className="flex-1" />
                <Btn variant="danger" onClick={handleManualBan}><Icon name="ban" className="w-3.5 h-3.5" /> Ban</Btn>
              </div>
            </div>

            {bansLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            ) : bans.length === 0 ? (
              <EmptyState icon="ban" title="No banned IPs" desc="No IPs have been banned yet. Bans are auto-created when DevTools is detected." />
            ) : (
              <div className="space-y-3">
                {bans.map((ban) => (
                  <div key={ban._id} className="flex items-center justify-between rounded-xl border border-red-500/10 bg-red-500/5 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                        <Icon name="ban" className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white font-mono">{ban.ip}</p>
                        <p className="text-[11px] text-zinc-500">{ban.reason}</p>
                        <p className="text-[10px] text-zinc-600">
                          Banned by {ban.bannedBy} on {new Date(ban.bannedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Btn variant="success" size="xs" onClick={() => handleUnban(ban.ip)}>
                      <Icon name="unlock" className="w-3 h-3" /> Unban
                    </Btn>
                  </div>
                ))}
              </div>
            )}
            </>
            )}
          </div>
          <div className="border-t border-white/5 px-6 py-4 text-center">
            <p className="text-[11px] text-zinc-600">&copy; {new Date().getFullYear()} Oficial Auth &mdash; Developer <span className="text-zinc-400 font-semibold">Asmodeus</span></p>
          </div>
        </main>
      </div>
    </div>
  );
}
