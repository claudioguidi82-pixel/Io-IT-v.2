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

// Fallback rule-based IT knowledge generator if Gemini API key is missing or offline
function getFallbackItResponse(query: string): string {
  const low = query.toLowerCase();

  if (low.includes('3cx') || low.includes('telefono') || low.includes('voip') || low.includes('sbc') || low.includes('yealink') || low.includes('fanvil')) {
    return `### 📞 Diagnosi Rapida 3CX & VoIP
1. **Verifica Porta & PoE:** Assicurati che il cavo di rete entri nella porta **LAN/PoE** del telefono e non nella porta ausiliaria 'PC'.
2. **Stato 3CX SBC Locale:** Accedi alla console di gestione 3CX e verifica che l'istanza **3CX SBC** dell'ufficio sia in stato Verde (Online). Se è rossa, riavvia il servizio SBC sulla macchina host o Raspberry/miniPC.
3. **Controllo IP Blacklist:** Vai in *Sicurezza → IP Blacklist*. Se un telefono ha fallito troppi tentativi di registrazione, 3CX blocca l'IP locale; rimuovilo e aggiungilo alla Whitelist permanente.
4. **Provisioning Rapido:** Per telefoni fisici controlla il MAC Address in *Utenti → Provisioning Telefono*. Per app smartphone invia l'email di benvenuto e inquadra il QR Code.
5. **Problemi di Audio Monodirezionale (Muto):** Verifica che il firewall dell'ufficio non blocchi l'intervallo porte RTP UDP (standard 9000-10999) e disabilita tassativamente **SIP ALG** sul router.`;
  }

  if (low.includes('zucchetti') || low.includes('infinity') || low.includes('ad hoc') || low.includes('paghe') || low.includes('hr')) {
    return `### 🏢 Procedura di Sblocco Zucchetti
1. **Sblocco Sessione Appesa:**
   - **Ambiente Infinity / Portale HR:** Accedi con utente amministrativo, vai in *Amministrazione del Sistema → Controllo Sessioni / Utenti Connessi* e termina forzatamente la sessione dell'utente bloccato.
   - **Ambiente Ad Hoc (RDS / Terminal Server):** Apri *Gestione Attività (Task Manager)* sul server RDS, vai nella scheda *Utenti*, individua la sessione e termina il processo \`adhoc.exe\` o disconnetti la sessione disconnessa.
2. **Risoluzione Schermo Bianco o Mancato Accesso Web:**
   - Esegui una pulizia approfondita della cache del browser (\`CTRL + SHIFT + CANC\`).
   - Verifica che i **Pop-up** siano autorizzati per l'indirizzo/URL del portale Zucchetti.
   - Assicurati che l'ora e la data del client siano sincronizzate col Domain Controller (max 5 min di skew Kerberos).
3. **Controllo Servizi Server Zucchetti:**
   - Su \`services.msc\` del server applicativo, verifica che **Apache Tomcat (Zucchetti Web Application)** e il database engine (**SQL Server / PostgreSQL**) siano nello stato 'In esecuzione'. Se necessario, riavvia Tomcat.`;
  }

  if (low.includes('rj45') || low.includes('cavo') || low.includes('colori') || low.includes('crimpare') || low.includes('t568b') || low.includes('t568a')) {
    return `### 🛠️ Standard Crimpatura Cavo Diretto RJ45 (T568B - Standard Italia/Aziendale)
Disponi i fili piatti guardando il connettore con la **linguetta trasparente verso il basso (rivolta indietro)**, da sinistra a destra (pin 1 a 8):
1. **Bianco-Arancio** (Pin 1) - Tx+
2. **Arancio** (Pin 2) - Tx-
3. **Bianco-Verde** (Pin 3) - Rx+
4. **Blu** (Pin 4) - PoE/Dati
5. **Bianco-Blu** (Pin 5) - PoE/Dati
6. **Verde** (Pin 6) - Rx-
7. **Bianco-Marrone** (Pin 7) - PoE/Massa
8. **Marrone** (Pin 8) - PoE/Massa

*Consiglio:* Pareggia i fili con la forbice a circa 12 mm prima di infilarli a fondo nella guida fino a toccare il rame frontale.`;
  }

  if (low.includes('stampante') || low.includes('spooler') || low.includes('stampa') || low.includes('driver')) {
    return `### 🖨️ Procedura Ripristino Stampante di Rete
1. **Test di Connettività:** Esegui \`ping <IP_Stampante> -t\`. Se non risponde, verifica che il display sia acceso, cavo LAN collegato e che lo switch non abbia la porta in down.
2. **Riavvio Pulito Spooler di Windows (CMD da Amministratore):**
\`\`\`cmd
net stop spooler
del /Q /F /S "%systemroot%\\System32\\Spool\\Printers\\*.*"
net start spooler
\`\`\`
3. **Conversione Porta WSD in TCP/IP:** Se la stampante usa una porta **WSD (Web Services for Devices)** spesso perde la sincronizzazione. Vai su *Proprietà Stampante → Porte → Aggiungi porta → Standard TCP/IP Port* e inserisci l'indirizzo IP statico o prenotato DHCP della stampante.`;
  }

  if (low.includes('169.254') || low.includes('apipa') || low.includes('dhcp') || low.includes('ip') || low.includes('rete') || low.includes('wifi') || low.includes('dns')) {
    return `### 🌐 Diagnosi Rete & Mancata Navigazione
1. **Indirizzo 169.254.x.x (APIPA):** Significa che Windows non riceve risposta dal server DHCP.
   - Controlla che il cavo sia integro e il link LED sullo switch sia acceso.
   - Prova a forzare: \`ipconfig /release\` seguito da \`ipconfig /renew\`.
   - Se su Wi-Fi, controlla se l'AP ha esaurito il pool DHCP o se la VLAN è errata.
2. **Ping Test Isolamento:**
   - \`ping 127.0.0.1\` (test stack TCP/IP scheda locale)
   - \`ping <IP_Gateway>\` (test collegamento router/switch aziendale)
   - \`ping 8.8.8.8\` (test instradamento Internet)
   - \`ping google.it\` (se 8.8.8.8 risponde ma i nomi falliscono, è un problema di DNS: esegui \`ipconfig /flushdns\` e imposta 1.1.1.1 o DNS locale).`;
  }

  if (low.includes('server') || low.includes('active directory') || low.includes('domain') || low.includes('gpo') || low.includes('utente')) {
    return `### 💻 Sistemistica Windows Server & Dominio
1. **Comandi Rapidi Manutenzione:**
   - Aggiorna criteri GPO: \`gpupdate /force\`
   - Verifica mappature dischi di rete: \`net use\`
   - Sblocca o gestisci utenti AD: esegui \`dsa.msc\`
   - Console servizi: \`services.msc\`
   - Visualizzatore eventi: \`eventvwr.msc\`
2. **Controllo replica Domain Controller:**
   \`repadmin /replsummary\` per vedere se tutti i DC sincronizzano correttamente senza errori.`;
  }

  return `### 🛠️ Linee Guida Senior IT
1. **Isola il guasto (Hardware vs Software):** Controlla LED di stato, cavi fisici, ping verso il Gateway locale e verso 8.8.8.8.
2. **Verifica l'impatto:** Il problema riguarda un solo utente (dispositivo/credenziali) o l'intero reparto (switch/VLAN/server)?
3. **Controlla Registri & Servizi:** Apri \`services.msc\` ed \`eventvwr.msc\` per esaminare errori recenti.
4. **Riavvio mirato:** Prima di riavviare un intero server, riavvia solo il servizio specifico (Tomcat, Spooler, SBC o IIS).`;
}

