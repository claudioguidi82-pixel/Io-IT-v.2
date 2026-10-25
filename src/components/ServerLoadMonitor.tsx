import { useState, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import {
  Activity,
  Cpu,
  Database,
  HardDrive,
  Play,
  Pause,
  RotateCcw,
  Users,
  Zap,
  Server,
  Network,
} from 'lucide-react';

interface MetricPoint {
  time: string;
  cpu: number;
  ram: number;
  network: number;
  disk: number;
}

interface ServerProfile {
  id: string;
  name: string;
  role: string;
  os: string;
  specs: string;
  baseCpu: number;
  baseRam: number;
  topProcesses: { name: string; cpu: number; ram: string }[];
}

const SERVER_PROFILES: ServerProfile[] = [
  {
    id: 'srv-app01',
    name: 'SRV-APP01 (Zucchetti & Tomcat)',
    role: 'Server Gestionale ERP & Portale Web',
    os: 'Windows Server 2022 Standard',
    specs: '8 vCPU • 32 GB RAM • NVMe SSD',
    baseCpu: 42,
    baseRam: 68,
    topProcesses: [
      { name: 'tomcat9.exe (Infinity)', cpu: 22, ram: '8.4 GB' },
      { name: 'sqlservr.exe (DB Aziendale)', cpu: 14, ram: '11.2 GB' },
      { name: 'adhoc_srv.exe', cpu: 6, ram: '2.1 GB' },
      { name: 'svchost.exe (RPC/DCOM)', cpu: 2, ram: '480 MB' },
    ],
  },
  {
    id: 'srv-rds01',
    name: 'SRV-RDS01 (Terminal Server Ufficio)',
    role: 'Session Host Multi-Utente Desktop Remoto',
    os: 'Windows Server 2019 Datacenter',
    specs: '16 vCPU • 64 GB RAM • SAN Storage',
    baseCpu: 62,
    baseRam: 81,
    topProcesses: [
      { name: 'adhoc.exe (18 sessioni)', cpu: 32, ram: '16.5 GB' },
      { name: 'chrome.exe (multi-tab)', cpu: 18, ram: '14.2 GB' },
      { name: 'splwow64.exe (Spooler)', cpu: 5, ram: '1.2 GB' },
      { name: 'dwm.exe (Window Manager)', cpu: 4, ram: '890 MB' },
    ],
  },
  {
    id: 'srv-dc01',
    name: 'SRV-DC01 (Domain Controller)',
    role: 'Active Directory, DNS & DHCP Primario',
    os: 'Windows Server 2022 Datacenter',
    specs: '4 vCPU • 16 GB RAM • SAS 15K',
    baseCpu: 18,
    baseRam: 38,
    topProcesses: [
      { name: 'lsass.exe (Kerberos/AD)', cpu: 8, ram: '1.4 GB' },
      { name: 'dns.exe (Server DNS)', cpu: 4, ram: '720 MB' },
      { name: 'ntoskrnl.exe', cpu: 3, ram: '950 MB' },
      { name: 'dhcpserver.exe', cpu: 1, ram: '210 MB' },
    ],
  },
  {
    id: 'srv-voip01',
    name: 'SRV-VOIP01 (3CX SBC & PBX Gateway)',
    role: 'Centralino Telefonico & SBC Session Border',
    os: 'Debian 12 / 3CX V20 Dedicated',
    specs: '4 vCPU • 8 GB RAM • SSD',
    baseCpu: 26,
    baseRam: 44,
    topProcesses: [
      { name: '3cxsbc (Tunnel VoIP crittografato)', cpu: 12, ram: '1.1 GB' },
      { name: '3cxmedia (Flusso RTP Codec)', cpu: 9, ram: '850 MB' },
      { name: 'nginx (Console 3CX Web)', cpu: 3, ram: '320 MB' },
      { name: 'postgres (Database 3CX)', cpu: 2, ram: '580 MB' },
    ],
  },
];

// Helper to generate initial points
function generateInitialData(baseCpu: number, baseRam: number): MetricPoint[] {
  const points: MetricPoint[] = [];
  const now = Date.now();
  for (let i = 12; i >= 0; i--) {
    const t = new Date(now - i * 3000);
    const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`;
    const jitter = Math.sin(i) * 8 + (Math.random() * 8 - 4);
    points.push({
      time: timeStr,
      cpu: Math.min(99, Math.max(5, Math.round(baseCpu + jitter))),
      ram: Math.min(98, Math.max(10, Math.round(baseRam + (Math.random() * 3 - 1.5)))),
      network: Math.max(2, Math.round(18 + Math.random() * 35)),
      disk: Math.max(1, Math.round(12 + Math.random() * 25)),
    });
  }
  return points;
}

export default function ServerLoadMonitor() {
  const { theme } = useTheme();
  const [selectedServerId, setSelectedServerId] = useState<string>('srv-app01');
  const [isLive, setIsLive] = useState(true);
  const [stressActive, setStressActive] = useState(false);
  const [metricView, setMetricView] = useState<'all' | 'cpu' | 'ram' | 'network'>('all');

  const activeServer = SERVER_PROFILES.find((s) => s.id === selectedServerId) || SERVER_PROFILES[0];
  const [data, setData] = useState<MetricPoint[]>(() =>
    generateInitialData(activeServer.baseCpu, activeServer.baseRam)
  );

  // Reset data when server changes
  useEffect(() => {
    setData(generateInitialData(activeServer.baseCpu, activeServer.baseRam));
  }, [selectedServerId]);

  // Real-time tick effect
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      setData((prev) => {
        const last = prev[prev.length - 1];
        let cpuTarget = activeServer.baseCpu + (Math.random() * 16 - 8);
        let ramTarget = activeServer.baseRam + (Math.random() * 2 - 1);
        let netTarget = 20 + Math.random() * 30;
        let diskTarget = 15 + Math.random() * 25;

        // If stress test is active
        if (stressActive) {
          cpuTarget = Math.min(98, cpuTarget + 45);
          ramTarget = Math.min(95, ramTarget + 18);
          netTarget = Math.min(95, netTarget + 40);
          diskTarget = Math.min(92, diskTarget + 55);
        }

        const newPoint: MetricPoint = {
          time: timeStr,
          cpu: Math.min(100, Math.max(3, Math.round(cpuTarget))),
          ram: Math.min(100, Math.max(10, Math.round(ramTarget))),
          network: Math.min(100, Math.max(1, Math.round(netTarget))),
          disk: Math.min(100, Math.max(1, Math.round(diskTarget))),
        };

        const updated = [...prev.slice(1), newPoint];
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, stressActive, activeServer]);

  const latestPoint = data[data.length - 1] || { cpu: 0, ram: 0, network: 0, disk: 0, time: '' };

  const triggerStressTest = () => {
    setStressActive(true);
    setTimeout(() => {
      setStressActive(false);
    }, 12000);
  };

  const isDark = theme === 'dark';

  // Tooltip custom component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-2.5 rounded-lg border text-xs shadow-xl backdrop-blur-md font-mono ${
            isDark
              ? 'bg-[#0b132b]/95 border-cyan-500/40 text-white'
              : 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-900/10'
          }`}
        >
          <div className="font-bold border-b pb-1 mb-1.5 flex items-center justify-between gap-3 text-[11px] text-gray-400">
            <span>Orario: {label}</span>
            <span className="text-teal-400">● Live</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Server Switcher */}
      <div
        className={`p-3.5 rounded-xl border transition-colors ${
          isDark ? 'bg-[#0b132b] border-cyan-500/30' : 'bg-slate-50 border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
              }`}
            >
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Monitor Carico Server in Tempo Reale</span>
                {isLive ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    LIVE
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400">
                    IN PAUSA
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">
                Statistiche simulate ad alta fedeltà con visualizzazione grafica `recharts`
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                isLive
                  ? isDark
                    ? 'bg-[#1c2541] border-gray-700 text-gray-300 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-emerald-600 text-white border-emerald-700'
              }`}
            >
              {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isLive ? 'Pausa' : 'Riprendi'}
            </button>

            <button
              onClick={triggerStressTest}
              disabled={stressActive}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-bold border transition-all ${
                stressActive
                  ? 'bg-rose-500 text-white animate-pulse border-rose-600 shadow-md shadow-rose-500/30'
                  : isDark
                  ? 'bg-rose-950/40 text-rose-300 border-rose-800 hover:bg-rose-900/50'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
              title="Simula un improvviso picco di query SQL o sessioni utenti per testare la risposta dei grafici"
            >
              <Zap className="w-3.5 h-3.5" />
              {stressActive ? 'Stress Test Attivo!' : 'Simula Picco Carico'}
            </button>
          </div>
        </div>

        {/* Server Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-gray-800/80">
          {SERVER_PROFILES.map((srv) => {
            const isSelected = selectedServerId === srv.id;
            return (
              <button
                key={srv.id}
                onClick={() => setSelectedServerId(srv.id)}
                className={`text-left p-2 rounded-lg border transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-[#1c2541] border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-white border-cyan-600 text-slate-900 shadow-sm'
                    : isDark
                    ? 'bg-[#141b30] border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                    : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                  <Server className="w-3 h-3 text-cyan-500 shrink-0" />
                  <span className="truncate">{srv.name.split(' ')[0]}</span>
                </div>
                <div className="text-[10px] text-gray-400 truncate mt-0.5">{srv.role}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* CPU */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
            isDark ? 'bg-[#0b132b] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-cyan-500" />
              Carico CPU
            </span>
            <span className="font-mono text-[10px]">{activeServer.specs.split('•')[0].trim()}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`text-xl sm:text-2xl font-black font-mono ${
                latestPoint.cpu > 80
                  ? 'text-rose-500'
                  : latestPoint.cpu > 65
                  ? 'text-amber-500'
                  : 'text-cyan-600 dark:text-cyan-400'
              }`}
            >
              {latestPoint.cpu}%
            </span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-gray-500">
              {latestPoint.cpu > 80 ? '⚠️ Elevato' : 'Normale'}
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-slate-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full transition-all duration-500 ${
                latestPoint.cpu > 80 ? 'bg-rose-500' : latestPoint.cpu > 65 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${latestPoint.cpu}%` }}
            />
          </div>
        </div>

        {/* RAM */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
            isDark ? 'bg-[#0b132b] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-teal-500" />
              Memoria RAM
            </span>
            <span className="font-mono text-[10px]">{activeServer.specs.split('•')[1]?.trim()}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`text-xl sm:text-2xl font-black font-mono ${
                latestPoint.ram > 85 ? 'text-rose-500' : 'text-teal-600 dark:text-teal-300'
              }`}
            >
              {latestPoint.ram}%
            </span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-gray-500">
              {Math.round((latestPoint.ram / 100) * 32)} GB allocati
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-teal-500 transition-all duration-500"
              style={{ width: `${latestPoint.ram}%` }}
            />
          </div>
        </div>

        {/* Network */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
            isDark ? 'bg-[#0b132b] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Network className="w-3.5 h-3.5 text-blue-500" />
              I/O Rete LAN
            </span>
            <span className="font-mono text-[10px]">10 GbE</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
              {latestPoint.network} <span className="text-xs font-normal">MB/s</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-gray-500">RX/TX</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, latestPoint.network)}%` }}
            />
          </div>
        </div>

        {/* Disk Activity */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
            isDark ? 'bg-[#0b132b] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-purple-500" />
              Attività Disco
            </span>
            <span className="font-mono text-[10px]">C: System</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
              {latestPoint.disk}%
            </span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-gray-500">I/O Queue</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${latestPoint.disk}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div
        className={`p-4 rounded-xl border transition-colors ${
          isDark ? 'bg-[#0b132b] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Grafico Temporale (Ultimi 45s)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">
              Server: {activeServer.name.split(' ')[0]}
            </span>
          </div>

          {/* Metric Filter Tabs */}
          <div className="flex items-center gap-1">
            {(['all', 'cpu', 'ram', 'network'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setMetricView(mode)}
                className={`text-[11px] px-2.5 py-0.5 rounded font-medium transition-colors ${
                  metricView === mode
                    ? isDark
                      ? 'bg-cyan-500 text-[#0b132b] font-bold'
                      : 'bg-cyan-600 text-white font-bold'
                    : isDark
                    ? 'bg-[#1c2541] text-gray-400 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mode === 'all' ? 'Tutte' : mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#00b4d8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ec4b6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2ec4b6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
              />
              <XAxis
                dataKey="time"
                stroke={isDark ? '#64748b' : '#94a3b8'}
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke={isDark ? '#64748b' : '#94a3b8'}
                fontSize={10}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={30}
                formatter={(val) => (
                  <span className="text-xs font-semibold font-sans text-slate-700 dark:text-gray-300">
                    {val}
                  </span>
                )}
              />

              {(metricView === 'all' || metricView === 'cpu') && (
                <Area
                  type="monotone"
                  dataKey="cpu"
                  name="CPU (%)"
                  stroke="#00b4d8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCpu)"
                  isAnimationActive={false}
                />
              )}

              {(metricView === 'all' || metricView === 'ram') && (
                <Area
                  type="monotone"
                  dataKey="ram"
                  name="RAM (%)"
                  stroke="#2ec4b6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRam)"
                  isAnimationActive={false}
                />
              )}

              {(metricView === 'all' || metricView === 'network') && (
                <Area
                  type="monotone"
                  dataKey="network"
                  name="Rete / IO (%)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorNet)"
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Consuming Processes Table */}
      <div
        className={`p-3.5 rounded-xl border transition-colors ${
          isDark ? 'bg-[#0b132b] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-500" />
            Processi con Maggior Consumo ({activeServer.name.split(' ')[0]})
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400">
            OS: {activeServer.os}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 font-mono text-[10px]">
                <th className="pb-1.5">NOME PROCESSO / SERVIZIO</th>
                <th className="pb-1.5 text-right">CPU</th>
                <th className="pb-1.5 text-right">RAM USATA</th>
                <th className="pb-1.5 text-right">STATO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-mono text-xs">
              {activeServer.topProcesses.map((proc, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-1.5 text-slate-800 dark:text-gray-200 font-semibold">{proc.name}</td>
                  <td className="py-1.5 text-right font-bold text-cyan-600 dark:text-cyan-400">
                    {stressActive ? Math.round(proc.cpu * 1.6) : proc.cpu}%
                  </td>
                  <td className="py-1.5 text-right text-teal-600 dark:text-teal-300">{proc.ram}</td>
                  <td className="py-1.5 text-right">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                      Attivo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
