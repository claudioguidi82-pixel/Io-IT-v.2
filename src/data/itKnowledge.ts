import { CommandItem, DictionaryTerm, WirePin, NoteItem, NetworkAuditItem } from '../types';


export const T568B_PINS: WirePin[] = [
  { pin: 1, colorName: 'Bianco-Arancio', bgClass: 'bg-orange-500', isStripe: true, stripeColor: '#ffffff', functionDesc: 'Tx+ (Trasmissione dati)', pair: 2 },
  { pin: 2, colorName: 'Arancio', bgClass: 'bg-orange-500', isStripe: false, functionDesc: 'Tx- (Trasmissione dati)', pair: 2 },
  { pin: 3, colorName: 'Bianco-Verde', bgClass: 'bg-emerald-500', isStripe: true, stripeColor: '#ffffff', functionDesc: 'Rx+ (Ricezione dati)', pair: 3 },
  { pin: 4, colorName: 'Blu', bgClass: 'bg-blue-600', isStripe: false, functionDesc: 'PoE 48V / Dati 1Gbps', pair: 1 },
  { pin: 5, colorName: 'Bianco-Blu', bgClass: 'bg-blue-600', isStripe: true, stripeColor: '#ffffff', functionDesc: 'PoE 48V / Dati 1Gbps', pair: 1 },
  { pin: 6, colorName: 'Verde', bgClass: 'bg-emerald-500', isStripe: false, functionDesc: 'Rx- (Ricezione dati)', pair: 3 },
  { pin: 7, colorName: 'Bianco-Marrone', bgClass: 'bg-amber-900', isStripe: true, stripeColor: '#ffffff', functionDesc: 'PoE Massa / Dati 1Gbps', pair: 4 },
  { pin: 8, colorName: 'Marrone', bgClass: 'bg-amber-900', isStripe: false, functionDesc: 'PoE Massa / Dati 1Gbps', pair: 4 },
];

export const T568A_PINS: WirePin[] = [
  { pin: 1, colorName: 'Bianco-Verde', bgClass: 'bg-emerald-500', isStripe: true, stripeColor: '#ffffff', functionDesc: 'Rx+ (Ricezione dati)', pair: 3 },
  { pin: 2, colorName: 'Verde', bgClass: 'bg-emerald-500', isStripe: false, functionDesc: 'Rx- (Ricezione dati)', pair: 3 },
  { pin: 3, colorName: 'Bianco-Arancio', bgClass: 'bg-orange-500', isStripe: true, stripeColor: '#ffffff', functionDesc: 'Tx+ (Trasmissione dati)', pair: 2 },
  { pin: 4, colorName: 'Blu', bgClass: 'bg-blue-600', isStripe: false, functionDesc: 'PoE 48V / Dati 1Gbps', pair: 1 },
  { pin: 5, colorName: 'Bianco-Blu', bgClass: 'bg-blue-600', isStripe: true, stripeColor: '#ffffff', functionDesc: 'PoE 48V / Dati 1Gbps', pair: 1 },
  { pin: 6, colorName: 'Arancio', bgClass: 'bg-orange-500', isStripe: false, functionDesc: 'Tx- (Trasmissione dati)', pair: 2 },
  { pin: 7, colorName: 'Bianco-Marrone', bgClass: 'bg-amber-900', isStripe: true, stripeColor: '#ffffff', functionDesc: 'PoE Massa / Dati 1Gbps', pair: 4 },
  { pin: 8, colorName: 'Marrone', bgClass: 'bg-amber-900', isStripe: false, functionDesc: 'PoE Massa / Dati 1Gbps', pair: 4 },
];