// Senior IT AI endpoint
app.post('/api/senior-it', async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'La domanda non può essere vuota.' });
  }

  const cleanQuestion = question.trim();

  // If Gemini AI client is initialized with an API key, query gemini-3.8-flash
  if (ai) {
    try {
      const systemInstruction = `Sei "Senior IT", un ingegnere di sistemi e supporto tecnico senior italiano con 20 anni di esperienza pratica sul campo in aziende, data center e PMI.
Le tue specializzazioni assolute:
- Telefonia VoIP 3CX (SBC, telefoni Yealink/Fanvil/Snom, app mobile, QR code, IP blacklist, trunk SIP, codec audio G711/G729, NAT e porte RTP 9000-10999).
- Gestionali ed ERP Zucchetti (Infinity, Ad Hoc Revolution/Enterprise, HR Portal, Paghe Web, servizi Apache Tomcat, SQL Server, Postgres, sessioni bloccate su RDS/Terminal Server, permessi pop-up e licenze).
- Hardware, Impianti e Cablaggio Reti (standard RJ45 T568B/T568A, patch panel, PoE 802.3af/at, switch managed, VLAN, crimpatura).
- Connettività di Rete (DHCP, APIPA 169.254, DNS, Gateway, routing, subnet mask CIDR, firewall, Wi-Fi aziendale).
- Sistemistica Windows Client & Windows Server (Active Directory dsa.msc, GPO gpupdate, Spooler di stampa, mappature dischi UNC net use, PowerShell, CMD).

FORMATO DI RISPOSTA:
- Rispondi SEMPRE in italiano, chiaro, conciso, professionale e orientato all'azione immediata.
- Usa punti elenco numerati pratici (Passo 1, Passo 2, Passo 3...).
- Scrivi i comandi esatti da eseguire in blocchi codice o inline (es. \`ipconfig /flushdns\`, \`services.msc\`).
- Se c'è un'azione rischiosa (es. riavvio server o kill di processo), aggiungi una breve riga di ATTENZIONE.
- Concludi con un consiglio da esperto ("Consiglio Senior IT").`;

      const apiCall = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: cleanQuestion,
        config: {
          systemInstruction,
          temperature: 0.25,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 8000)
      );

      const response = await Promise.race([apiCall, timeoutPromise]);

      const text = response.text;
      if (text) {
        return res.json({
          answer: text,
          source: 'gemini-3.8-flash',
        });
      }
    } catch (err: unknown) {
      console.error('Gemini API query error, falling back to local expert engine:', err);
    }
  }

  // Fallback to internal knowledge base
  const fallback = getFallbackItResponse(cleanQuestion);
  return res.json({
    answer: fallback,
    source: 'knowledge-engine',
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
