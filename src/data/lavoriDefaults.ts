import { Customer, WorkReport } from '../types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    code: 'CLI001',
    name: 'Studio Tecnico Ingegneria Rossi & Associati',
    vatNumber: 'IT01234567891',
    contactPerson: 'Ing. Marco Rossi',
    phone: '+39 02 8901234',
    email: 'm.rossi@studiorossi.it',
    address: 'Via Dante 14',
    city: 'Milano (MI)',
  },
  {
    id: 'cust-2',
    code: 'CLI002',
    name: 'Logistica & Trasporti F.lli Bianchi Srl',
    vatNumber: 'IT09876543210',
    contactPerson: 'Sig. Roberto Bianchi',
    phone: '+39 039 456789',
    email: 'ufficiotecnico@logisticabianchi.it',
    address: 'Viale delle Industrie 88',
    city: 'Monza (MB)',
  },
  {
    id: 'cust-3',
    code: 'CLI003',
    name: 'Farmacia Santa Maria Dr.ssa Verdi',
    vatNumber: 'IT04455667788',
    contactPerson: 'Dr.ssa Laura Verdi',
    phone: '+39 02 7812903',
    email: 'amministrazione@farmaciasantamaria.it',
    address: 'Corso Buenos Aires 45',
    city: 'Milano (MI)',
  },
  {
    id: 'cust-4',
    code: 'CLI004',
    name: 'Officine Meccaniche Precisione S.p.A.',
    vatNumber: 'IT06677889900',
    contactPerson: 'Per. Ind. Giorgio Colombo',
    phone: '+39 035 998877',
    email: 'it@meccanicaprecisione.it',
    address: 'Via Matteotti 12',
    city: 'Bergamo (BG)',
  },
  {
    id: 'cust-5',
    code: 'CLI005',
    name: 'Studio Commercialista & Tributario Dott. Neri',
    vatNumber: 'IT03322114455',
    contactPerson: 'Dott. Alessandro Neri',
    phone: '+39 02 6655443',
    email: 'segreteria@studioneri.it',
    address: 'Piazza Cavour 7',
    city: 'Milano (MI)',
  },
];

export const INITIAL_WORK_REPORTS: WorkReport[] = [
  {
    id: 'rep-1',
    reportNumber: 'LAV-2026-001',
    date: '2026-10-25',
    customerCode: 'CLI001',
    customerName: 'Studio Tecnico Ingegneria Rossi & Associati',
    customerVat: 'IT01234567891',
    activityType: 'assistenza tecnica',
    hoursWorked: 2.5,
    technician: 'IO-IT / Tecnico Senior',
    description: 'Risoluzione spooler di stampa bloccato su server Windows e ripristino provision softphone 3CX per 4 interni tecnici.',
    jobReference: 'TK-9021',
    status: 'completato',
    notes: 'Verificata comunicazione verso PBX 3CX e stampante multifunzione ricondivisa via IP statico.',
    createdAt: '2026-10-25T10:30:00Z',
  },
  {
    id: 'rep-2',
    reportNumber: 'LAV-2026-002',
    date: '2026-10-24',
    customerCode: 'CLI002',
    customerName: 'Logistica & Trasporti F.lli Bianchi Srl',
    customerVat: 'IT09876543210',
    activityType: 'attivazione linea',
    technician: 'IO-IT / Tecnico Senior',
    description: 'Attivazione connettività FTTH di backup con configurazione failover dual-WAN su firewall FortiGate 40F e test routing VLAN magazzino.',
    jobReference: 'FIBRA-2026-B',
    status: 'completato',
    notes: 'IP pubblico statico secondario configurato con policy di load-balancing.',
    createdAt: '2026-10-24T16:15:00Z',
  },
  {
    id: 'rep-3',
    reportNumber: 'LAV-2026-003',
    date: '2026-10-23',
    customerCode: 'CLI005',
    customerName: 'Studio Commercialista & Tributario Dott. Neri',
    customerVat: 'IT03322114455',
    activityType: 'formazione',
    hoursWorked: 3.0,
    technician: 'IO-IT / Tecnico Senior',
    description: 'Sessione di formazione del personale su Zucchetti Omnia / Ad Hoc: importazione massiva fatture elettroniche, riconciliazione estratti conto e gestione anagrafiche.',
    jobReference: 'FORM-ZH-04',
    status: 'da_fatturare',
    notes: 'Formati 3 operatori contabili; rilasciata guida operativa rapida.',
    createdAt: '2026-10-23T14:00:00Z',
  },
  {
    id: 'rep-4',
    reportNumber: 'LAV-2026-004',
    date: '2026-10-22',
    customerCode: 'CLI004',
    customerName: 'Officine Meccaniche Precisione S.p.A.',
    customerVat: 'IT06677889900',
    activityType: 'preventivo',
    technician: 'IO-IT / Tecnico Senior',
    description: 'Sopralluogo per stesura preventivo rinnovo infrastruttura switch PoE UniFi Pro e migrazione server Active Directory verso Windows Server 2025.',
    jobReference: 'PREV-2026-88',
    status: 'in_corso',
    notes: 'Censiti 14 armadi rack e 48 punti rete cat 6A.',
    createdAt: '2026-10-22T11:45:00Z',
  },
  {
    id: 'rep-5',
    reportNumber: 'LAV-2026-005',
    date: '2026-10-21',
    customerCode: 'CLI003',
    customerName: 'Farmacia Santa Maria Dr.ssa Verdi',
    activityType: 'vendita',
    technician: 'IO-IT / Tecnico Senior',
    description: 'Vendita e fornitura di 2 telefoni VoIP Yealink T54W e gruppo di continuità UPS APC Smart-UPS 1500VA per cassa banco.',
    jobReference: 'VEND-HW-112',
    status: 'completato',
    notes: 'Consegna effettuata con bolla di trasporto.',
    createdAt: '2026-10-21T09:20:00Z',
  },
];

