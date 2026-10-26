import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const apiKey = process.env.GEMINI_API_KEY;
const isRealApiKey = Boolean(
  apiKey &&
  apiKey !== 'MY_GEMINI_API_KEY' &&
  apiKey.trim().length > 15 &&
  !apiKey.includes('MY_GEMINI')
);

const ai = isRealApiKey
  ? new GoogleGenAI({
      apiKey: apiKey!,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

app.use(express.json({ limit: '10mb' }));

// Health / status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    aiEnabled: !!ai,
    model: 'gemini-3.8-flash',
    platform: 'io IT Senior Engine',
  });
});

// Ookla-style Speedtest Endpoints
// 1. Ping / Latency & Jitter test
app.get('/api/speedtest/ping', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.json({
    timestamp: Date.now(),
    server: 'io IT Test Node (Milano / Cloud)',
  });
});

// 2. Download throughput test
app.get('/api/speedtest/download', (req, res) => {
  const sizeMb = Math.min(Math.max(parseInt((req.query.size as string) || '4', 10), 1), 20);
  const totalBytes = sizeMb * 1024 * 1024;
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Content-Length', totalBytes.toString());

  // Generate 64KB chunk
  const chunkSize = 64 * 1024;
  const buffer = Buffer.alloc(chunkSize, 'A');
  const numChunks = Math.floor(totalBytes / chunkSize);

  for (let i = 0; i < numChunks; i++) {
    res.write(buffer);
  }
  res.end();
});

// 3. Upload throughput test
app.post('/api/speedtest/upload', express.raw({ type: '*/*', limit: '25mb' }), (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache');
  const bytes = req.body ? req.body.length : 0;
  res.json({
    status: 'ok',
    bytesReceived: bytes,
    timestamp: Date.now(),
  });
});

