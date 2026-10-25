import { useState, useMemo, useEffect } from 'react';
import { Calculator, Copy, Check } from 'lucide-react';

export default function SubnetCalculator({ externalSubnet }: { externalSubnet?: string }) {
  const [ipInput, setIpInput] = useState('192.168.1.50');
  const [cidr, setCidr] = useState(24);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (externalSubnet && externalSubnet.includes('/')) {
      const [ip, c] = externalSubnet.split('/');
      if (ip) setIpInput(ip);
      const parsedCidr = parseInt(c, 10);
      if (!isNaN(parsedCidr) && parsedCidr >= 1 && parsedCidr <= 32) {
        setCidr(parsedCidr);
      }
    }
  }, [externalSubnet]);

  // Subnet calculations
  const calculation = useMemo(() => {
    // Validate IP
    const parts = ipInput.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return null;
    }

    const ipNum = ((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0);
    const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const networkNum = (ipNum & maskNum) >>> 0;
    const broadcastNum = (networkNum | ~maskNum) >>> 0;

    const numToIp = (n: number) => {
      return [
        (n >>> 24) & 255,
        (n >>> 16) & 255,
        (n >>> 8) & 255,
        n & 255,
      ].join('.');
    };

    const maskIp = numToIp(maskNum);
    const networkIp = numToIp(networkNum);
    const broadcastIp = numToIp(broadcastNum);
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, totalHosts - 2);

    const firstHostIp = cidr >= 31 ? networkIp : numToIp(networkNum + 1);
    const lastHostIp = cidr >= 31 ? broadcastIp : numToIp(broadcastNum - 1);

    const wildcardNum = (~maskNum) >>> 0;
    const wildcardIp = numToIp(wildcardNum);

    return {
      maskIp,
      networkIp,
      broadcastIp,
      firstHostIp,
      lastHostIp,
      totalHosts,
      usableHosts,
      wildcardIp,
    };
  }, [ipInput, cidr]);

  const copyVal = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="p-4 rounded-xl border space-y-4 transition-colors bg-white border-slate-200 dark:bg-[#0b132b]/80 dark:border-cyan-500/20">
      <div className="flex items-center gap-2 font-semibold text-sm text-cyan-800 dark:text-cyan-400">
        <Calculator className="w-4 h-4" />
        <span>Calcolatore Subnet IPv4 per Tecnici</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-gray-400">
            Indirizzo IP Host
          </label>
          <input
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value.trim())}
            placeholder="es. 192.168.1.100"
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none font-mono transition-colors
              bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600 focus:bg-white
              dark:bg-[#162038] dark:border-cyan-500/40 dark:text-white dark:focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-gray-400">
            Prefisso CIDR (/{cidr})
          </label>
          <select
            value={cidr}
            onChange={(e) => setCidr(parseInt(e.target.value, 10))}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none font-mono transition-colors
              bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600
              dark:bg-[#162038] dark:border-cyan-500/40 dark:text-white dark:focus:border-cyan-400"
          >
            {[24, 25, 26, 27, 28, 29, 30, 23, 22, 21, 20, 16, 8].map((c) => (
              <option key={c} value={c}>
                /{c} ({Math.pow(2, 32 - c) - (c >= 31 ? 0 : 2)} host)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick CIDR buttons */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] font-medium mr-1 text-slate-500 dark:text-gray-400">Comuni:</span>
        {[24, 25, 26, 27, 28, 29, 30].map((c) => (
          <button
            key={c}
            onClick={() => setCidr(c)}
            className={`text-xs px-2 py-0.5 rounded font-mono transition-colors ${
              cidr === c
                ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-[#0b132b] font-bold shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 dark:bg-[#1c2541] dark:text-gray-300 dark:hover:text-white dark:border-gray-700'
            }`}
          >
            /{c}
          </button>
        ))}
      </div>

      {calculation ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded-lg border flex flex-col justify-between bg-slate-50 border-slate-200 dark:bg-[#162038] dark:border-gray-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-gray-400">Subnet Mask</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-semibold text-cyan-800 dark:text-cyan-300">{calculation.maskIp}</span>
              <button onClick={() => copyVal(calculation.maskIp, 'mask')} className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white">
                {copied === 'mask' ? <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border flex flex-col justify-between bg-slate-50 border-slate-200 dark:bg-[#162038] dark:border-gray-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-gray-400">Network ID</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-semibold text-slate-900 dark:text-white">{calculation.networkIp}</span>
              <button onClick={() => copyVal(calculation.networkIp, 'net')} className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white">
                {copied === 'net' ? <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border flex flex-col justify-between bg-slate-50 border-slate-200 dark:bg-[#162038] dark:border-gray-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-gray-400">Range Host Utili</span>
            <div className="mt-1">
              <span className="font-mono font-semibold text-[11px] block truncate text-teal-700 dark:text-teal-300">
                {calculation.firstHostIp} ➔ {calculation.lastHostIp}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border flex flex-col justify-between bg-slate-50 border-slate-200 dark:bg-[#162038] dark:border-gray-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-gray-400">Host Utili / Broadcast</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-semibold text-amber-700 dark:text-amber-300">{calculation.usableHosts} IP</span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400">{calculation.broadcastIp}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">Indirizzo IP inserito non valido.</p>
      )}
    </div>
  );
}