/**
 * Generates CSV / TXT specifically structured for Zucchetti Ad Hoc (Revolution / Enterprise / Infinity)
 * Standard format uses semicolon ';' separator, formatted date DD/MM/YYYY or YYYY-MM-DD,
 * and standard columns recognized by Zucchetti Ad Hoc external file import.
 */
export function generateZucchettiAdHocCsv(
  reports: WorkReport[],
  includeHeader: boolean = true,
  dateFormat: 'IT' | 'ISO' = 'IT'
): string {
  const sanitize = (text?: string) => {
    if (!text) return '';
    // Replace semicolons and newlines to preserve delimiter integrity
    return text.replace(/;/g, ',').replace(/[\r\n]+/g, ' ').trim();
  };

  const header = 'DATA;COD_CONTO;RAGIONE_SOCIALE;TIPO_ATTIVITA;ORE_LAVORATE;NOTE_LAVORAZIONE;TECNICO;RIF_COMMESSA;STATO;PARTITA_IVA;NUM_RAPPORTO';

  const rows = reports.map((r) => {
    let dateStr = r.date;
    if (dateFormat === 'IT' && r.date.includes('-')) {
      const [y, m, d] = r.date.split('-');
      dateStr = `${d}/${m}/${y}`;
    }

    const hours = r.hoursWorked !== undefined ? Number(r.hoursWorked).toFixed(2).replace('.', ',') : '';
    
    return [
      dateStr,
      sanitize(r.customerCode),
      sanitize(r.customerName),
      sanitize(r.activityType),
      hours,
      sanitize(r.description),
      sanitize(r.technician),
      sanitize(r.jobReference || ''),
      sanitize(r.status),
      sanitize(r.customerVat || ''),
      sanitize(r.reportNumber),
    ].join(';');
  });

  return includeHeader ? [header, ...rows].join('\r\n') : rows.join('\r\n');
}

/**
 * Generates XML file for Zucchetti Ad Hoc import
 */
export function generateZucchettiAdHocXml(reports: WorkReport[]): string {
  const escapeXml = (str?: string) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const items = reports
    .map(
      (r) => `    <Lavorazione>
      <NumeroRapporto>${escapeXml(r.reportNumber)}</NumeroRapporto>
      <Data>${escapeXml(r.date)}</Data>
      <CodiceCliente>${escapeXml(r.customerCode)}</CodiceCliente>
      <RagioneSociale>${escapeXml(r.customerName)}</RagioneSociale>
      <PartitaIva>${escapeXml(r.customerVat)}</PartitaIva>
      <TipoAttivita>${escapeXml(r.activityType)}</TipoAttivita>
      <OreLavorate>${r.hoursWorked !== undefined ? r.hoursWorked : 0}</OreLavorate>
      <DescrizioneAttivita>${escapeXml(r.description)}</DescrizioneAttivita>
      <Tecnico>${escapeXml(r.technician)}</Tecnico>
      <RiferimentoCommessa>${escapeXml(r.jobReference)}</RiferimentoCommessa>
      <Stato>${escapeXml(r.status)}</Stato>
      <NoteIntervento>${escapeXml(r.notes)}</NoteIntervento>
    </Lavorazione>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ZucchettiAdHocImport>
  <Meta>
    <Applicativo>Zucchetti Ad Hoc Revolution / Enterprise</Applicativo>
    <TipoDocumento>Rapportini Lavorazione IT</TipoDocumento>
    <GeneratoDa>IO-IT Assistente Tecnico</GeneratoDa>
    <DataExport>${new Date().toISOString()}</DataExport>
    <TotaleLavorazioni>${reports.length}</TotaleLavorazioni>
  </Meta>
  <Lavorazioni>
${items}
  </Lavorazioni>
</ZucchettiAdHocImport>`;
}

/**
 * Helper to download text file with UTF-8 BOM so Excel and Zucchetti Windows importers
 * correctly open accented Italian characters without mojibake.
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([bom, content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