export const SAVIOR_COMMANDS: CommandItem[] = [
  {
    id: 'cmd-ipall',
    cmd: 'ipconfig /all',
    type: 'cmd',
    title: 'Dettagli completi schede di rete',
    category: 'Rete',
    description: 'Mostra Indirizzo IP, Subnet Mask, Gateway predefinito, Server DNS, DHCP abilitato e MAC address fisico di tutte le schede di rete.',
  },
  {
    id: 'cmd-flushdns',
    cmd: 'ipconfig /flushdns',
    type: 'cmd',
    title: 'Svuota cache di risoluzione DNS',
    category: 'Rete',
    description: 'Cancella la cache dei nomi DNS memorizzati da Windows. Risolve i problemi quando un server o sito ha cambiato IP ma il PC continua a contattare il vecchio.',
  },
  {
    id: 'cmd-renew',
    cmd: 'ipconfig /release && ipconfig /renew',
    type: 'cmd',
    title: 'Rilascia e rinnova lease DHCP',
    category: 'Rete',
    description: 'Forza il rilascio dell\'IP attuale e richiede un nuovo lease al router o server DHCP.',
  },
  {
    id: 'cmd-tnet',
    cmd: 'Test-NetConnection -ComputerName 192.168.1.1 -Port 80',
    type: 'powershell',
    title: 'Verifica porta aperta / Telnet moderno',
    category: 'Rete',
    description: 'Sostituisce il vecchio client Telnet. Verifica in PowerShell se una porta TCP (es. 80, 443, 3389, 5060) risponde su un host remoto.',
    example: 'Test-NetConnection srv-zucchetti -Port 8080',
  },
  {
    id: 'cmd-netstat',
    cmd: 'netstat -ano | findstr :PORTA',
    type: 'cmd',
    title: 'Individua processo su porta TCP',
    category: 'Diagnostica',
    description: 'Mostra quale PID (Process ID) sta occupando una determinata porta di rete (es. :80, :8080, :5060).',
    example: 'netstat -ano | findstr :8080',
  },
  {
    id: 'cmd-gpupdate',
    cmd: 'gpupdate /force',
    type: 'cmd',
    title: 'Aggiorna criteri di gruppo Active Directory',
    category: 'Dominio',
    description: 'Forza l\'applicazione immediata di tutte le GPO (Group Policy Object) utente e computer senza dover riavviare.',
  },
  {
    id: 'cmd-dsa',
    cmd: 'dsa.msc',
    type: 'msc',
    title: 'Utenti e computer di Active Directory',
    category: 'Dominio',
    description: 'Apre la console MMC per la gestione degli utenti, gruppi, computer e reset password di dominio su Windows Server.',
  },
  {
    id: 'cmd-netuse',
    cmd: 'net use',
    type: 'cmd',
    title: 'Stato cartelle condivise e dischi di rete',
    category: 'Rete',
    description: 'Elenca tutte le unità di rete mappate (es. Z:, Y:), il loro stato di connessione e il percorso UNC del server file.',
  },
  {
    id: 'cmd-spooler-reset',
    cmd: 'net stop spooler && del /Q /F /S "%systemroot%\\System32\\Spool\\Printers\\*.*" && net start spooler',
    type: 'cmd',
    title: 'Azzeramento forzato Spooler di Stampa',
    category: 'Sistema',
    description: 'Ferma il servizio spooler, elimina tutti i file di stampa corrotti o bloccati nella coda di Windows e riavvia il servizio.',
  },
  {
    id: 'cmd-services',
    cmd: 'services.msc',
    type: 'msc',
    title: 'Console Gestione Servizi Windows',
    category: 'Sistema',
    description: 'Apre la lista di tutti i servizi in background (Tomcat, SQL Server, 3CX SBC, Spooler, ecc.) per avvio, arresto e tipo di avvio.',
  },
  {
    id: 'cmd-diskmgmt',
    cmd: 'diskmgmt.msc',
    type: 'msc',
    title: 'Gestione Disco e Partizioni',
    category: 'Storage',
    description: 'Visualizza e formatta unità interne, dischi esterni USB, estende volumi o cambia lettere di unità.',
  },
  {
    id: 'cmd-sfc',
    cmd: 'sfc /scannow',
    type: 'cmd',
    title: 'Verifica integrità file di sistema Windows',
    category: 'Diagnostica',
    description: 'Scansiona l\'integrità di tutti i file di sistema protetti e ripara i file danneggiati estraendoli dalla copia cache.',
  },
  {
    id: 'cmd-tracert',
    cmd: 'tracert 8.8.8.8',
    type: 'cmd',
    title: 'Tracciamento instradamento pacchetti (Hop)',
    category: 'Rete',
    description: 'Mostra ogni singolo router (hop) attraversato dal pacchetto per raggiungere la destinazione, individuando dove cade la linea.',
  },
];