// Advanced Fallback IT Knowledge Engine (Deep Enterprise Level)
function getFallbackItResponse(query: string): string {
  const low = query.toLowerCase();

  if (low.includes('3cx') || low.includes('telefono') || low.includes('voip') || low.includes('sbc') || low.includes('yealink') || low.includes('fanvil') || low.includes('snom')) {
    return `### 🔬 1. Architettura & Causa Radice (VoIP / 3CX)
L'anomalia **"No Service"** o mancata registrazione SIP deriva tipicamente da:
- **Corruzione pacchetti SIP:** Il router/firewall locale ha **SIP ALG (Application Layer Gateway)** attivo, che manipola gli header SDP e riscrive erroneamente gli IP privati nei messaggi \`REGISTER\` e \`INVITE\`.
- **Blacklist IP di Sicurezza 3CX:** Dopo 5-10 tentativi falliti con credenziali SIP o password non sincronizzate, il firewall integrato di 3CX inserisce l'IP pubblico dell'ufficio nella tabella \`IP Blacklist\` per 24 ore.
- **Caduta del tunnel 3CX SBC:** Se i telefoni passano tramite Session Border Controller locale, un blocco del servizio systemd (\`3cxsbc\`) o timeout UDP porta 5090 impedisce il routing sicuro verso il PBX cloud.

### 🔍 2. Diagnostica Rigorosa & Triage Pre-Fix
Esegui questi controlli strumentali prima di procedere:
1. **Verifica stato SBC locale (Linux Debian / Raspberry):**
\`\`\`bash
systemctl status 3cxsbc -l
journalctl -u 3cxsbc -n 50 --no-pager
\`\`\`
2. **Test raggiungibilità PBX Cloud su porta Tunnel & SIP:**
\`\`\`powershell
Test-NetConnection -ComputerName "tuopbx.3cx.it" -Port 5090
Test-NetConnection -ComputerName "tuopbx.3cx.it" -Port 5060
\`\`\`
3. **Controllo Blacklist in Console 3CX:**
Accedi a *Console di Gestione 3CX → Sicurezza → IP Blacklist*. Cerca l'IP pubblico del router della sede cliente. Se presente con motivo *"Too many failed authentications"*, selezionalo e clicca **Consenti (Aggiungi a Whitelist permanente)**.

### ⚙️ 3. Procedura Operativa di Risoluzione
1. **Disabilitazione Tassativa SIP ALG sul Router:**
   - Accedi al router/firewall aziendale (FritzBox, FortiGate, Zyxel, Mikrotik).
   - Su **FortiGate (CLI)**:
\`\`\`fortinet
config system settings
set sip-helper disable
set sip-nat-trace disable
end
config system session-helper
delete 13
end
\`\`\`
   - Su **MikroTik**: \`/ip firewall service-port disable sip\`
2. **Sblocco e Provisioning Telefono Fisico:**
   - In 3CX Management Console: *Utenti → Seleziona Interno → Provisioning Telefono*.
   - Seleziona *Metodo di provisioning: 3CX SBC (remoto)* e inserisci l'IP locale della macchina SBC.
   - Forzare re-provisioning: riavvia il telefono o premi il tasto *Re-provision* dalla console 3CX.
3. **Hard Reset Yealink (se non aggancia i parametri):**
   - Tieni premuto il tasto **OK** sul telefono per 10 secondi fino al messaggio *"Reset to factory defaults?"* e premi OK. Il telefono richiederà nuovamente l'URL di provisioning tramite opzione DHCP 66 o PnP.

### 🛡️ 4. Hardening, Prevenzione Permanente & Monitoraggio
- **Regole Firewall in Uscita:** Garantisci uscita UDP illimitata verso l'FQDN del 3CX per porte:
  - \`5090 UDP/TCP\` (3CX Tunnel & SBC)
  - \`5001 TCP\` o \`443 TCP\` (HTTPS Provisioning & Web Client)
  - \`9000-10999 UDP\` (Media stream RTP audio/video bidirezionale)
- **Assegnazione IP statico e DHCP Option 66:** Riserva l'IP del telefono sul server DHCP basandoti sul MAC Address per evitare rinegoziazioni di lease in orari di picco telefonico.

### 💡 5. Verdetto & Best Practice Specialistica IO-IT
Se l'audio è monodirezionale (un interlocutore non sente), la causa al 99% è il mancato transito del range RTP (9000-10999 UDP) su router intermedi con NAT simmetrico. Evita configurazioni STUN dirette per uffici con più di 2 telefoni: implementa sempre un'istanza dedicata **3CX SBC**.`;
  }

  if (low.includes('zucchetti') || low.includes('infinity') || low.includes('ad hoc') || low.includes('paghe') || low.includes('hr') || low.includes('tomcat')) {
    return `### 🔬 1. Architettura & Causa Radice (Ambiente ERP Zucchetti)
I blocchi e gli errori di sessione in ambiente Zucchetti (Ad Hoc Revolution, Infinity DMS, HR Portal, Paghe Web) avvengono tipicamente per:
- **Lock a Livello Record/Transazione nel Database (MSSQL / PostgreSQL):** Una sessione RDS o client terminata bruscamente lascia un lock esclusivo su righe di tabelle critiche (es. \`DMS_DOC\`, \`MAG_DOC\`, lock di fatturazione o commessa).
- **Starvation Pool Connessioni Tomcat / DBCP:** Il web server Tomcat esaurisce il pool di connessioni JDBC verso SQL Server (\`maxTotal / maxActive\` raggiunto), rispondendo con errore HTTP 500, pagina bianca o timeout.
- **Processi orfani Ad Hoc su Terminal Server (RDS):** I client disconnessi mantengono \`adhoc.exe\` attivo con handle aperti sui file di configurazione (\`.ini\`) e sulle directory temporanee dell'utente.

### 🔍 2. Diagnostica Rigorosa & Triage Pre-Fix
1. **Identificazione Processi Orfani su Server RDS (PowerShell Admin):**
\`\`\`powershell
Get-Process -Name adhoc, adhocrevolution -ErrorAction SilentlyContinue | 
  Select-Object Id, ProcessName, WS, Handles, StartTime | Format-Table -AutoSize
\`\`\`
2. **Verifica Stato Servizio Apache Tomcat & Database Engine:**
\`\`\`powershell
Get-Service -Name *tomcat*, *zucchetti*, *mssql* | 
  Select-Object Name, DisplayName, Status, StartType
\`\`\`
3. **Query Diagnosi Lock Database SQL Server (SSMS):**
\`\`\`sql
SELECT request_session_id, resource_type, resource_description, request_mode, request_status 
FROM sys.dm_tran_locks 
WHERE resource_type <> 'DATABASE';
\`\`\`

### ⚙️ 3. Procedura Operativa di Risoluzione
1. **Sblocco Forzato Sessione da Portale Amministrativo (Infinity / HR Portal):**
   - Accedi al portale con credenziali di Amministratore di Sistema.
   - Naviga in: *Pannello di Controllo → Amministrazione del Sistema → Monitoraggio Sessioni / Utenti Connessi*.
   - Individua l'utente nello stato *"Inattivo"* o bloccato e clicca **Termina Sessione Forzata**.
2. **Terminazione Processi Zombie su Server RDS (CMD da Amministratore):**
\`\`\`cmd
taskkill /F /IM adhoc.exe /T
taskkill /F /IM crw32.exe /T
\`\`\`
   *(Nota: \`crw32.exe\` è il motore di Crystal Reports che spesso causa il freeze durante la generazione di stampe e PDF).*
3. **Pulizia Cache & Temp Server/Client:**
\`\`\`cmd
del /Q /F /S "%temp%\\~*.*"
del /Q /F /S "%temp%\\*.tmp"
\`\`\`
4. **Riavvio Controllato del Servizio Tomcat (se portale web non risponde):**
\`\`\`powershell
Restart-Service -Name "Tomcat9" -Force
\`\`\`

### 🛡️ 4. Hardening, Prevenzione Permanente & Monitoraggio
- **Ottimizzazione Memoria JVM Tomcat:** In \`Tomcat/bin/tomcat9w.exe\` (scheda Java), imposta la memoria Heap iniziale (\`-Xms\`) a 2048 MB e la massima (\`-Xmx\`) ad almeno 4096 MB (o 50% della RAM disponibile).
- **Timeout Disconnessione Sessioni RDS:** Configura via GPO (*Criteri Computer → Modelli Amministrativi → Componenti di Windows → Servizi Desktop Remoto → Host sessione Desktop remoto → Limiti di tempo sessione*) la chiusura automatica delle sessioni disconnesse dopo 30 minuti.

### 💡 5. Verdetto & Best Practice Specialistica IO-IT
Se l'errore compare su più postazioni contemporaneamente, non forzare riavvii sui singoli client: il collo di bottiglia è al 100% il pool JDBC di Tomcat o lo spazio disco su \`C:\` del server per saturazione dei log \`catalina.out\`. Imposta una rotazione log giornaliera per prevenire il freeze del disco di sistema.`;
  }

  if (low.includes('stampante') || low.includes('spooler') || low.includes('stampa') || low.includes('driver') || low.includes('wsd')) {
    return `### 🔬 1. Architettura & Causa Radice (Windows Print Spooler & WSD)
I blocchi di stampa nelle reti aziendali sono originati da:
- **Porte WSD (Web Services for Devices):** Windows 10/11 converte per impostazione predefinita le stampanti in porte WSD. Al risveglio dallo standby energetico, il protocollo multicast WS-Discovery non ristabilisce l'handshake e la stampante risulta perennemente "Offline".
- **Corruzione Coda Spooler (\`C:\\Windows\\System32\\Spool\\PRINTERS\`):** Un documento contenente codice PostScript/PCL malformato blocca il thread del servizio \`spoolsv.exe\`. Lo spooler tenta all'infinito di processare il file \`.SHD\` (Shadow Job) e \`.SPL\` (Spool File), mandando in stallo tutti i lavori successivi.
- **Conflitti Driver Type 3 vs Type 4:** Driver isolati male causano crash a cascata nel gestore delle code.

### 🔍 2. Diagnostica Rigorosa & Triage Pre-Fix
1. **Verifica Eventi Crash Spooler nel Visualizzatore Eventi:**
\`\`\`powershell
Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='Service Control Manager'; Id=7031,7034} -MaxEvents 5 | Format-List
\`\`\`
2. **Verifica Porta Attuale Assegnata alla Stampante:**
\`\`\`powershell
Get-Printer | Select-Object Name, PortName, DriverName, Shared, JobCount
\`\`\`
*(Se la colonna \`PortName\` inizia con \`WSD-\`, la stampante è soggetta a disconnessioni ricorrenti).*

### ⚙️ 3. Procedura Operativa di Risoluzione
1. **Procedura Deep-Clean Spooler di Stampa (CMD Amministratore):**
\`\`\`cmd
net stop spooler
taskkill /F /IM spoolsv.exe
del /Q /F /S "%systemroot%\\System32\\Spool\\Printers\\*.*"
net start spooler
\`\`\`
2. **Conversione Definitiva da Porta WSD a Porta Standard TCP/IP:**
   - Apri *Esegui (\`Win + R\`)* → digita \`control printers\`.
   - Clic destro sulla stampante → *Proprietà stampante* (NON Proprietà dispositivo) → scheda **Porte**.
   - Clicca **Aggiungi porta...** → Seleziona **Standard TCP/IP Port** → Clicca **Nuova porta...**.
   - Inserisci l'indirizzo IP statico o prenotato DHCP della stampante (es. \`192.168.1.200\`).
   - Disabilita la casella *"Attiva stato SNMP"* nelle impostazioni della porta per evitare falsi allarmi offline dovuti a firewall.
3. **Isolamento Processo Driver (Previene crash dello Spooler):**
\`\`\`powershell
Set-Printer -Name "NomeStampante" -DriverName "NomeDriver" -IsolateDriver $true
\`\`\`

### 🛡️ 4. Hardening, Prevenzione Permanente & Monitoraggio
- Assegna sempre una prenotazione DHCP basata su MAC Address o IP statico al di fuori del pool DHCP dinamico per tutte le stampanti e multifunzione di rete.
- Prediligi driver ufficiali **Type 4 PCL6** o driver universali (es. HP UPD, Kyocera KX Driver, Ricoh PCL6 Universal) evitando driver integrati di Windows Update.

### 💡 5. Verdetto & Best Practice Specialistica IO-IT
Non reinstallare il driver se la stampante non stampa: converti subito la porta in **Standard TCP/IP (porta 9100 Raw)** e svuota la directory \`Spool\\PRINTERS\`. Nel 95% dei casi il disservizio si risolve all'istante senza riavviare il sistema operativo del server.`;
  }

  if (low.includes('169.254') || low.includes('apipa') || low.includes('dhcp') || low.includes('ip') || low.includes('rete') || low.includes('wifi') || low.includes('dns')) {
    return `### 🔬 1. Architettura & Causa Radice (Stack IP & Fallimento DHCP)
Quando un'interfaccia di rete riceve un indirizzo \`169.254.x.x\` con maschera \`/16\` (\`255.255.0.0\`), è intervenuto il meccanismo **APIPA (Automatic Private IP Addressing)**:
- Il client ha inviato 4 messaggi broadcast di \`DHCPDISCOVER\` (UDP 67/68) senza ricevere alcun \`DHCPOFFER\` entro il timeout previsto (circa 60 secondi).
- Cause frequenti: Switch loop con intervento Spanning Tree Protocol (STP che blocca la porta in stato Listening/Learning troppo a lungo), esaurimento dello scope DHCP sul server, mismatch VLAN sulla porta dello switch, oppure cavo di rete con una coppia interrotta (link negoziato solo parzialmente a 10 Mbps Half-Duplex).

### 🔍 2. Diagnostica Rigorosa & Triage Pre-Fix (PowerShell / CMD)
Esegui in sequenza per individuare esattamente il punto di interruzione:
\`\`\`powershell
# 1. Ispezione stato scheda fisica e negoziazione link speed
Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, LinkSpeed, MediaConnectionState

# 2. Verifica rilascio DHCP e lease
Get-NetIPConfiguration

# 3. Test ping isolamento livelli ISO/OSI:
Test-Connection 127.0.0.1 -Count 2    # Livello 3: Stack TCP/IP locale del sistema operativo
Test-Connection 192.168.1.1 -Count 2  # Livello 2/3: Raggiungibilità Gateway aziendale
Test-Connection 8.8.8.8 -Count 2      # Livello 3 WAN: Instradamento Internet IP puro
Resolve-DnsName google.it             # Livello 7: Risoluzione dei nomi DNS
\`\`\`

### ⚙️ 3. Procedura Operativa di Risoluzione
1. **Rilascio e Rinegoziazione Forzata del Lease DHCP:**
\`\`\`cmd
ipconfig /release
ipconfig /flushdns
arp -d *
ipconfig /renew
\`\`\`
2. **Ripristino Completo Winsock e Stack TCP/IP (da CMD Amministratore):**
\`\`\`cmd
netsh winsock reset
netsh int ip reset
\`\`\`
*(Riavvia il computer dopo questo comando per applicare il reset dei cataloghi di rete).*
3. **Verifica Switch Managed e Porte Access / Trunk:**
Se il PC è collegato a uno switch VLAN gestito, verifica che la porta sia configurata come **Untagged / Access** sulla VLAN dati corretta (es. VLAN 10 Dati) e con **PortFast / Edge Port** abilitato per evitare che STP ritardi l'assegnazione DHCP.

### 🛡️ 4. Hardening, Prevenzione Permanente & Monitoraggio
- Su Windows Server DHCP: attiva il controllo di duplicazione indirizzi (*DHCP Conflict Detection Attempts = 2*) per evitare che due dispositivi ricevano lo stesso IP.
- Mantieni sempre una soglia di saturazione del pool DHCP inferiore all'80% per accogliere dispositivi ospiti e smartphone senza bloccare le workstation di lavoro.

### 💡 5. Verdetto & Best Practice Specialistica IO-IT
Se \`ipconfig /renew\` fallisce con l'errore *"Impossibile contattare il server DHCP"*, sposta il cavo su un'altra presa o sostituisci il patch cord prima di formattare o reinstallare i driver della scheda madre: 8 volte su 10 si tratta di una crimpatura difettosa sui pin 1-2 o 3-6.`;
  }

  if (low.includes('server') || low.includes('active directory') || low.includes('domain') || low.includes('gpo') || low.includes('utente') || low.includes('dc')) {
    return `### 🔬 1. Architettura & Causa Radice (Windows Server & Dominio AD DS)
I malfunzionamenti nei servizi di dominio Active Directory (autenticazione lenta, mancata applicazione GPO, trust interrotti) sono causati principalmente da:
- **DNS Server non configurato o disallineato nei client:** I client devono avere come DNS ESCLUSIVAMENTE l'indirizzo IP del Domain Controller. Se viene inserito come DNS secondario un server pubblico (es. \`8.8.8.8\`), le query per i record SRV (\`_ldap._tcp.dc._msdcs.dominio.local\`) falliscono casualmente.
- **Time Skew Kerberos:** Kerberos 5 richiede una tolleranza massima di 300 secondi (5 minuti) tra il client e il PDC Emulator. Se l'orario si scosta oltre tale soglia, i ticket TGT/TGS vengono rifiutati con errore \`KRB_AP_ERR_SKEW\`.
- **Replication Inconsistency tra Domain Controller:** Blocchi di replica su SYSVOL (DFSR) o su partizioni NC di Active Directory.

### 🔍 2. Diagnostica Rigorosa & Triage Pre-Fix (PowerShell / CMD sul Server)
\`\`\`cmd
:: 1. Riepilogo completo stato replica tra tutti i Domain Controller
repadmin /replsummary

:: 2. Test diagnostico approfondito del Domain Controller (DNS, LDAP, Replica)
dcdiag /v /c /q

:: 3. Verifica sincronizzazione oraria con il PDC Emulator
w32tm /query /status

:: 4. Ispezione stato replica cartella SYSVOL (DFSR)
dfsrmig /getglobalstate
\`\`\`

### ⚙️ 3. Procedura Operativa di Risoluzione
1. **Risoluzione Sincronizzazione Oraria (PDC Emulator):**
Sul DC principale con ruolo FSMO PDC Emulator:
\`\`\`cmd
w32tm /config /manualpeerlist:"0.it.pool.ntp.org,0x1 1.it.pool.ntp.org,0x1" /syncfromflags:manual /reliable:yes /update
net stop w32time && net start w32time
w32tm /resync /force
\`\`\`
2. **Forzatura e Diagnosi Criteri di Gruppo (GPO) sui Client:**
\`\`\`cmd
gpupdate /force
gpresult /h C:\\Temp\\gpreport.html
\`\`\`
*(Apri \`gpreport.html\` nel browser per verificare se ci sono GPO rifiutate per autorizzazioni o filtri WMI).*
3. **Sblocco Utente o Modifica Password da PowerShell:**
\`\`\`powershell
# Sblocco account utente bloccato
Unlock-ADAccount -Identity "nome.utente"

# Controllo attributi account
Get-ADUser -Identity "nome.utente" -Properties LockedOut, PasswordExpired, PasswordLastSet
\`\`\`

### 🛡️ 4. Hardening, Prevenzione Permanente & Monitoraggio
- **Ruoli FSMO:** Mantieni i ruoli FSMO assegnati in modo stabile e verifica regolarmente con \`netdom query fsmo\`.
- **Backup System State:** Esegui backup programmato del System State del Domain Controller con Windows Server Backup (\`wbadmin\`) o Veeam Backup & Replication con elaborazione application-aware abilitata.

### 💡 5. Verdetto & Best Practice Specialistica IO-IT
Regola aurea di Active Directory: *Se non funziona AD, nel 99% dei casi il colpevole è il DNS*. Non impostare mai 8.8.8.8 o 1.1.1.1 sulla scheda di rete dei client di dominio: imposta i DNS dei Domain Controller locali e configura i server pubblici unicamente come Forwarder (Inoltratori) all'interno della console DNS del server.`;
  }

  if (low.includes('rj45') || low.includes('cavo') || low.includes('colori') || low.includes('crimpare') || low.includes('t568b') || low.includes('t568a') || low.includes('poe')) {
    return `### 🔬 1. Architettura & Causa Radice (Cablaggio Strutturato & Standard TIA/EIA)
Nelle reti Ethernet aziendali Gigabit (1000BASE-T) e PoE (Power over Ethernet 802.3af/at/bt), il rispetto rigido dello standard **T568B** garantisce la cancellazione del rumore elettromagnetico tramite twistatura a coppie differenziali:
- **Crosstalk & Near-End Crosstalk (NEXT):** Srotolare i conduttori per più di 12 mm prima dell'inserimento nel connettore RJ45 degrada la categoria del cavo, causando CRC error e declassamento della velocità da 1 Gbps a 100 Mbps o packet loss.
- **Alimentazione PoE:** Nei sistemi PoE 802.3af (15.4W) e 802.3at PoE+ (30W), i pin 4-5 (blu) e 7-8 (marrone) trasportano alimentazione in corrente continua fino a 57V. Una crimpatura difettosa provoca caduta di tensione e riavvii continui di access point o telefoni IP.

### 🔍 2. Sequenza Esatta Conduttori T568B (Standard Aziendale Europeo)
Guardando il connettore con la **linguetta trasparente di blocco rivolta verso il basso (rivolta indietro)**, da sinistra a destra:
1. **Bianco-Arancio** → Pin 1 | Tx+ (Dati Coppia 2)
2. **Arancio** → Pin 2 | Tx- (Dati Coppia 2)
3. **Bianco-Verde** → Pin 3 | Rx+ (Dati Coppia 3)
4. **Blu** → Pin 4 | Dati / Tensione Positiva PoE
5. **Bianco-Blu** → Pin 5 | Dati / Tensione Positiva PoE
6. **Verde** → Pin 6 | Rx- (Dati Coppia 3)
7. **Bianco-Marrone** → Pin 7 | Dati / Massa Negativa PoE
8. **Marrone** → Pin 8 | Dati / Massa Negativa PoE

*(Nota Fondamentale: Il pin 3 e il pin 6 racchiudono la coppia blu centrale; l'errore tipico del principiante è mettere Bianco-Verde e Verde vicini sui pin 3 e 4, creando un circuito aperto o split-pair).*

### ⚙️ 3. Regole d'Oro per una Crimpatura Certificabile
1. Sguaina la guaina esterna del cavo per circa 25 mm senza intaccare l'isolamento dei singoli conduttori interni.
2. Distendi le coppie e ordinali rigidamente secondo T568B.
3. Raddrizza e pareggia con un taglio netto a 90° lasciando i conduttori scoperti a **12-13 mm**.
4. Spingi fino a far toccare le estremità di rame contro la testata trasparente del connettore, assicurandoti che la guaina esterna entri sotto il dente fermacavo (per evitare strappi meccanici).
5. Serraggio deciso con crimpatrice a cricchetto calibrata.

### 🛡️ 4. Test con Strumentazione e Certificazione
- Esegui sempre il collaudo con tester RJ45 a scorrimento (LED 1-8 in sequenza sincronizzata). Se il LED 3 o 6 non si accende, il link non negozierà mai in Gigabit.
- Per tratte fisse posate in canalina usa sempre **cavo solido (Solid Core)** e prese keystone; per cavi patch da armadio usa **cavo flessibile (Stranded)**.

### 💡 5. Verdetto & Best Practice Specialistica IO-IT
Se uno switch PoE managed continua a mostrare errori di alimentazione o negoziazione a 100 Mbps su una tratta certificata Cat 6, ispeziona i pin dorati della presa a muro con una torcia: spesso un pin deformato o piegato all'interno impedisce il contatto sui pin 4-5 o 7-8.`;
  }

  return `### 🔬 1. Architettura & Analisi Sistematica del Disservizio
Per risolvere qualsiasi incidente IT complesso con approccio scientifico da Lead Systems Engineer:
- **Scomposizione ISO/OSI:** Isola sempre a quale livello risiede il disservizio:
  - *Layer 1/2 (Fisico/Data Link):* LED link switch/scheda di rete, collisioni, errori CRC, VLAN tagging 802.1Q.
  - *Layer 3/4 (Network/Transport):* Routing, MTU mismatch, porte TCP/UDP in timeout, sessioni socket bloccate (\`TIME_WAIT\`, \`CLOSE_WAIT\`).
  - *Layer 7 (Applicativo):* Servizi Windows/Linux (Tomcat, Spooler, 3CX SBC, SQL Server), permessi NTFS, autenticazione Kerberos/NTLM.

### 🔍 2. Diagnostica Strumentale Immediata (PowerShell Admin)
\`\`\`powershell
# Ispezione eventi critici nelle ultime 2 ore nel registro di sistema
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2; StartTime=(Get-Date).AddHours(-2)} | 
  Select-Object TimeCreated, Id, ProviderName, Message | Format-Table -Wrap

# Verifica porte aperte e processi in ascolto
netstat -ano | findstr "LISTENING"
\`\`\`

### ⚙️ 3. Procedura Operativa di Risoluzione
1. **Non riavviare alla cieca l'intero server:** Isola il processo o servizio impattato in \`services.msc\` o tramite PowerShell ed effettua un restart controllato.
2. **Controllo Risorse Critiche:** Verifica memoria RAM impegnata (evita paging su disco), saturazione della partizione di sistema \`C:\\\` e utilizzo CPU thread da Gestione Attività / Resource Monitor.

### 🛡️ 4. Hardening & Prevenzione Permanente
- Configura audit e retention policy dei log per non saturare lo storage.
- Documenta ogni modifica architetturale e applica il principio del privilegio minimo (Least Privilege) sui servizi e condivisioni di rete.

### 💡 5. Verdetto & Consiglio Specialistico IO-IT
Riformula o specifica nel prompt i dettagli dell'ambiente (versione del sistema operativo, codice errore esatto, modello apparato 3CX/router/Zucchetti): IO-IT genererà immediatamente il piano di intervento e gli script mirati.`;
}

