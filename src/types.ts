export type CategoryType = 'hardware' | 'network' | '3cx' | 'zucchetti' | 'windows' | 'altro';

export interface NoteItem {
  id: string;
  title: string;
  category: CategoryType;
  clientRef?: string;
  solution: string;
  createdAt: string;
  tags?: string[];
}

export interface CommandItem {
  id: string;
  cmd: string;
  type: 'cmd' | 'powershell' | 'msc';
  title: string;
  category: 'Rete' | 'Dominio' | 'Sistema' | 'Diagnostica' | 'Storage';
  description: string;
  example?: string;
}

export interface DictionaryTerm {
  term: string;
  shortDesc: string;
  fullDesc: string;
  category: string;
}

export interface WirePin {
  pin: number;
  colorName: string;
  bgClass: string;
  stripeColor?: string;
  isStripe: boolean;
  functionDesc: string;
  pair: number;
}

export type AuditStatus = 'conforme' | 'warning' | 'critico';

export interface VlanItem {
  id: number;
  name: string;
  subnet: string;
  purpose: string;
}

export interface NetworkAuditItem {
  id: string;
  clientName: string;
  location: string;
  networkType: 'Ufficio PMI' | 'Magazzino / Logistica' | 'Studio Professionale' | 'Filiale Remota' | 'Industriale';
  subnet: string; // e.g. 192.168.10.0/24
  gateway: string; // e.g. 192.168.10.1
  dnsPrimary: string; // e.g. 192.168.10.2
  dnsSecondary?: string; // e.g. 1.1.1.1
  dhcpRange: string; // e.g. .100 - .250
  ispInfo: string; // e.g. TIM FTTH 1000/300 con IP Statico
  firewallRouter: string; // e.g. FortiGate 40F / pfSense
  switches: string; // e.g. UniFi Pro 24 PoE 250W
  vlans: VlanItem[];
  avgLatencyMs: number;
  packetLossPercent: number;
  status: AuditStatus;
  keyFindings: string;
  resolutionNotes: string;
  analyzedAt: string;
}