export const IT_DICTIONARY: DictionaryTerm[] = [
  {
    term: 'DHCP (Dynamic Host Config Protocol)',
    shortDesc: 'Assegna in automatico gli indirizzi IP e parametri di rete ai client.',
    fullDesc: 'Server di rete che distribuisce automaticamente ai dispositivi (PC, smartphone, stampanti) l\'indirizzo IP, la subnet mask, il gateway e i server DNS con un tempo di validità detto "lease".',
    category: 'Reti',
  },
  {
    term: 'DNS (Domain Name System)',
    shortDesc: 'Traduce i nomi simbolici (es. google.it o srv-zucchetti) in indirizzi IP.',
    fullDesc: 'La rubrica telefonica di Internet e della rete locale. Se il DNS non risponde, i dispositivi riescono a pingare gli IP numerici (es. 8.8.8.8) ma non navigano e non trovano i server aziendali.',
    category: 'Reti',
  },
  {
    term: 'PoE (Power over Ethernet - 802.3af/at/bt)',
    shortDesc: 'Alimenta dispositivi di rete (telefoni VoIP, AP Wi-Fi, telecamere) tramite il cavo dati RJ45.',
    fullDesc: 'Evita l\'alimentatore separato. Lo standard 802.3af eroga fino a 15.4W (sufficiente per telefoni 3CX Yealink/Fanvil), 802.3at (PoE+) fino a 30W (AP Wi-Fi 6), 802.3bt fino a 90W.',
    category: 'Hardware',
  },
  {
    term: '3CX SBC (Session Border Controller)',
    shortDesc: 'Dispositivo/software locale che collega in modo sicuro i telefoni interni al centralino 3CX Cloud.',
    fullDesc: 'Installato su un PC o Raspberry nella sede cliente, raggruppa tutto il traffico SIP e audio RTP su una singola porta crittografata (tunnel) verso il 3CX in cloud, superando i blocchi NAT e firewall dei router senza aprire porte.',
    category: 'VoIP',
  },
  {
    term: 'VLAN (Virtual Local Area Network)',
    shortDesc: 'Separa virtualmente il traffico di diversi reparti o dispositivi sullo stesso switch.',
    fullDesc: 'Permette di isolare la rete PC Ufficio dalla rete Telefonia VoIP (Voice VLAN) e dalla rete Ospiti (Guest), garantendo sicurezza, QoS e priorità ai pacchetti voce.',
    category: 'Reti',
  },
  {
    term: 'APIPA (Automatic Private IP Addressing - 169.254.x.x)',
    shortDesc: 'Indirizzo temporaneo autogenerato da Windows quando il DHCP non risponde.',
    fullDesc: 'Se un PC mostra un IP che inizia per 169.254, significa che il cavo o il Wi-Fi sono collegati a livello fisico ma nessun server DHCP risponde (cavo danneggiato, switch su porta disattivata, pool IP esaurito).',
    category: 'Reti',
  },
  {
    term: 'SIP ALG (Application-Level Gateway)',
    shortDesc: 'Funzione dannosa presente su molti router che modifica i pacchetti SIP.',
    fullDesc: 'Su quasi tutti i router commerciali (FritzBox, Zyxel, modem operatori) altera le intestazioni SIP causando audio monodirezionale, telefoni che non squillano o disconnessioni 3CX. Va SEMPRE disattivata.',
    category: 'VoIP',
  },
  {
    term: 'RTP (Real-time Transport Protocol)',
    shortDesc: 'Protocollo UDP utilizzato per il flusso voce/audio effettivo durante una chiamata VoIP.',
    fullDesc: 'Mentre il protocollo SIP (porta 5060) serve solo a far squillare e agganciare la chiamata, la voce viaggia su pacchetti RTP (su 3CX normalmente porte UDP 9000-10999).',
    category: 'VoIP',
  },
  {
    term: 'RDS (Remote Desktop Services)',
    shortDesc: 'Ambiente Terminal Server multi-utente per far lavorare gli utenti sui programmi aziendali.',
    fullDesc: 'Server centrale su cui decine di utenti si collegano via RDP per usare Ad Hoc Zucchetti o Microsoft Office. Se un utente crasha o si disconnette, il processo rimane appeso e deve essere terminato da Gestione Attività.',
    category: 'Windows',
  },
  {
    term: 'Percorso UNC (Universal Naming Convention)',
    shortDesc: 'Formato standard per accedere a risorse condivise di rete: \\\\server\\cartella',
    fullDesc: 'Permette di puntare a file e stampanti tramite nome host o IP anziché tramite lettera disco locale. Esempio: \\\\192.168.1.10\\ZucchettiDati o \\\\srv-ad\\Condivisa.',
    category: 'Reti',
  },
  {
    term: 'WSD (Web Services for Devices)',
    shortDesc: 'Protocollo automatico Microsoft per le stampanti, spesso inaffidabile in azienda.',
    fullDesc: 'Windows tenta di installare le stampanti via WSD. Quando il router o la stampante vanno in standby o cambiano IP, la coda va offline. I tecnici esperti creano sempre una porta Standard TCP/IP con IP fisso.',
    category: 'Hardware',
  },
  {
    term: 'FQDN (Fully Qualified Domain Name)',
    shortDesc: 'Nome di dominio completo e non ambiguo di un computer o host nella rete.',
    fullDesc: 'Comprende il nome macchina e il dominio (es. centralino.azienda.3cx.it o srv-dc01.lan.locale), essenziale per certificati SSL e risoluzione corretta.',
    category: 'Reti',
  },
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Stampante HP non stampava dopo blackout: errore WSD',
    category: 'hardware',
    clientRef: 'Studio Commercialisti Rossi',
    solution: `La stampante HP LaserJet risultava 'Non in linea' sui PC dei dipendenti.
1. Ho fatto ping verso 192.168.1.200 e rispondeva regolarmente.
2. Nelle proprietà della stampante ho notato che usava una porta WSD.
3. Ho aggiunto una porta 'Standard TCP/IP' con IP fisso 192.168.1.200 (porta 9100 RAW).
4. Su CMD amministratore ho riavviato lo spooler: net stop spooler && net start spooler.
Risolto istantaneamente per tutti i client.`,
    createdAt: '2026-10-20 11:30',
    tags: ['HP', 'WSD', 'TCP/IP', 'Spooler'],
  },
  {
    id: 'note-2',
    title: 'Telefoni Yealink T46U "No Service" in filiale',
    category: '3cx',
    clientRef: 'Filiale Logistica Sud',
    solution: `Tutti i telefoni dell'ufficio mostravano No Service contemporaneamente.
1. Il centralino 3CX in Cloud era funzionante (gli utenti su smartphone ricevevano chiamate).
2. Ho controllato in console 3CX: lo stato del 3CX SBC della filiale era ROSSO (Offline).
3. Il mini-PC Linux locale dell'SBC si era riavviato ma il servizio 3cxsbc era andato in crash.
4. Accesso SSH -> sudo systemctl restart 3cxsbc.
5. In 15 secondi l'SBC è tornato verde e tutti i telefoni Yealink si sono registrati.`,
    createdAt: '2026-10-22 16:45',
    tags: ['3CX', 'SBC', 'Yealink', 'VoIP'],
  },
  {
    id: 'note-3',
    title: 'Zucchetti Ad Hoc: Utente bloccato su bolla d\'uscita',
    category: 'zucchetti',
    clientRef: 'Officine Meccaniche Nord',
    solution: `L'utente Anna riceveva 'Errore: Documento in uso da un altro utente' anche dopo aver riavviato il proprio PC.
1. La sessione era rimasta attiva sul Server Terminal (RDS).
2. Sul server RDS ho aperto Gestione Attività -> Scheda Utenti -> Utente Anna (risultava Disconnesso).
3. Ho espanso e terminato il processo adhoc.exe rimasto congelato in memoria.
4. L'utente ha potuto rientrare subito e la bolla è stata sbloccata senza perdite di dati.`,
    createdAt: '2026-10-24 09:15',
    tags: ['Zucchetti', 'Ad Hoc', 'RDS', 'Lock'],
  },
];

