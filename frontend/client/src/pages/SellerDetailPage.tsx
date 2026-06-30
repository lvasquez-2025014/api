import React, { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { API_URL } from "../lib/authApi";

type IconName = "apps" | "license" | "users" | "token" | "sub" | "chat" | "session" | "webhook" | "file" | "variable" | "settings" | "eye" | "eyeOff" | "copy" | "search" | "plus" | "filter" | "chevron" | "check" | "ban" | "trash" | "edit" | "pause" | "play" | "logo" | "refresh" | "x" | "save" | "key" | "shield" | "clock" | "download" | "upload" | "link" | "zap" | "activity" | "terminal" | "database" | "globe" | "lock" | "unlock" | "arrowLeft" | "info" | "resources";

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
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
    resources: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

const Btn = ({ children, onClick, variant = "default", size = "sm", className = "", disabled }: {
  children: React.ReactNode; onClick?: () => void; variant?: "default" | "primary" | "danger" | "ghost" | "success" | "amber" | "green" | "blue" | "purple";
  size?: "xs" | "sm" | "md"; className?: string; disabled?: boolean;
}) => {
  const v = {
    default: "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10",
    primary: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40",
    danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
    ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20",
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

const StatCard = ({ label, value, color = "white" }: { label: string; value: number | string; color?: string }) => (
  <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-5 text-center">
    <p className={`text-3xl font-bold ${color === "green" ? "text-emerald-400" : color === "amber" ? "text-amber-400" : color === "blue" ? "text-blue-400" : "text-white"}`}>{value}</p>
    <p className="mt-1 text-xs text-zinc-500">{label}</p>
  </div>
);

const CredentialRow = ({ label, value, showCopy = true }: { label: string; value: string; showCopy?: boolean }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="flex-1 truncate font-mono text-sm text-white">{value}</p>
        {showCopy && (
          <button onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className={`rounded-lg border p-2 transition ${copied ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"}`}>
            <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

const CODE_URL = (import.meta as any).env?.VITE_API_URL
  ? `${(import.meta as any).env.VITE_API_URL}/api/1.0`
  : "http://localhost:3001/api/1.0";

function getCodeSnippet(lang: string, app: any): string {
  const n = app.name, o = app.ownerId, v = app.version, s = app.secret;
  switch (lang) {
    case "cpp": return `std::string name = skCrypt("${n}").decrypt();
std::string ownerid = skCrypt("${o}").decrypt();
std::string version = skCrypt("${v}").decrypt();
std::string url = skCrypt("${CODE_URL}").decrypt();
std::string path = skCrypt("").decrypt();

keyauth::api api(name, ownerid, version, url, path);
if (!api.init()) {
    std::cout << api.last_error;
    Sleep(-1);
}`;
    case "csharp": return `KeyAuthApi api = new KeyAuthApi(
    "${n}",
    "${o}",
    "${v}",
    "${CODE_URL}"
);

if (!api.Init()) {
    Console.WriteLine(api.LastError);
    Console.ReadLine();
}`;
    case "python": return `import KeyAuth

api = KeyAuthApi(
    name="${n}",
    ownerid="${o}",
    version="${v}",
    url="${CODE_URL}"
)

if not api.init():
    print(api.last_error)
    exit()`;
    case "php": return `<?php
$api = new KeyAuthApi(
    "${n}",
    "${o}",
    "${v}",
    "${CODE_URL}"
);

if (!$api->init()) {
    echo $api->last_error;
    exit();
}`;
    case "javascript": return `const KeyAuth = require("keyauth");

const api = new KeyAuth({
    name: "${n}",
    ownerid: "${o}",
    version: "${v}",
    url: "${CODE_URL}"
});

if (!api.init()) {
    console.log(api.last_error);
    process.exit();
}`;
    case "typescript": return `import KeyAuth from "keyauth";

const api = new KeyAuth({
    name: "${n}",
    ownerid: "${o}",
    version: "${v}",
    url: "${CODE_URL}"
});

if (!api.init()) {
    console.log(api.last_error);
    process.exit();
}`;
    case "java": return `KeyAuthApi api = new KeyAuthApi(
    "${n}",
    "${o}",
    "${v}",
    "${CODE_URL}"
);

if (!api.init()) {
    System.out.println(api.last_error);
    System.exit(0);
}`;
    case "vbnet": return `Dim api As New KeyAuthApi(
    "${n}",
    "${o}",
    "${v}",
    "${CODE_URL}"
)

If Not api.Init() Then
    Console.WriteLine(api.last_error)
    Console.ReadLine()
End If`;
    case "rust": return `use keyauth::KeyAuth;

let api = KeyAuth::new(
    "${n}",
    "${o}",
    "${v}",
    "${CODE_URL}"
);

if !api.init() {
    println!("{}", api.last_error);
    std::process::exit(1);
}`;
    case "go": return `package main

import "keyauth"

func main() {
    api := keyauth.New(
        "${n}",
        "${o}",
        "${v}",
        "${CODE_URL}",
    )

    if !api.Init() {
        fmt.Println(api.LastError)
        os.Exit(1)
    }
}`;
    case "lua": return `local keyauth = require("keyauth")

local api = keyauth.new({
    name = "${n}",
    ownerid = "${o}",
    version = "${v}",
    url = "${CODE_URL}"
})

if not api:init() then
    print(api.last_error)
    os.exit()
end`;
    case "ruby": return `require 'keyauth'

api = KeyAuth::Api.new(
    name: "${n}",
    ownerid: "${o}",
    version: "${v}",
    url: "${CODE_URL}"
)

unless api.init
    puts api.last_error
    exit
end`;
    case "perl": return `use KeyAuth;

my $api = KeyAuth->new(
    name     => "${n}",
    ownerid  => "${o}",
    version  => "${v}",
    url      => "${CODE_URL}"
);

unless ($api->init()) {
    print $api->last_error . "\\n";
    exit;
}`;
    default: return "// Select a language";
  }
}

const sidebarLinks = [
  { id: "manage-apps", label: "Manage Apps", icon: "apps" as IconName },
  { id: "licenses", label: "Licenses", icon: "license" as IconName },
  { id: "users", label: "Users", icon: "users" as IconName },
  { id: "settings", label: "Settings", icon: "settings" as IconName },
];

const LicensesView = ({ app }: { app: any }) => {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(5);
  const [duration, setDuration] = useState(30);
  const [subLevel, setSubLevel] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const headers = { "X-Owner-Id": app.ownerId, "X-Secret": app.secret, "Content-Type": "application/json" };
  const fetchOpts = { headers, credentials: 'include' as const };

  const fetchLicenses = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/seller/licenses?page=1&limit=200`, fetchOpts);
      const data = await res.json();
      setLicenses(data.licenses || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [app.ownerId, app.secret]);

  useEffect(() => { fetchLicenses(); }, [fetchLicenses]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/seller/licenses/generate`, {
        method: "POST", ...fetchOpts,
        body: JSON.stringify({ count, durationDays: duration, subLevel }),
      });
      if (res.ok) fetchLicenses();
    } catch (err) { console.error(err); }
    setGenerating(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/v1/seller/licenses/${id}`, { method: "DELETE", ...fetchOpts });
      setLicenses(prev => prev.filter(l => l._id !== id));
    } catch (err) { console.error(err); }
  };

  const copyKey = (key: string) => {
    navigator.clipboard?.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-white">Licenses</h1>
      <p className="mb-6 text-sm text-zinc-500">Generate and manage licenses for your application</p>

      <div className="mb-6 rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <h3 className="mb-4 text-sm font-bold text-white">Generate Licenses</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-zinc-500">Count</label>
            <input type="number" value={count} onChange={e => setCount(Number(e.target.value))} min={1} max={100}
              className="w-20 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-zinc-500">Duration (days)</label>
            <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={1}
              className="w-24 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-zinc-500">Sub Level</label>
            <input type="number" value={subLevel} onChange={e => setSubLevel(Number(e.target.value))} min={0}
              className="w-20 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50" />
          </div>
          <Btn variant="primary" onClick={handleGenerate} disabled={generating}>
            <Icon name="plus" className="w-3.5 h-3.5" /> {generating ? "Generating..." : "Generate"}
          </Btn>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">All Licenses ({licenses.length})</h3>
          <Btn variant="ghost" onClick={fetchLicenses}><Icon name="refresh" className="w-3.5 h-3.5" /></Btn>
        </div>
        {loading ? (
          <div className="flex h-20 items-center justify-center text-zinc-500">Loading...</div>
        ) : licenses.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-zinc-500 text-sm">No licenses yet. Generate some above.</div>
        ) : (
          <div className="space-y-2">
            {licenses.map(l => (
              <div key={l._id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/30 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon name="key" className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-mono text-xs text-white truncate">{l.key}</span>
                  <button onClick={() => copyKey(l.key)} className={`shrink-0 rounded border p-1 transition ${copiedKey === l.key ? "border-emerald-500/50 text-emerald-400" : "border-white/10 text-zinc-400 hover:text-white"}`}>
                    <Icon name={copiedKey === l.key ? "check" : "copy"} className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${l.status === "Used" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"}`}>{l.status}</span>
                  <span className="text-[11px] text-zinc-500">{l.durationDays}d</span>
                  <button onClick={() => handleDelete(l._id)} className="text-zinc-500 hover:text-red-400 transition"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const UsersView = ({ app }: { app: any }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const headers = { "X-Owner-Id": app.ownerId, "X-Secret": app.secret, "Content-Type": "application/json" };
  const fetchOpts = { headers, credentials: 'include' as const };

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/seller/users?search=&page=1&limit=200`, fetchOpts);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [app.ownerId, app.secret]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreateUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) { setError("All fields required"); return; }
    setCreating(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/seller/users`, {
        method: "POST", ...fetchOpts,
        body: JSON.stringify({ username: newUsername.trim(), password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNewUsername(""); setNewPassword(""); setShowCreate(false);
      fetchUsers();
    } catch (err: any) { setError(err.message); }
    setCreating(false);
  };

  const handleBan = async (userId: string) => {
    try {
      await fetch(`${API_URL}/api/v1/seller/users/${userId}/ban`, { method: "POST", ...fetchOpts });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (userId: string) => {
    try {
      await fetch(`${API_URL}/api/v1/seller/users/${userId}`, { method: "DELETE", ...fetchOpts });
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-white">Users</h1>
      <p className="mb-6 text-sm text-zinc-500">Manage registered users for your application</p>

      <div className="mb-6 flex items-center gap-2">
        <Btn variant="primary" onClick={() => setShowCreate(!showCreate)}>
          <Icon name="plus" className="w-3.5 h-3.5" /> Add User
        </Btn>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
          <h3 className="mb-4 text-sm font-bold text-white">Create New User</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Username"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500/50" />
            <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password" type="password"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500/50" />
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <div className="mt-3 flex gap-2">
            <Btn variant="primary" onClick={handleCreateUser} disabled={creating}>
              <Icon name="check" className="w-3.5 h-3.5" /> {creating ? "Creating..." : "Create"}
            </Btn>
            <Btn variant="ghost" onClick={() => { setShowCreate(false); setError(""); }}>Cancel</Btn>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">All Users ({users.length})</h3>
          <Btn variant="ghost" onClick={fetchUsers}><Icon name="refresh" className="w-3.5 h-3.5" /></Btn>
        </div>
        {loading ? (
          <div className="flex h-20 items-center justify-center text-zinc-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-zinc-500 text-sm">No users registered yet.</div>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u._id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                    <Icon name="users" className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{u.username}</p>
                    <p className="text-[11px] text-zinc-500">HWID: {u.hwid || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${u.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>{u.status}</span>
                  <Btn variant="amber" size="xs" onClick={() => handleBan(u._id)}><Icon name="ban" className="w-3 h-3" /> Ban</Btn>
                  <Btn variant="danger" size="xs" onClick={() => handleDelete(u._id)}><Icon name="trash" className="w-3 h-3" /></Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function SellerDetailPage() {
  const [, params] = useRoute("/keyauth/seller/:sellerId");
  const [, navigate] = useLocation();
  const sellerId = params?.sellerId;

  const [seller, setSeller] = useState<any>(null);
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [codeLang, setCodeLang] = useState("cpp");
  const [codeCopied, setCodeCopied] = useState(false);
  const [error, setError] = useState("");
  const [sidebarView, setSidebarView] = useState("manage-apps");

  useEffect(() => {
    if (!sellerId) return;
    const stored = sessionStorage.getItem("selectedSeller");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed._id === sellerId) setSeller(parsed);
    }
  }, [sellerId]);

  const fetchApp = useCallback(async () => {
    if (!sellerId) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/seller-management/${sellerId}/app`, { credentials: 'include' });
      if (res.ok) { const data = await res.json(); setApp(data.app); }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [sellerId]);

  useEffect(() => { fetchApp(); }, [fetchApp]);

  const handleCreateApp = async () => {
    if (!appName.trim()) { setError("App name is required"); return; }
    setCreating(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/seller-management/${sellerId}/app`, {
        method: "POST",
        credentials: 'include',
        body: JSON.stringify({ name: appName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setApp(data.app);
    } catch (err: any) { setError(err.message); }
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950">
        <div className="text-center">
          <p className="text-zinc-400">Seller not found</p>
          <button onClick={() => navigate("/keyauth")} className="mt-3 text-sm text-blue-400 hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-zinc-950 text-white antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative flex w-full">
        {/* SIDEBAR */}
        <aside className="flex h-full w-60 flex-col border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 border-b border-white/5 px-4 py-4">
            <button onClick={() => navigate("/keyauth")} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white transition shrink-0">
              <Icon name="arrowLeft" className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 shrink-0">
                <Icon name="logo" className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{app ? app.name : "No App"}</p>
                <p className="text-[9px] text-zinc-500">{seller.username}</p>
              </div>
            </div>
          </div>

          <nav className="mt-3 flex-1 overflow-y-auto px-2 space-y-0.5">
            {sidebarLinks.map((l) => (
              <button key={l.id} onClick={() => setSidebarView(l.id)}
                className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                  sidebarView === l.id
                    ? "bg-blue-500/15 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}>
                <Icon name={l.icon} className="w-4 h-4 shrink-0" />
                <span>{l.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6 lg:p-8">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center gap-2 text-sm">
              <Icon name="apps" className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-500">Manage Apps</span>
              <span className="text-zinc-600">&raquo;</span>
              <span className="text-zinc-300">{app ? `Current Application: ${app.name}` : "No Application"}</span>
            </div>

            {!app ? (
              /* ─── CREATE APP PROMPT ─── */
              <div className="flex min-h-[50vh] flex-col items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center">
                  <div className="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/20">
                    <Icon name="apps" className="w-8 h-8" />
                  </div>
                  <h2 className="mb-2 text-xl font-bold text-white">Create Application</h2>
                  <p className="mb-6 text-sm text-zinc-500">Choose a name for {seller.username}'s application</p>
                  <Input value={appName} onChange={setAppName} placeholder="Application name" onKeyDown={e => e.key === "Enter" && handleCreateApp()} className="mb-3" />
                  {error && <p className="mb-3 text-xs text-red-400">{error}</p>}
                  <Btn variant="primary" size="md" onClick={handleCreateApp} disabled={creating} className="w-full justify-center">
                    <Icon name="check" className="w-4 h-4" /> {creating ? "Creating..." : "Create Application"}
                  </Btn>
                </div>
              </div>
            ) : sidebarView === "manage-apps" ? (
              /* ─── MANAGE APPS VIEW ─── */
              <div>
                <h1 className="mb-1 text-2xl font-bold text-white">Manage Applications</h1>
                <p className="mb-6 text-sm text-zinc-500">Manage your applications. Applications are the backbone of all the data.</p>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-4 gap-4">
                  <StatCard label="Total Apps" value={1} />
                  <StatCard label="Active" value={1} color="green" />
                  <StatCard label="Paused" value={0} color="amber" />
                  <StatCard label="Active Sessions" value={0} color="blue" />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* LEFT: Credentials */}
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
                    <h3 className="mb-1 text-lg font-bold text-white">Application Credentials</h3>
                    <p className="mb-4 text-xs text-zinc-500">Simply replace the placeholder code in the example with these</p>
                    <div className="flex items-center gap-3 mb-4">
                      <button onClick={() => setShowCode(!showCode)}
                        className={`relative h-6 w-11 rounded-full transition ${showCode ? "bg-blue-500" : "bg-zinc-700"}`}>
                        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${showCode ? "translate-x-5" : ""}`} />
                      </button>
                      <span className="text-xs text-zinc-400">Display Code Snippet</span>
                    </div>
                    <div className="space-y-3">
                      <CredentialRow label="Application Name" value={app.name} showCopy={false} />
                      <CredentialRow label="Account Owner ID" value={app.ownerId} />
                      <CredentialRow label="Application Secret" value={app.secret} />
                      <CredentialRow label="Application Version" value={app.version} showCopy={false} />
                    </div>
                    <div className="mt-4">
                      <Btn variant="amber"><Icon name="refresh" className="w-3.5 h-3.5" /> Refresh Application Secret</Btn>
                    </div>
                    <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                      <div className="flex items-start gap-3">
                        <Icon name="info" className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-blue-400">Notice!</p>
                          <p className="text-xs text-zinc-400 mt-1">Application secrets are only displayed for users using our older API endpoints. If you're using our newer API (1.3), application secrets are not used!</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: My Applications */}
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white">My Applications</h3>
                    </div>

                    {/* App Card */}
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold text-white">{app.name}</h4>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold text-emerald-400 uppercase">Active</span>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-zinc-400 mb-4">
                        <div><span className="text-zinc-600">App Version</span><p className="text-white font-bold mt-0.5">{app.version}</p></div>
                        <div><span className="text-zinc-600">Users</span><p className="text-white font-bold mt-0.5">0</p></div>
                        <div><span className="text-zinc-600">Application Standing</span><p className="text-emerald-400 font-bold mt-0.5">Good</p></div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Btn variant="green" size="xs"><Icon name="check" className="w-3 h-3" /> Selected</Btn>
                      </div>
                    </div>
                  </div>
                </div>

                {showCode && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <label className="text-sm text-zinc-400">Select Language:</label>
                      <select value={codeLang} onChange={e => setCodeLang(e.target.value)}
                        className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50 cursor-pointer">
                        <option value="cpp">C++</option>
                        <option value="csharp">C#</option>
                        <option value="python">Python</option>
                        <option value="php">PHP</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="java">Java</option>
                        <option value="vbnet">VB.Net</option>
                        <option value="rust">Rust</option>
                        <option value="go">Go</option>
                        <option value="lua">Lua</option>
                        <option value="ruby">Ruby</option>
                        <option value="perl">Perl</option>
                      </select>
                    </div>
                    <pre className="overflow-x-auto rounded-lg bg-black/60 p-4 text-xs text-zinc-300 font-mono whitespace-pre leading-relaxed">{getCodeSnippet(codeLang, app)}</pre>
                    <div className="mt-4 flex gap-3">
                      <Btn variant="primary" size="sm" onClick={() => { navigator.clipboard?.writeText(getCodeSnippet(codeLang, app)); setCodeCopied(true); setTimeout(() => setCodeCopied(false), 1500); }}>
                        <Icon name={codeCopied ? "check" : "copy"} className="w-3.5 h-3.5" /> {codeCopied ? "Copied!" : "Copy Code"}
                      </Btn>
                      <Btn variant="green" size="sm"><Icon name="terminal" className="w-3.5 h-3.5" /> View Example</Btn>
                      <Btn variant="default" size="sm"><Icon name="play" className="w-3.5 h-3.5" /> View Tutorial</Btn>
                    </div>
                  </div>
                )}
              </div>
            ) : sidebarView === "licenses" ? (
              <LicensesView app={app} />
            ) : sidebarView === "users" ? (
              <UsersView app={app} />
            ) : (
              <div className="flex min-h-[40vh] flex-col items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/20 mb-4">
                  <Icon name={sidebarLinks.find(l => l.id === sidebarView)?.icon || "apps"} className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{sidebarLinks.find(l => l.id === sidebarView)?.label}</h2>
                <p className="text-sm text-zinc-500">This section will be available soon.</p>
              </div>
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