// IO-IT Senior Systems & Infrastructure AI endpoint
app.post('/api/senior-it', async (req, res) => {
  const { question, depth } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'La domanda non può essere vuota.' });
  }

  const cleanQuestion = question.trim();

  // If Gemini AI client is initialized with an API key, query gemini-3.8-flash with deep enterprise instructions
  if (ai) {
    try {
      const systemInstruction = `Sei "IO-IT", Principal Infrastructure Architect, Network Specialist e Senior Enterprise Systems Engineer italiano con oltre 20 anni di esperienza sul campo in architetture mission-critical, telecomunicazioni VoIP, ERP aziendali e networking avanzato.

MANDATO FONDAMENTALE E LIVELLO DI APPROFONDIMENTO (RICHIESTO ESPRESSAMENTE DALL'UTENTE):
L'utente richiede RISPOSTE ALTAMENTE APPROFONDITE, COMPLETE, RIGOROSE E SPECIALISTICHE. SONO TASSATIVAMENTE VIETATE NOZIONI ELEMENTARI, RISPOSTE SUPERFICIALI O CONSIGLI BANALI (come "riavvia il PC", "guarda se il cavo è inserito", "chiama l'assistenza").
Ogni tua risposta deve fornire un valore tecnico di livello Senior/Principal Engineer, spiegando la causa radice a basso livello, fornendo comandi completi ed eseguibili, chiavi di registro di Windows, Event ID specifici, query SQL, filtri Wireshark e strategie di hardening permanente.

DOMINI DI SPECIALIZZAZIONE ASSOLUTA:
1. Telefonia VoIP 3CX & Telecomunicazioni:
   - 3CX SBC (Session Border Controller su Debian/Raspberry/Windows), tunnel port 5090 UDP/TCP.
   - Telefoni IP Yealink, Fanvil, Snom (provisioning PnP, DHCP Option 66, RPS, template XML, codec G.711u/a, G.729, Opus).
   - SIP Signaling (RFC 3261), pacchetti SDP, NAT Transversal, STUN, porte RTP audio 9000-10999 UDP.
   - Disabilitazione e problemi causati da SIP ALG su router/firewall (FortiGate, FritzBox, Mikrotik, Cisco, pfSense).
   - Sicurezza 3CX: IP Blacklist, anti-hacking rules, certificati SSL Let's Encrypt / FQDN.
2. Soluzioni Gestionali ed ERP Zucchetti:
   - Zucchetti Infinity (DMS, Web Framework, portale applicativo web).
   - Zucchetti Ad Hoc Revolution & Ad Hoc Enterprise (architettura client-server, sessioni RDS/Terminal Server, processi adhoc.exe).
   - Portale HR e Zucchetti Paghe Web.
   - Servizi Apache Tomcat: allocazione memoria JVM (-Xms, -Xmx), thread worker, pool di connessioni DBCP/JDBC, gestione log catalina.out e saturazione disco C:.
   - Motori database: Microsoft SQL Server, PostgreSQL, Pervasive PSQL; diagnosi tabelle di lock (sys.dm_tran_locks), indici e transazioni appese.
3. Hardware, Cablaggio Strutturato e Impianti:
   - Standard TIA/EIA 568B e 568A (pinout dettagliato 1-8, assegnazione coppie differenziali, attenuazione e Near-End Crosstalk NEXT).
   - Standard PoE (802.3af 15.4W, 802.3at PoE+ 30W, 802.3bt Ultra PoE fino a 90W), bilanciamento wattaggio switch PoE.
   - Patch panel, crimpatura keystone RJ45 Cat6/Cat6A, switch managed L2/L3, VLAN 802.1Q (tag/untag/PVID).
4. Networking & Connettività Avanzata:
   - DHCP (DORA handshake: Discover, Offer, Request, Acknowledge), cause di indirizzo APIPA 169.254.x.x, opzioni DHCP avanzate (Option 3 Gateway, 6 DNS, 66/67 Boot/TFTP, 150/156 VoIP).
   - Risoluzione DNS aziendale, cache resolver, record SRV Active Directory, forwarder, DNS over HTTPS/TLS.
   - Routing, Subnetting CIDR, VPN IPSec IKEv2 / OpenVPN / WireGuard, packet inspection firewall.
5. Sistemistica Windows Client e Windows Server:
   - Active Directory Domain Services (AD DS): replica tra DC (repadmin, dcdiag), ruoli FSMO, Kerberos clock skew (max 300s con PDC Emulator).
   - Criteri di Gruppo (GPO): applicazione gpupdate, report gpresult, filtri WMI, estensioni lato client (CSE).
   - Spooler di stampa Windows (spoolsv.exe, cartella Spool\\PRINTERS, isolamento driver v3 vs v4, eliminazione porte WSD a favore di Standard TCP/IP LPR/RAW port 9100).
   - Scripting avanzato PowerShell e CLI CMD per manutenzione e diagnostica.

STRUTTURA OBBLIGATORIA DI OGNI RISPOSTA:
Formatta SEMPRE la risposta in italiano professionale, usando Markdown accurato, secondo questo schema ad alto impatto:

### 🔬 1. Architettura Tecnica & Causa Radice (Root Cause)
[Spiega nel dettaglio il meccanismo a basso livello del protocollo, del sistema operativo, del database o del network stack che provoca l'anomalia. Spiega il "perché" si verifica l'errore].

### 🔍 2. Diagnostica Rigorosa & Triage Pre-Fix
[Fornisci i comandi precisi da lanciare per verificare con certezza scientifica lo stato prima di applicare modifiche: comandi PowerShell con filtri avanzati, CLI CMD, comandi Bash per Linux 3CX, codici di errore ed Event ID specifici da cercare in Event Viewer, o filtri Wireshark].

### ⚙️ 3. Procedura Operativa di Risoluzione (Step-by-Step)
[Passo passo con sintassi completa dei comandi, percorsi precisi di configurazione (in 3CX, Zucchetti o Windows Server), chiavi di registro di Windows esatte con percorso (HKLM\\...), script pronti da eseguire].

### 🛡️ 4. Hardening, Prevenzione Permanente & Monitoraggio
[Azioni preventive definitive per evitare recidive: configurazione policy GPO, regole firewall, tuning dei timeout e parametri di servizio, script di monitoraggio periodico].

### 💡 5. Verdetto & Consiglio Specialistico IO-IT
[Chiusura autorevole con la raccomandazione critica del Lead Engineer].`;

      const promptPayload = `[LIVELLO DI DETTAGLIO: MASSIMO APPROFONDIMENTO SPECIALISTICO ENTERPRISE / SENIOR ARCHITECT]
DOMANDA TECNICA DELL'OPERATORE:
"${cleanQuestion}"

Fornisci la diagnosi e la soluzione tecnica completa, approfondita ed esaustiva secondo le 5 sezioni obbligatorie, senza omettere comandi esatti, parametri e dettagli di basso livello.`;

      const apiCall = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptPayload,
        config: {
          systemInstruction,
          temperature: 0.2, // Low temperature for high technical precision and reproducibility
          maxOutputTokens: 3500, // Generous token allowance for rich, deep technical output
        },
      });

      // 25 second timeout for deep, high-density responses
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 25000)
      );

      const response = await Promise.race([apiCall, timeoutPromise]);

      const text = response.text;
      if (text) {
        return res.json({
          answer: text,
          source: 'gemini-3.8-flash',
          depth: depth || 'expert',
        });
      }
    } catch (err: unknown) {
      console.error('Gemini API query error, falling back to local expert engine:', err);
    }
  }

  // Fallback to internal high-depth knowledge engine
  const fallback = getFallbackItResponse(cleanQuestion);
  return res.json({
    answer: fallback,
    source: 'knowledge-engine',
    depth: depth || 'expert',
  });
});

// Vite middleware in dev or static files in production
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`io IT server running on http://0.0.0.0:${port}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