export const INITIAL_NETWORK_AUDITS: NetworkAuditItem[] = [
  {
    id: 'net-audit-01',
    clientName: 'Studio Commercialisti Rossi & Partner',
    location: 'Milano (MI) - Via Dante 14',
    networkType: 'Studio Professionale',
    subnet: '192.168.10.0/24',
    gateway: '192.168.10.1',
    dnsPrimary: '192.168.10.2 (SRV-DC01)',
    dnsSecondary: '1.1.1.1 (Cloudflare)',
    dhcpRange: '192.168.10.100 - 192.168.10.220',
    ispInfo: 'TIM FTTH 1000/300 Mbps - IP Pubblico Statico 82.112.44.xx',
    firewallRouter: 'FortiGate 40F (Firmware v7.2.5)',
    switches: 'Ubiquiti UniFi USW-24-PoE Gen2',
    vlans: [
      { id: 10, name: 'VLAN_DATI', subnet: '192.168.10.0/24', purpose: 'PC Studio & Server Zucchetti' },
      { id: 20, name: 'VLAN_VOIP', subnet: '192.168.20.0/24', purpose: 'Telefoni 3CX Yealink T46U (QoS DSCP 46)' },
      { id: 30, name: 'VLAN_GUEST', subnet: '192.168.30.0/24', purpose: 'Wi-Fi Clienti Isolato (No LAN Access)' },
    ],
    avgLatencyMs: 8.4,
    packetLossPercent: 0.0,
    status: 'conforme',
    keyFindings: 'Tutti i 14 PC e telefoni VoIP 3CX sono isolati correttamente su VLAN separate. Server Zucchetti raggiungibile con MTU 1500 e DNS interno attivo.',
    resolutionNotes: 'Disattivato SIP ALG su FortiGate per eliminare audio intermittente. Prenotato IP DHCP per 2 stampanti multifunzione Kyocera.',
    analyzedAt: '2026-10-23 15:30',
  },
  {
    id: 'net-audit-02',
    clientName: 'Logistica & Magazzini Brambilla S.r.l.',
    location: 'Bologna Interporto (BO)',
    networkType: 'Magazzino / Logistica',
    subnet: '10.50.0.0/23',
    gateway: '10.50.0.1',
    dnsPrimary: '10.50.0.2',
    dnsSecondary: '8.8.8.8',
    dhcpRange: '10.50.0.100 - 10.50.1.200 (Pool esteso per terminali)',
    ispInfo: 'Fastweb GigaBusiness 1 Gbps Simmetrico + Backup 4G LTE su WAN2',
    firewallRouter: 'pfSense Netgate 4100 Dual-WAN',
    switches: '2x Cisco Catalyst 2960X 48-PoE stack + 8x AP UniFi U6-LongRange',
    vlans: [
      { id: 1, name: 'DEFAULT_LAN', subnet: '10.50.0.0/23', purpose: 'Uffici e Server Logistica WMS' },
      { id: 50, name: 'BARCODE_WIFI', subnet: '10.50.50.0/24', purpose: 'Terminali Zebra Pistole Barcode Wi-Fi' },
      { id: 99, name: 'MGMT_APPARATI', subnet: '10.50.99.0/24', purpose: 'Accesso SSH/HTTPS a Switch e AP' },
    ],
    avgLatencyMs: 14.2,
    packetLossPercent: 0.2,
    status: 'warning',
    keyFindings: 'Canale Wi-Fi 2.4GHz saturo nell\'area corsia 4 del magazzino a causa di interferenze metalliche. Due pistole barcode perdevano la sessione Telnet WMS.',
    resolutionNotes: 'Riassegnati canali Wi-Fi manuali (1, 6, 11) con potenza ridotta per favorire il fast-roaming 802.11r/k. Aggiunto 1 AP UniFi PoE al centro campata.',
    analyzedAt: '2026-10-21 11:15',
  },
  {
    id: 'net-audit-03',
    clientName: 'Officina & Carpenteria Meccanica Nord',
    location: 'Brescia (BS) - Zona Industriale',
    networkType: 'Industriale',
    subnet: '192.168.1.0/24',
    gateway: '192.168.1.1',
    dnsPrimary: '192.168.1.1 (FritzBox)',
    dnsSecondary: '8.8.8.8',
    dhcpRange: '192.168.1.20 - 192.168.1.200',
    ispInfo: 'Vodafone FTTC 100/20 Mbps VDSL2',
    firewallRouter: 'AVM FRITZ!Box 7590',
    switches: 'Switch Desktop 16p D-Link Unmanaged (da sostituire)',
    vlans: [],
    avgLatencyMs: 38.6,
    packetLossPercent: 2.4,
    status: 'critico',
    keyFindings: 'Rete non segmentata. PC ufficio, macchine CNC a controllo numerico e Wi-Fi ospiti condividono lo stesso dominio di broadcast. Rilevato loop di rete dovuto a cavo doppio collegato per errore.',
    resolutionNotes: 'Rimosso cavo in loop che causava tempesta di broadcast. Preventivata installazione switch gestito con VLAN e firewall pfSense dedicato.',
    analyzedAt: '2026-10-18 17:40',
  },
];

