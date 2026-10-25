import { useState, useEffect } from 'react';
import { NetworkAuditItem, AuditStatus, VlanItem } from '../types';
import { INITIAL_NETWORK_AUDITS } from '../data/itKnowledge';
import {
  Network,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Copy,
  Check,
  Trash2,
  Download,
  Upload,
  Server,
  Shield,
  Activity,
  Layers,
  Building,
  Calendar,
  Radio,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY = 'io_it_network_history_v1';

export default function NetworkHistorySection({
  onSelectSubnetForCalculator,
}: {
  onSelectSubnetForCalculator?: (subnet: string) => void;
}) {
  const [audits, setAudits] = useState<NetworkAuditItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading network audits from localStorage:', e);
    }
    return INITIAL_NETWORK_AUDITS;
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tutti');
  const [typeFilter, setTypeFilter] = useState<string>('Tutti');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');
  const [networkType, setNetworkType] = useState<NetworkAuditItem['networkType']>('Ufficio PMI');
  const [subnet, setSubnet] = useState('192.168.1.0/24');
  const [gateway, setGateway] = useState('192.168.1.1');
  const [dnsPrimary, setDnsPrimary] = useState('192.168.1.1');
  const [dnsSecondary, setDnsSecondary] = useState('8.8.8.8');
  const [dhcpRange, setDhcpRange] = useState('.50 - .200');
  const [ispInfo, setIspInfo] = useState('TIM FTTH 1000/300 Mbps');
  const [firewallRouter, setFirewallRouter] = useState('FortiGate 40F / FritzBox');
  const [switches, setSwitches] = useState('Switch 24p Gigabit PoE');
  const [vlansInput, setVlansInput] = useState('10:Dati:192.168.10.0/24, 20:VoIP:192.168.20.0/24');
  const [avgLatencyMs, setAvgLatencyMs] = useState(12.5);
  const [packetLossPercent, setPacketLossPercent] = useState(0.0);
  const [status, setStatus] = useState<AuditStatus>('conforme');
  const [keyFindings, setKeyFindings] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Persist audits
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
    } catch (e) {
      console.error('Error saving network audits to localStorage:', e);
    }
  }, [audits]);

  const handleAddAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !subnet.trim()) return;

    // Parse VLANs from input
    const parsedVlans: VlanItem[] = [];
    if (vlansInput.trim()) {
      vlansInput.split(',').forEach((item) => {
        const parts = item.split(':').map((s) => s.trim());
        if (parts.length >= 2) {
          const id = parseInt(parts[0], 10);
          if (!isNaN(id)) {
            parsedVlans.push({
              id,
              name: parts[1] || `VLAN_${id}`,
              subnet: parts[2] || '',
              purpose: parts[1],
            });
          }
        }
      });
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newAudit: NetworkAuditItem = {
      id: 'net-audit-' + Date.now(),
      clientName: clientName.trim(),
      location: location.trim() || 'N/D',
      networkType,
      subnet: subnet.trim(),
      gateway: gateway.trim(),
      dnsPrimary: dnsPrimary.trim(),
      dnsSecondary: dnsSecondary.trim() || undefined,
      dhcpRange: dhcpRange.trim(),
      ispInfo: ispInfo.trim(),
      firewallRouter: firewallRouter.trim(),
      switches: switches.trim(),
      vlans: parsedVlans,
      avgLatencyMs: Number(avgLatencyMs) || 10,
      packetLossPercent: Number(packetLossPercent) || 0,
      status,
      keyFindings: keyFindings.trim() || 'Nessuna anomalia critica riscontrata.',
      resolutionNotes: resolutionNotes.trim() || 'Verifica connettività completata regolarmente.',
      analyzedAt: formattedDate,
    };

    setAudits([newAudit, ...audits]);

    // Reset form
    setClientName('');
    setLocation('');
    setKeyFindings('');
    setResolutionNotes('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Vuoi davvero eliminare questo record di analisi di rete?')) {
      setAudits(audits.filter((a) => a.id !== id));
    }
  };

  const handleCopySummary = (audit: NetworkAuditItem) => {
    const text = `========================================================
SCHEDA AUDIT RETE — io IT Assistente Tecnico
========================================================
CLIENTE: ${audit.clientName}
SEDE: ${audit.location} (${audit.networkType})
DATA ANALISI: ${audit.analyzedAt}
STATO AUDIT: ${audit.status.toUpperCase()}

PARAMETRI DI RETE:
• Subnet Principale: ${audit.subnet}
• Gateway Predefinito: ${audit.gateway}
• Server DNS: Primario ${audit.dnsPrimary}${audit.dnsSecondary ? ` | Secondario ${audit.dnsSecondary}` : ''}
• Pool DHCP: ${audit.dhcpRange}

CONNETTIVITÀ & APPARATI:
• Linea ISP: ${audit.ispInfo}
• Router / Firewall: ${audit.firewallRouter}
• Switch di Rete: ${audit.switches}
• Latenza Ping Media: ${audit.avgLatencyMs} ms (Packet Loss: ${audit.packetLossPercent}%)

VLAN CONFIGURATE:
${
  audit.vlans.length > 0
    ? audit.vlans.map((v) => `• VLAN ${v.id} (${v.name}): ${v.subnet} - ${v.purpose}`).join('\n')
    : '• Nessuna VLAN configurata (Flat Network / Rete Piatta)'
}

DIAGNOSI & RILIEVI:
${audit.keyFindings}

AZIONI SVOLTE / SOLUZIONE:
${audit.resolutionNotes}
========================================================`;

    navigator.clipboard.writeText(text);
    setCopiedId(audit.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(audits, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `io_IT_Storico_Reti_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setAudits([...parsed, ...audits]);
          alert(`${parsed.length} schede di rete importate nello storico!`);
        }
      } catch (err) {
        alert('File non valido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Quick auto-fill test simulator
  const simulateLiveAuditScan = () => {
    setAvgLatencyMs(Math.round((8 + Math.random() * 14) * 10) / 10);
    setPacketLossPercent(Math.random() > 0.8 ? 0.4 : 0.0);
    setStatus('conforme');
    setKeyFindings('Scansione ARP completata. Gateway e DNS interni rispondono entro i tempi previsti. Nessun conflitto IP rilevato nel pool.');
    setResolutionNotes('Verificata raggiungibilità trunk SIP 3CX e server applicativo. Tabelle routing conformi.');
  };

  // Filtered audits
  const filteredAudits = audits.filter((item) => {
    const matchesStatus = statusFilter === 'Tutti' || item.status === statusFilter;
    const matchesType = typeFilter === 'Tutti' || item.networkType === typeFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      q === '' ||
      item.clientName.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.subnet.toLowerCase().includes(q) ||
      item.gateway.toLowerCase().includes(q) ||
      item.ispInfo.toLowerCase().includes(q) ||
      item.firewallRouter.toLowerCase().includes(q) ||
      item.keyFindings.toLowerCase().includes(q) ||
      item.resolutionNotes.toLowerCase().includes(q);
    return matchesStatus && matchesType && matchesSearch;
  });

  // Aggregated stats
  const totalCount = audits.length;
  const compliantCount = audits.filter((a) => a.status === 'conforme').length;
  const warningCount = audits.filter((a) => a.status === 'warning').length;
  const criticalCount = audits.filter((a) => a.status === 'critico').length;

  return (
    <div className="space-y-4">
      {/* Top Banner KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl border bg-white border-slate-200 dark:bg-[#0b132b] dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">Reti Analizzate</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">{totalCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-400 flex items-center justify-center">
            <Network className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl border bg-white border-slate-200 dark:bg-[#0b132b] dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">Conformi (OK)</span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{compliantCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl border bg-white border-slate-200 dark:bg-[#0b132b] dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">Con Rilievi (Warning)</span>
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">{warningCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl border bg-white border-slate-200 dark:bg-[#0b132b] dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">Critiche / Da Sanare</span>
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">{criticalCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Action Bar (Add, Import, Export) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border bg-white border-slate-200 dark:bg-[#0b132b]/80 dark:border-cyan-500/20 shadow-sm">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-colors bg-cyan-600 hover:bg-cyan-700 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-[#0b132b] shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Chiudi Form' : 'Registra Nuova Rete Analizzata'}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-[#1c2541] dark:hover:bg-cyan-500/20 dark:text-gray-300 dark:hover:text-cyan-300 dark:border-gray-700"
            title="Esporta lo storico delle reti analizzate in formato JSON"
          >
            <Download className="w-3.5 h-3.5" />
            Esporta JSON
          </button>

          <label className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-[#1c2541] dark:hover:bg-cyan-500/20 dark:text-gray-300 dark:hover:text-cyan-300 dark:border-gray-700">
            <Upload className="w-3.5 h-3.5" />
            Importa
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Add New Network Audit Form */}
      {showAddForm && (
        <form onSubmit={handleAddAudit} className="p-4 rounded-xl border space-y-3 bg-white border-slate-300 shadow-md dark:bg-[#0b132b] dark:border-cyan-500/40">
          <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-gray-800">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300">
              <Network className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Scheda Audit & Caratteristiche Rete Cliente
            </h4>
            <button
              type="button"
              onClick={simulateLiveAuditScan}
              className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-700 px-2 py-0.5 rounded"
              title="Compila automaticamente i parametri di latenza ed esito con un test simulato"
            >
              <Sparkles className="w-3 h-3" />
              Simula Ping Scan
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Ragione Sociale / Cliente *</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="es. Studio Rossi & Partner"
                required
                className="w-full rounded-lg px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Sede / Ubicazione</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="es. Milano (MI) - Sede Centrale"
                className="w-full rounded-lg px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Tipologia Rete</label>
              <select
                value={networkType}
                onChange={(e) => setNetworkType(e.target.value as any)}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              >
                <option value="Ufficio PMI">🏢 Ufficio PMI</option>
                <option value="Studio Professionale">💼 Studio Professionale</option>
                <option value="Magazzino / Logistica">📦 Magazzino / Logistica</option>
                <option value="Industriale">🏭 Industriale / Fabbrica</option>
                <option value="Filiale Remota">🌐 Filiale Remota</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Subnet & CIDR *</label>
              <input
                type="text"
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                placeholder="es. 192.168.10.0/24"
                required
                className="w-full rounded-lg px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 text-slate-900 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Gateway</label>
              <input
                type="text"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                placeholder="es. 192.168.10.1"
                className="w-full rounded-lg px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 text-slate-900 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">DNS Primario</label>
              <input
                type="text"
                value={dnsPrimary}
                onChange={(e) => setDnsPrimary(e.target.value)}
                placeholder="es. 192.168.10.2 (DC)"
                className="w-full rounded-lg px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 text-slate-900 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Pool DHCP Range</label>
              <input
                type="text"
                value={dhcpRange}
                onChange={(e) => setDhcpRange(e.target.value)}
                placeholder="es. .100 - .250"
                className="w-full rounded-lg px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 text-slate-900 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Linea ISP & IP Pubblico</label>
              <input
                type="text"
                value={ispInfo}
                onChange={(e) => setIspInfo(e.target.value)}
                placeholder="es. TIM FTTH 1000/300 con IP Fisso"
                className="w-full rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 text-slate-900 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Router / Firewall</label>
              <input
                type="text"
                value={firewallRouter}
                onChange={(e) => setFirewallRouter(e.target.value)}
                placeholder="es. FortiGate 40F / pfSense"
                className="w-full rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 text-slate-900 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Switch & AP</label>
              <input
                type="text"
                value={switches}
                onChange={(e) => setSwitches(e.target.value)}
                placeholder="es. UniFi USW-24 PoE + 4x U6-Pro"
                className="w-full rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 text-slate-900 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">
                VLAN Configurate (formato: ID:Nome:Subnet, es. 10:Dati:192.168.10.0/24, 20:VoIP:192.168.20.0/24)
              </label>
              <input
                type="text"
                value={vlansInput}
                onChange={(e) => setVlansInput(e.target.value)}
                placeholder="es. 10:Dati:192.168.10.0/24, 20:VoIP:192.168.20.0/24, 30:Guest"
                className="w-full rounded-lg px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 text-slate-900 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Esito Audit Rete</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AuditStatus)}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 text-slate-900 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              >
                <option value="conforme">🟢 Conforme (Nessun problema)</option>
                <option value="warning">🟡 Attenzione (Rilievi non bloccanti)</option>
                <option value="critico">🔴 Critico (Loop, saturazione o blocchi)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Diagnosi / Anomalia Rilevata</label>
              <textarea
                rows={2}
                value={keyFindings}
                onChange={(e) => setKeyFindings(e.target.value)}
                placeholder="es. Conflitto DHCP con router secondario; Telefoni 3CX con audio muto..."
                className="w-full rounded-lg p-2 text-xs bg-slate-50 border border-slate-300 text-slate-900 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Azioni Eseguite / Soluzione Applicata</label>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="es. Disattivato SIP ALG; impostata prenotazione MAC nel DHCP; abilitata VLAN 20..."
                className="w-full rounded-lg p-2 text-xs bg-slate-50 border border-slate-300 text-slate-900 dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-md text-xs text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-[#0b132b] font-bold rounded-md text-xs transition-colors shadow-sm"
            >
              + Salva Scheda Audit
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca cliente, subnet, gateway, ISP, router (es. 192.168.10, FortiGate, TIM)..."
            className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none transition-colors bg-white border border-slate-300 text-slate-900 focus:border-cyan-600 dark:bg-[#0b132b] dark:border-cyan-500/30 dark:text-white dark:focus:border-cyan-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1">
          {(['Tutti', 'conforme', 'warning', 'critico'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors capitalize ${
                statusFilter === st
                  ? st === 'conforme'
                    ? 'bg-emerald-600 text-white font-bold'
                    : st === 'warning'
                    ? 'bg-amber-600 text-white font-bold'
                    : st === 'critico'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-[#0b132b] font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-[#0b132b] dark:text-gray-300 dark:hover:text-white dark:border-gray-800'
              }`}
            >
              {st === 'conforme' ? '🟢 Conforme' : st === 'warning' ? '🟡 Attenzione' : st === 'critico' ? '🔴 Critico' : 'Tutti'}
            </button>
          ))}
        </div>
      </div>

      {/* List of Analyzed Networks Cards */}
      <div className="space-y-3">
        {filteredAudits.length === 0 ? (
          <div className="p-8 text-center rounded-xl border text-xs bg-white border-slate-200 text-slate-500 dark:bg-[#0b132b] dark:border-gray-800 dark:text-gray-400">
            Nessuna rete trovata con i filtri correnti. Inserisci un nuovo audit per archiviare i dati di rete dei tuoi clienti!
          </div>
        ) : (
          filteredAudits.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border transition-all space-y-3 bg-white border-slate-200 hover:border-cyan-500/50 shadow-sm dark:bg-[#0b132b] dark:border-gray-800 dark:hover:border-cyan-500/40"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-2.5 border-slate-100 dark:border-gray-800/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.clientName}</h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                          item.status === 'conforme'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                            : item.status === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 border border-rose-300 dark:border-rose-700'
                        }`}
                      >
                        {item.status === 'conforme' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : item.status === 'warning' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <AlertOctagon className="w-3 h-3" />
                        )}
                        {item.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] mt-1 text-slate-500 dark:text-gray-400 font-sans">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        {item.location}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#1c2541] font-medium text-slate-700 dark:text-gray-300">
                        {item.networkType}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 dark:text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {item.analyzedAt}
                      </span>
                    </div>
                  </div>

                  {/* Top Right Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {onSelectSubnetForCalculator && (
                      <button
                        onClick={() => onSelectSubnetForCalculator(item.subnet)}
                        className="text-[11px] font-medium px-2 py-1 rounded transition-colors bg-cyan-50 hover:bg-cyan-100 text-cyan-800 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30"
                        title="Carica questa subnet nel calcolatore IPv4"
                      >
                        Calcola Subnet
                      </button>
                    )}

                    <button
                      onClick={() => handleCopySummary(item)}
                      className="p-1.5 rounded transition-colors bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#1c2541] dark:hover:bg-cyan-500/20 dark:text-gray-300 dark:hover:text-cyan-300"
                      title="Copia scheda audit completa per ticket o email"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded transition-colors bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 dark:bg-[#1c2541] dark:hover:bg-rose-500/20 dark:text-gray-300 dark:hover:text-rose-400"
                      title="Elimina record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Network Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#162038] border border-slate-200 dark:border-gray-800">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-sans block">Subnet & CIDR</span>
                    <span className="font-bold text-cyan-800 dark:text-cyan-300 text-[12px]">{item.subnet}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#162038] border border-slate-200 dark:border-gray-800">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-sans block">Gateway LAN</span>
                    <span className="font-bold text-slate-800 dark:text-white text-[12px]">{item.gateway}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#162038] border border-slate-200 dark:border-gray-800">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-sans block">Server DNS</span>
                    <span className="font-bold text-teal-700 dark:text-teal-300 text-[11px] truncate block">{item.dnsPrimary}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#162038] border border-slate-200 dark:border-gray-800">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-sans block">Latenza & Packet Loss</span>
                    <span className="font-bold text-amber-700 dark:text-amber-300 text-[12px]">
                      {item.avgLatencyMs} ms ({item.packetLossPercent}% loss)
                    </span>
                  </div>
                </div>

                {/* Infrastructure Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-[#060a17] p-2.5 rounded-lg border border-slate-200 dark:border-gray-800/80">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-500 block">Connettività ISP</span>
                    <span className="font-medium text-slate-800 dark:text-gray-200">{item.ispInfo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-500 block">Router / Firewall</span>
                    <span className="font-medium text-slate-800 dark:text-gray-200">{item.firewallRouter}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-500 block">Switching & AP</span>
                    <span className="font-medium text-slate-800 dark:text-gray-200">{item.switches}</span>
                  </div>
                </div>

                {/* VLANs badges */}
                {item.vlans && item.vlans.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      VLAN Segregate:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.vlans.map((v) => (
                        <div
                          key={v.id}
                          className="text-[11px] px-2 py-0.5 rounded-md border font-mono bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-[#162038] dark:text-cyan-300 dark:border-cyan-500/30 flex items-center gap-1.5"
                        >
                          <span className="font-bold">ID {v.id}</span>
                          <span className="text-slate-500 dark:text-gray-400">({v.name})</span>
                          {v.subnet && <span className="text-teal-700 dark:text-teal-300 text-[10px]">{v.subnet}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audit Findings & Resolution Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg border bg-slate-100/70 border-slate-200 dark:bg-[#141b30] dark:border-gray-800">
                    <span className="font-bold text-slate-800 dark:text-gray-200 block mb-1">🔍 Diagnosi & Rilievi Rilevati:</span>
                    <p className="text-slate-600 dark:text-gray-300 leading-relaxed">{item.keyFindings}</p>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-teal-50/70 border-teal-200 dark:bg-teal-950/20 dark:border-teal-800/40">
                    <span className="font-bold text-teal-900 dark:text-teal-300 block mb-1">🛠️ Azioni Eseguite & Soluzione:</span>
                    <p className="text-teal-800 dark:text-teal-200 leading-relaxed">{item.resolutionNotes}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
