import { useState, useEffect, useMemo } from 'react';
import {
  Customer,
  WorkReport,
  WorkActivityType,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_WORK_REPORTS,
  generateZucchettiAdHocCsv,
  generateZucchettiAdHocXml,
  downloadFile,
} from '../data/lavoriDefaults';
import { useSystemLogs } from '../context/LogContext';
import {
  Briefcase,
  Users,
  Plus,
  Download,
  Search,
  Filter,
  Clock,
  FileSpreadsheet,
  FileCode,
  Printer,
  Trash2,
  CheckCircle2,
  Edit2,
  Building2,
  Calendar,
  UserCheck,
  AlertCircle,
  Hash,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const STORAGE_CUSTOMERS_KEY = 'io_it_anagrafiche_clienti_v1';
const STORAGE_REPORTS_KEY = 'io_it_lavori_svolti_v1';

export default function LavoriSvoltiSection() {
  const { addLog } = useSystemLogs();

  // Load Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOMERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  // Load Work Reports
  const [reports, setReports] = useState<WorkReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REPORTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_WORK_REPORTS;
    } catch {
      return INITIAL_WORK_REPORTS;
    }
  });

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));
  }, [reports]);

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<'lavori' | 'anagrafiche' | 'guida_zucchetti'>('lavori');
  const [filterActivity, setFilterActivity] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<WorkReport | null>(null);

  // Form State for Work Report
  const [formData, setFormData] = useState<{
    date: string;
    customerCode: string;
    customerName: string;
    customerVat: string;
    activityType: WorkActivityType;
    hoursWorked: string;
    technician: string;
    description: string;
    jobReference: string;
    status: 'completato' | 'in_corso' | 'da_fatturare' | 'garanzia';
    notes: string;
  }>({
    date: new Date().toISOString().slice(0, 10),
    customerCode: 'CLI001',
    customerName: 'Studio Tecnico Ingegneria Rossi & Associati',
    customerVat: 'IT01234567891',
    activityType: 'assistenza tecnica',
    hoursWorked: '2.0',
    technician: 'IO-IT / Tecnico Senior',
    description: '',
    jobReference: '',
    status: 'completato',
    notes: '',
  });

  // Customer Form State
  const [custFormData, setCustFormData] = useState<Customer>({
    id: '',
    code: '',
    name: '',
    vatNumber: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
  });

  // Activity list requested by user
  const activityOptions: { value: WorkActivityType; label: string; badgeColor: string; requiresHours: boolean }[] = [
    { value: 'assistenza tecnica', label: 'Assistenza Tecnica', badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400', requiresHours: true },
    { value: 'formazione', label: 'Formazione', badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400', requiresHours: true },
    { value: 'attivazione linea', label: 'Attivazione Linea', badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400', requiresHours: false },
    { value: 'preventivo', label: 'Preventivo', badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400', requiresHours: false },
    { value: 'vendita', label: 'Vendita', badgeColor: 'bg-teal-500/10 text-teal-600 border-teal-500/30 dark:text-teal-400', requiresHours: false },
  ];

  const isHoursEnabled = formData.activityType === 'formazione' || formData.activityType === 'assistenza tecnica';

  // Handle customer selection in report form
  const handleSelectCustomer = (code: string) => {
    const cust = customers.find((c) => c.code === code);
    if (cust) {
      setFormData((prev) => ({
        ...prev,
        customerCode: cust.code,
        customerName: cust.name,
        customerVat: cust.vatNumber || '',
      }));
    }
  };

  // Open modal for new report
  const handleOpenNewReport = () => {
    setEditingReportId(null);
    const defaultCust = customers[0] || { code: 'CLI001', name: 'Cliente Generico', vatNumber: '' };
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      customerCode: defaultCust.code,
      customerName: defaultCust.name,
      customerVat: defaultCust.vatNumber || '',
      activityType: 'assistenza tecnica',
      hoursWorked: '2.0',
      technician: 'IO-IT / Tecnico Senior',
      description: '',
      jobReference: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'completato',
      notes: '',
    });
    setIsModalOpen(true);
  };

  // Open modal for editing report
  const handleEditReport = (rep: WorkReport) => {
    setEditingReportId(rep.id);
    setFormData({
      date: rep.date,
      customerCode: rep.customerCode,
      customerName: rep.customerName,
      customerVat: rep.customerVat || '',
      activityType: rep.activityType,
      hoursWorked: rep.hoursWorked !== undefined ? String(rep.hoursWorked) : '',
      technician: rep.technician,
      description: rep.description,
      jobReference: rep.jobReference || '',
      status: rep.status,
      notes: rep.notes || '',
    });
    setIsModalOpen(true);
  };

  // Save report
  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      alert('Inserire una descrizione per la lavorazione svolta.');
      return;
    }

    let parsedHours: number | undefined = undefined;
    if (isHoursEnabled) {
      const h = parseFloat(formData.hoursWorked.replace(',', '.'));
      if (isNaN(h) || h <= 0) {
        alert('Per Formazione o Assistenza Tecnica è necessario specificare le ore di lavoro svolte.');
        return;
      }
      parsedHours = Math.round(h * 100) / 100;
    }

    if (editingReportId) {
      // Edit
      setReports((prev) =>
        prev.map((r) =>
          r.id === editingReportId
            ? {
                ...r,
                date: formData.date,
                customerCode: formData.customerCode,
                customerName: formData.customerName,
                customerVat: formData.customerVat,
                activityType: formData.activityType,
                hoursWorked: parsedHours,
                technician: formData.technician,
                description: formData.description,
                jobReference: formData.jobReference,
                status: formData.status,
                notes: formData.notes,
              }
            : r
        )
      );

      addLog({
        category: 'LAVORI',
        level: 'INFO',
        title: `Scheda Lavorazione modificata [${formData.activityType.toUpperCase()}]`,
        details: `Cliente: ${formData.customerName} | Ore: ${parsedHours ?? 'N/D'} | Rif: ${formData.jobReference || 'N/D'}`,
      });
    } else {
      // New
      const nextNum = reports.length + 1;
      const reportNumber = `LAV-2026-${String(nextNum).padStart(3, '0')}`;
      const newReport: WorkReport = {
        id: `rep-${Date.now()}`,
        reportNumber,
        date: formData.date,
        customerCode: formData.customerCode,
        customerName: formData.customerName,
        customerVat: formData.customerVat,
        activityType: formData.activityType,
        hoursWorked: parsedHours,
        technician: formData.technician,
        description: formData.description,
        jobReference: formData.jobReference,
        status: formData.status,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      };

      setReports((prev) => [newReport, ...prev]);

      addLog({
        category: 'LAVORI',
        level: 'SUCCESS',
        title: `Nuovo Lavoro registrato: ${reportNumber} [${formData.activityType.toUpperCase()}]`,
        details: `Cliente: ${formData.customerName} (${formData.customerCode}) | Ore: ${parsedHours ?? 'N/D'} | Tecnico: ${formData.technician}`,
        rawPayload: newReport,
      });
    }

    setIsModalOpen(false);
  };

  // Delete report
  const handleDeleteReport = (id: string, repNum: string) => {
    if (confirm(`Confermi l'eliminazione del rapportino ${repNum}?`)) {
      setReports((prev) => prev.filter((r) => r.id !== id));
      addLog({
        category: 'LAVORI',
        level: 'WARN',
        title: `Rapportino ${repNum} eliminato`,
        details: 'Record rimosso dallo storico lavorazioni.',
      });
    }
  };

  // Add / Edit Customer
  const handleOpenNewCustomer = () => {
    const nextCode = `CLI${String(customers.length + 1).padStart(3, '0')}`;
    setCustFormData({
      id: `cust-${Date.now()}`,
      code: nextCode,
      name: '',
      vatNumber: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: '',
    });
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custFormData.name.trim() || !custFormData.code.trim()) {
      alert('Inserire Codice Conto Ad Hoc e Ragione Sociale.');
      return;
    }

    const existingIndex = customers.findIndex((c) => c.code === custFormData.code || c.id === custFormData.id);
    if (existingIndex >= 0) {
      setCustomers((prev) => prev.map((c, i) => (i === existingIndex ? custFormData : c)));
    } else {
      setCustomers((prev) => [...prev, custFormData]);
    }

    addLog({
      category: 'LAVORI',
      level: 'SUCCESS',
      title: `Anagrafica Cliente salvata: ${custFormData.name} (${custFormData.code})`,
      details: `P.IVA: ${custFormData.vatNumber || 'N/D'} | Sede: ${custFormData.city || 'N/D'}`,
    });

    setIsCustomerModalOpen(false);
  };

  // Delete Customer
  const handleDeleteCustomer = (id: string, name: string) => {
    if (confirm(`Rimuovere il cliente "${name}" dalle anagrafiche?`)) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      addLog({
        category: 'LAVORI',
        level: 'WARN',
        title: `Cliente ${name} rimosso`,
        details: 'Anagrafica cliente cancellata dal registro.',
      });
    }
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterActivity !== 'all' && r.activityType !== filterActivity) return false;
      if (filterCustomer !== 'all' && r.customerCode !== filterCustomer) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesClient = r.customerName.toLowerCase().includes(q) || r.customerCode.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesRef = r.jobReference?.toLowerCase().includes(q) ?? false;
        const matchesNum = r.reportNumber.toLowerCase().includes(q);
        if (!matchesClient && !matchesDesc && !matchesRef && !matchesNum) return false;
      }
      return true;
    });
  }, [reports, filterActivity, filterCustomer, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    let totalHours = 0;
    let assistenzaCount = 0;
    let formazioneCount = 0;
    let attivazioneCount = 0;
    let venditaCount = 0;
    let preventivoCount = 0;

    reports.forEach((r) => {
      if (r.hoursWorked) totalHours += r.hoursWorked;
      if (r.activityType === 'assistenza tecnica') assistenzaCount++;
      if (r.activityType === 'formazione') formazioneCount++;
      if (r.activityType === 'attivazione linea') attivazioneCount++;
      if (r.activityType === 'vendita') venditaCount++;
      if (r.activityType === 'preventivo') preventivoCount++;
    });

    return {
      total: reports.length,
      totalHours: Math.round(totalHours * 100) / 100,
      assistenzaCount,
      formazioneCount,
      attivazioneCount,
      venditaCount,
      preventivoCount,
    };
  }, [reports]);

  // Export handlers
  const handleExportZucchettiCsv = (singleReport?: WorkReport) => {
    const dataToExport = singleReport ? [singleReport] : filteredReports;
    if (dataToExport.length === 0) {
      alert('Nessuna lavorazione da esportare.');
      return;
    }
    const csvContent = generateZucchettiAdHocCsv(dataToExport, true, 'IT');
    const filename = singleReport
      ? `Zucchetti_AdHoc_${singleReport.reportNumber}_${singleReport.customerCode}.csv`
      : `Zucchetti_AdHoc_Lavorazioni_${new Date().toISOString().slice(0, 10)}.csv`;

    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');

    addLog({
      category: 'LAVORI',
      level: 'SUCCESS',
      title: `Export Zucchetti Ad Hoc CSV generato (${dataToExport.length} schede)`,
      details: `File scaricato: ${filename} (Separatore punto e virgola ';' compatibile con wizard Importazione Ad Hoc Revolution / Enterprise).`,
    });
  };

  const handleExportZucchettiXml = (singleReport?: WorkReport) => {
    const dataToExport = singleReport ? [singleReport] : filteredReports;
    if (dataToExport.length === 0) {
      alert('Nessuna lavorazione da esportare.');
      return;
    }
    const xmlContent = generateZucchettiAdHocXml(dataToExport);
    const filename = singleReport
      ? `Zucchetti_AdHoc_${singleReport.reportNumber}.xml`
      : `Zucchetti_AdHoc_Lavorazioni_${new Date().toISOString().slice(0, 10)}.xml`;

    downloadFile(xmlContent, filename, 'application/xml;charset=utf-8;');

    addLog({
      category: 'LAVORI',
      level: 'SUCCESS',
      title: `Export Zucchetti Ad Hoc XML generato (${dataToExport.length} schede)`,
      details: `File scaricato: ${filename} (Schema XML lavorazioni esterne per Zucchetti).`,
    });
  };

  const handlePrintSheet = (r: WorkReport) => {
    setSelectedReportForPrint(r);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-gradient-to-r transition-all
        from-[#f8f9fa] via-white to-[#f1f3f4] border-[#dadce0] text-slate-900
        dark:from-[#061208] dark:via-[#09180d] dark:to-[#040d06] dark:border-[#00ff66]/30 dark:text-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#1a73e8]/10 text-[#1a73e8] dark:bg-[#00ff66]/15 dark:text-[#00ff66] border border-[#1a73e8]/20 dark:border-[#00ff66]/30">
              <Briefcase className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>Gestione Lavori Svolti & Rapportini IT</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#e8f0fe] text-[#1967d2] dark:bg-[#00220a] dark:text-[#00ff66] border border-[#aecbfa] dark:border-[#00ff66]/40">
                  Zucchetti Ad Hoc Ready
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Censisci attività (vendita, preventivo, formazione, attivazione linea, assistenza tecnica) con ore lavorate ed esporta direttamente per il gestionale Ad Hoc Revolution / Enterprise.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleOpenNewReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm
              bg-[#1a73e8] hover:bg-[#1557b0] text-white hover:shadow-md
              dark:bg-[#00ff66] dark:text-[#050b07] dark:hover:bg-[#00cc52] dark:shadow-[0_0_12px_rgba(0,255,102,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Lavoro</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewCustomer}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all
              bg-white hover:bg-slate-50 text-slate-700 border-[#dadce0]
              dark:bg-[#09150e] dark:hover:bg-[#0e2217] dark:text-[#00ff66] dark:border-[#00ff66]/40"
          >
            <Users className="w-3.5 h-3.5 text-[#1a73e8] dark:text-[#00ff66]" />
            <span>+ Cliente</span>
          </button>

          {/* Quick Export Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => handleExportZucchettiCsv()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                bg-[#34a853] hover:bg-[#2d9249] text-white border-transparent
                dark:bg-[#003311] dark:hover:bg-[#004d1a] dark:text-[#00ff66] dark:border-[#00ff66]/50"
              title="Esporta lavorazioni in formato CSV per Zucchetti Ad Hoc"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Esporta Ad Hoc (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs font-mono">
        <div className="p-3 rounded-xl border bg-white border-[#dadce0] dark:bg-[#07130a] dark:border-[#00ff66]/25">
          <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">Lavori Totali</div>
          <div className="text-lg font-bold text-slate-900 dark:text-[#00ff66] mt-0.5">{stats.total}</div>
        </div>
        <div className="p-3 rounded-xl border bg-white border-[#dadce0] dark:bg-[#07130a] dark:border-[#00ff66]/25">
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Ore Lavorate</span>
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-[#00ff66] mt-0.5">{stats.totalHours} h</div>
        </div>
        <div className="p-3 rounded-xl border bg-white border-[#dadce0] dark:bg-[#07130a] dark:border-[#00ff66]/25">
          <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">Assistenza Tec.</div>
          <div className="text-lg font-bold text-slate-900 dark:text-gray-100 mt-0.5">{stats.assistenzaCount}</div>
        </div>
        <div className="p-3 rounded-xl border bg-white border-[#dadce0] dark:bg-[#07130a] dark:border-[#00ff66]/25">
          <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">Formazione</div>
          <div className="text-lg font-bold text-slate-900 dark:text-gray-100 mt-0.5">{stats.formazioneCount}</div>
        </div>
        <div className="p-3 rounded-xl border bg-white border-[#dadce0] dark:bg-[#07130a] dark:border-[#00ff66]/25">
          <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">Attiv. Linea</div>
          <div className="text-lg font-bold text-slate-900 dark:text-gray-100 mt-0.5">{stats.attivazioneCount}</div>
        </div>
        <div className="p-3 rounded-xl border bg-white border-[#dadce0] dark:bg-[#07130a] dark:border-[#00ff66]/25">
          <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">Clienti Censiti</div>
          <div className="text-lg font-bold text-slate-900 dark:text-gray-100 mt-0.5">{customers.length}</div>
        </div>
      </div>

      {/* Sub Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-[#dadce0] dark:border-[#00ff66]/25 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('lavori')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'lavori'
              ? 'bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07] font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#00ff66]/10'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Schede Lavori ({reports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('anagrafiche')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'anagrafiche'
              ? 'bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07] font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#00ff66]/10'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Anagrafiche Clienti ({customers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('guida_zucchetti')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'guida_zucchetti'
              ? 'bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07] font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#00ff66]/10'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Formati & Tracciato Ad Hoc</span>
        </button>
      </div>

      {/* ==================== SUB-TAB: LAVORI SVOLTI ==================== */}
      {activeSubTab === 'lavori' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl border bg-white border-[#dadce0] dark:bg-[#07130a] dark:border-[#00ff66]/25">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cerca per cliente, commessa, descrizione..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none transition-all
                    bg-[#f8f9fa] border-[#dadce0] text-slate-800 placeholder:text-slate-400 focus:border-[#1a73e8]
                    dark:bg-[#0c1a10] dark:border-[#00ff66]/40 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#00ff66]"
                />
              </div>

              {/* Activity Filter */}
              <div className="flex items-center gap-1 text-xs">
                <Filter className="w-3 h-3 text-slate-400 dark:text-gray-400" />
                <select
                  value={filterActivity}
                  onChange={(e) => setFilterActivity(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border font-medium bg-white border-[#dadce0] text-slate-700 dark:bg-[#0c1a10] dark:border-[#00ff66]/40 dark:text-white"
                >
                  <option value="all">Tutte le attività ({reports.length})</option>
                  <option value="assistenza tecnica">Assistenza Tecnica ({stats.assistenzaCount})</option>
                  <option value="formazione">Formazione ({stats.formazioneCount})</option>
                  <option value="attivazione linea">Attivazione Linea ({stats.attivazioneCount})</option>
                  <option value="preventivo">Preventivo ({stats.preventivoCount})</option>
                  <option value="vendita">Vendita ({stats.venditaCount})</option>
                </select>
              </div>

              {/* Customer Filter */}
              <select
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border font-medium bg-white border-[#dadce0] text-slate-700 dark:bg-[#0c1a10] dark:border-[#00ff66]/40 dark:text-white"
              >
                <option value="all">Tutti i clienti ({customers.length})</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Export dropdown/buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleExportZucchettiCsv()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all
                  bg-white hover:bg-slate-50 text-slate-700 border-[#dadce0]
                  dark:bg-[#0b160f] dark:hover:bg-[#00260e] dark:text-[#00ff66] dark:border-[#00ff66]/40"
                title="Esporta CSV con separatore ';' per import Ad Hoc"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" />
                <span className="hidden sm:inline">Scarica CSV Ad Hoc</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportZucchettiXml()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all
                  bg-white hover:bg-slate-50 text-slate-700 border-[#dadce0]
                  dark:bg-[#0b160f] dark:hover:bg-[#00260e] dark:text-[#00ff66] dark:border-[#00ff66]/40"
                title="Esporta XML conforme a Zucchetti"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-600 dark:text-[#00ff66]" />
                <span className="hidden sm:inline">XML Ad Hoc</span>
              </button>
            </div>
          </div>

          {/* Reports Grid / Cards List */}
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-[#dadce0] dark:border-[#00ff66]/30 bg-[#f8f9fa] dark:bg-[#061009]">
              <Briefcase className="w-8 h-8 mx-auto text-slate-300 dark:text-gray-600 mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-gray-300">
                Nessuna scheda lavoro trovata con i filtri attuali.
              </p>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                Fai clic su "Nuovo Lavoro" per compilare una nuova lavorazione.
              </p>
              <button
                type="button"
                onClick={handleOpenNewReport}
                className="mt-4 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07]"
              >
                + Registra Primo Lavoro
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredReports.map((report) => {
                const actMeta = activityOptions.find((a) => a.value === report.activityType) || {
                  label: report.activityType,
                  badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
                  requiresHours: false,
                };

                return (
                  <div
                    key={report.id}
                    className="group relative rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between
                      bg-white border-[#dadce0] hover:border-[#1a73e8]/40 hover:shadow-md
                      dark:bg-[#08150c] dark:border-[#00ff66]/25 dark:hover:border-[#00ff66]/60 dark:hover:shadow-[0_0_15px_rgba(0,255,102,0.08)]"
                  >
                    {/* Header: Report #, Date, Status */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-[#1a73e8] dark:text-[#00ff66] flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {report.reportNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${actMeta.badgeColor}`}>
                            {report.activityType}
                          </span>
                          {report.hoursWorked !== undefined && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6] dark:bg-[#002b0c] dark:text-[#00ff66] dark:border-[#00ff66]/40">
                              <Clock className="w-3 h-3" />
                              {report.hoursWorked} ore
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-gray-400 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{report.date}</span>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="mb-2">
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-[#00ff66]" />
                          <span>{report.customerName}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>Cod. Ad Hoc: <strong className="text-slate-700 dark:text-slate-200">{report.customerCode}</strong></span>
                          {report.customerVat && <span>P.IVA: {report.customerVat}</span>}
                          {report.jobReference && (
                            <span className="text-[#1a73e8] dark:text-[#00ff66]">
                              Rif: {report.jobReference}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-700 dark:text-gray-200 line-clamp-3 leading-relaxed bg-slate-50 dark:bg-[#050d07] p-2.5 rounded-lg border border-slate-200 dark:border-emerald-950/40">
                        {report.description}
                      </p>

                      {/* Notes if any */}
                      {report.notes && (
                        <div className="text-[11px] text-slate-500 dark:text-gray-400 italic mt-2">
                          Nota: {report.notes}
                        </div>
                      )}
                    </div>

                    {/* Footer: Technician + Actions */}
                    <div className="pt-3 mt-3 border-t border-[#dadce0] dark:border-[#00ff66]/20 flex items-center justify-between text-xs">
                      <div className="text-[11px] text-slate-500 dark:text-gray-400 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#1a73e8] dark:text-[#00ff66]" />
                        <span className="truncate max-w-[140px]">{report.technician}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Zucchetti CSV Export for single item */}
                        <button
                          type="button"
                          onClick={() => handleExportZucchettiCsv(report)}
                          className="p-1.5 rounded-lg border text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border-slate-200 dark:text-gray-300 dark:hover:text-[#00ff66] dark:hover:bg-[#00220a] dark:border-[#00ff66]/30"
                          title="Esporta questa scheda per Zucchetti Ad Hoc (CSV)"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </button>

                        {/* Print preview */}
                        <button
                          type="button"
                          onClick={() => handlePrintSheet(report)}
                          className="p-1.5 rounded-lg border text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200 dark:text-gray-300 dark:hover:text-[#00ff66] dark:hover:bg-[#00220a] dark:border-[#00ff66]/30"
                          title="Stampa / Scheda Lavorazione"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleEditReport(report)}
                          className="p-1.5 rounded-lg border text-slate-600 hover:text-[#1a73e8] hover:bg-blue-50 border-slate-200 dark:text-gray-300 dark:hover:text-[#00ff66] dark:hover:bg-[#00220a] dark:border-[#00ff66]/30"
                          title="Modifica lavorazione"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteReport(report.id, report.reportNumber)}
                          className="p-1.5 rounded-lg border text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-200 dark:text-gray-500 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 dark:border-rose-900/30"
                          title="Elimina lavorazione"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB-TAB: ANAGRAFICHE CLIENTI ==================== */}
      {activeSubTab === 'anagrafiche' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl border bg-white border-[#dadce0] dark:bg-[#07130a] dark:border-[#00ff66]/25">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
                <span>Registro Anagrafiche Clienti & Codici Conto Zucchetti</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                I codici cliente (es. CLI001) corrispondono al campo COD_CONTO nel piano dei conti di Zucchetti Ad Hoc.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenNewCustomer}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuovo Cliente</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {customers.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl border bg-white border-[#dadce0] dark:bg-[#08150c] dark:border-[#00ff66]/25 flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-50 text-[#1a73e8] border border-blue-200 dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/40">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomer(c.id, c.name)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Elimina cliente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {c.name}
                  </h5>
                  <div className="space-y-1 text-slate-600 dark:text-gray-300">
                    {c.vatNumber && <div>P.IVA / CF: <span className="font-mono">{c.vatNumber}</span></div>}
                    {c.contactPerson && <div>Referente: <strong>{c.contactPerson}</strong></div>}
                    {c.city && <div>Sede: {c.address ? `${c.address}, ` : ''}{c.city}</div>}
                    {c.phone && <div>Tel: <a href={`tel:${c.phone}`} className="text-[#1a73e8] dark:text-[#00ff66]">{c.phone}</a></div>}
                    {c.email && <div>Email: <a href={`mailto:${c.email}`} className="text-[#1a73e8] dark:text-[#00ff66] underline">{c.email}</a></div>}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-emerald-950/40 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Lavori associati: {reports.filter((r) => r.customerCode === c.code).length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterCustomer(c.code);
                      setActiveSubTab('lavori');
                    }}
                    className="font-medium text-[#1a73e8] dark:text-[#00ff66] hover:underline flex items-center gap-0.5"
                  >
                    <span>Vedi lavori</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB: GUIDA IMPORT ZUCCHETTI ==================== */}
      {activeSubTab === 'guida_zucchetti' && (
        <div className="p-4 rounded-xl border bg-white border-[#dadce0] dark:bg-[#08150c] dark:border-[#00ff66]/25 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b pb-3 border-[#dadce0] dark:border-[#00ff66]/30">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-[#00ff66]" />
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Procedura di Importazione in Zucchetti Ad Hoc Revolution / Enterprise
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">
                I file CSV generati sono formattati esattamente secondo le specifiche del modulo di importazione esterna Ad Hoc.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
            <div className="p-3 rounded-lg border bg-slate-50 border-slate-200 dark:bg-[#040c06] dark:border-[#00ff66]/20">
              <div className="font-bold text-slate-900 dark:text-[#00ff66] mb-1">
                Passo 1: Genera il File
              </div>
              <p className="text-slate-600 dark:text-gray-300">
                Clicca su "Esporta Ad Hoc (CSV)" o "Scarica CSV Ad Hoc". Viene creato un file con separatore punto e virgola (<code className="font-mono font-bold text-emerald-700 dark:text-[#00ff66]">{';'}</code>) e codifica UTF-8 con BOM per garantire la perfetta lettura dei caratteri accentati italiani.
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-slate-50 border-slate-200 dark:bg-[#040c06] dark:border-[#00ff66]/20">
              <div className="font-bold text-slate-900 dark:text-[#00ff66] mb-1">
                Passo 2: Apri Zucchetti Ad Hoc
              </div>
              <p className="text-slate-600 dark:text-gray-300">
                Nel menu di Ad Hoc, naviga su: <br />
                <code className="font-mono text-[11px] bg-white dark:bg-black p-1 rounded inline-block mt-1 border">
                  Strumenti &gt; Utilità &gt; Importazione Dati da File Esterno
                </code><br />
                Oppure seleziona il modulo <em>"Rapportini / Lavorazioni Esterne / Avanzamento Commesse"</em>.
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-slate-50 border-slate-200 dark:bg-[#040c06] dark:border-[#00ff66]/20">
              <div className="font-bold text-slate-900 dark:text-[#00ff66] mb-1">
                Passo 3: Mappatura Colonne
              </div>
              <p className="text-slate-600 dark:text-gray-300">
                Il tracciato standard include:
                <br />
                <code className="font-mono text-[10px] text-emerald-800 dark:text-[#00ff66] leading-tight block mt-1">
                  DATA;COD_CONTO;RAGIONE_SOCIALE;TIPO_ATTIVITA;ORE_LAVORATE;NOTE_LAVORAZIONE;TECNICO;RIF_COMMESSA;STATO;PARTITA_IVA;NUM_RAPPORTO
                </code>
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200 dark:bg-[#00220a] dark:border-[#00ff66]/40 text-emerald-900 dark:text-emerald-200">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#00ff66]" />
              <span>Compatibilità Ore Lavorate per Formazione & Assistenza Tecnica</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Nei record con attività <strong>formazione</strong> e <strong>assistenza tecnica</strong>, la colonna <code className="font-mono font-bold">ORE_LAVORATE</code> viene valorizzata in formato decimale compatibile Zucchetti (es. 2,50 ore), consentendo la fatturazione oraria automatica o l'imputazione sul monte ore del contratto di manutenzione cliente.
            </p>
          </div>
        </div>
      )}

      {/* ==================== MODAL: NUOVO / MODIFICA RAPPORTO LAVORO ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="matrix-card-glow w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border transition-all
            bg-white border-[#dadce0] text-slate-900
            dark:bg-[#061208] dark:border-[#00ff66]/50 dark:text-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#dadce0] dark:border-[#00ff66]/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#1a73e8]/10 text-[#1a73e8] dark:bg-[#00ff66]/15 dark:text-[#00ff66]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {editingReportId ? 'Modifica Lavorazione' : 'Nuovo Rapportino Lavoro'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    Compila i dettagli dell'intervento tecnico per l'esportazione verso Zucchetti Ad Hoc.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-[#00ff66]/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveReport} className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Data */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-gray-300">
                    Data Intervento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border font-mono bg-white border-[#dadce0] dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#00ff66]"
                  />
                </div>

                {/* Tecnico */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-gray-300">
                    Tecnico Operatore *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.technician}
                    onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-white border-[#dadce0] dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#00ff66]"
                    placeholder="IO-IT / Tecnico Senior"
                  />
                </div>
              </div>

              {/* Anagrafica Cliente */}
              <div className="p-3 rounded-xl border bg-slate-50/70 border-slate-200 dark:bg-[#040e07] dark:border-[#00ff66]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#1a73e8] dark:text-[#00ff66]" />
                    <span>Seleziona Cliente dall'Anagrafica *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenNewCustomer}
                    className="text-[11px] text-[#1a73e8] dark:text-[#00ff66] hover:underline font-medium"
                  >
                    + Aggiungi Nuovo Cliente
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={formData.customerCode}
                      onChange={(e) => handleSelectCustomer(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border font-medium bg-white border-[#dadce0] text-slate-800 dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.code}>
                          [{c.code}] {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="text"
                      readOnly
                      value={formData.customerVat ? `P.IVA: ${formData.customerVat}` : 'Cod. ' + formData.customerCode}
                      className="w-full px-2.5 py-2 rounded-lg border bg-slate-100 text-slate-500 font-mono text-[11px] border-slate-200 dark:bg-[#020703] dark:border-emerald-950 dark:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Attività Svolta & Ore Lavoro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Attività scelta (strict user list) */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-gray-300">
                    Attività Svolta (Zucchetti Ad Hoc) *
                  </label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value as WorkActivityType })}
                    className="w-full px-3 py-2 rounded-lg border font-bold text-xs bg-white border-[#dadce0] text-slate-900 dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#00ff66]"
                  >
                    {activityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} {opt.requiresHours ? '(Ore richieste)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ore Lavoro Svolte (Condizionale & Prominente per formazione ed assistenza tecnica) */}
                <div>
                  <label className="flex items-center justify-between font-semibold mb-1 text-slate-700 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" />
                      <span>Ore di Lavoro Svolte {isHoursEnabled ? '*' : '(Opzionali)'}</span>
                    </span>
                    {isHoursEnabled && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-[#00ff66] font-bold">
                        Richiesto per {formData.activityType}
                      </span>
                    )}
                  </label>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={formData.hoursWorked}
                      onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                      placeholder={isHoursEnabled ? 'Es. 2.5' : 'N/A'}
                      disabled={!isHoursEnabled}
                      required={isHoursEnabled}
                      className={`w-full px-3 py-2 rounded-lg border font-mono font-bold text-sm focus:outline-none transition-all ${
                        isHoursEnabled
                          ? 'bg-white border-emerald-500 text-emerald-800 dark:bg-[#00220a] dark:border-[#00ff66] dark:text-[#00ff66]'
                          : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-[#040c06] dark:border-emerald-950 dark:text-gray-600'
                      }`}
                    />

                    {isHoursEnabled && (
                      <div className="flex items-center gap-1 shrink-0">
                        {['1', '2', '3.5', '4'].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setFormData({ ...formData, hoursWorked: h })}
                            className="px-2 py-1 rounded text-[10px] font-mono font-bold border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-[#0c1c11] dark:hover:bg-[#003810] dark:text-[#00ff66] dark:border-[#00ff66]/40"
                          >
                            {h}h
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                    {isHoursEnabled
                      ? 'Inserisci le ore (es. 1.5, 2.0). Saranno importate nella colonna ORE_LAVORATE di Ad Hoc.'
                      : 'Ore non richieste per questa tipologia di attività.'}
                  </p>
                </div>
              </div>

              {/* Riferimento Commessa & Stato */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-gray-300">
                    Riferimento Commessa / Ticket Ad Hoc
                  </label>
                  <input
                    type="text"
                    value={formData.jobReference}
                    onChange={(e) => setFormData({ ...formData, jobReference: e.target.value })}
                    placeholder="Es. TK-9042 o COMM-2026-A"
                    className="w-full px-3 py-2 rounded-lg border font-mono bg-white border-[#dadce0] dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-gray-300">
                    Stato Lavorazione
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border bg-white border-[#dadce0] text-slate-800 dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none"
                  >
                    <option value="completato">Completato</option>
                    <option value="da_fatturare">Da Fatturare</option>
                    <option value="in_corso">In Corso / Sospeso</option>
                    <option value="garanzia">In Garanzia / Canone</option>
                  </select>
                </div>
              </div>

              {/* Descrizione / Intervento svolto */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-gray-300">
                  Descrizione Attività Svolta *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Dettaglio delle operazioni svolte, apparati configurati o argomenti formativi..."
                  className="w-full p-2.5 rounded-lg border bg-white border-[#dadce0] text-slate-800 dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#00ff66] font-sans"
                />
              </div>

              {/* Note interne */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-gray-300">
                  Note Interne Aggiuntive (Opzionale)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Es. Consegnata documentazione di rete, credenziali comunicate al referente..."
                  className="w-full px-3 py-1.5 rounded-lg border bg-white border-[#dadce0] dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#dadce0] dark:border-[#00ff66]/30 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 dark:text-gray-400">
                  Formato Zucchetti Ad Hoc conforme
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg border font-medium text-slate-600 hover:bg-slate-100 border-[#dadce0] dark:text-gray-300 dark:hover:bg-[#00ff66]/10 dark:border-[#00ff66]/30"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg font-bold bg-[#1a73e8] hover:bg-[#1557b0] text-white dark:bg-[#00ff66] dark:text-[#050b07] dark:hover:bg-[#00cc52]"
                  >
                    {editingReportId ? 'Salva Modifiche' : 'Registra Lavorazione'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ANAGRAFICA CLIENTE ==================== */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="matrix-card-glow w-full max-w-lg rounded-2xl shadow-2xl border transition-all
            bg-white border-[#dadce0] text-slate-900
            dark:bg-[#061208] dark:border-[#00ff66]/50 dark:text-gray-100">
            <div className="flex items-center justify-between p-4 border-b border-[#dadce0] dark:border-[#00ff66]/30">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
                <h3 className="font-bold text-sm sm:text-base">Anagrafica Cliente Ad Hoc</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold mb-1">Codice Conto Ad Hoc *</label>
                  <input
                    type="text"
                    required
                    value={custFormData.code}
                    onChange={(e) => setCustFormData({ ...custFormData, code: e.target.value.toUpperCase() })}
                    placeholder="CLI001"
                    className="w-full px-3 py-1.5 rounded-lg border font-mono bg-white border-[#dadce0] dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Partita IVA / C.F.</label>
                  <input
                    type="text"
                    value={custFormData.vatNumber || ''}
                    onChange={(e) => setCustFormData({ ...custFormData, vatNumber: e.target.value })}
                    placeholder="IT01234567891"
                    className="w-full px-3 py-1.5 rounded-lg border font-mono bg-white border-[#dadce0] dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Ragione Sociale Azienda *</label>
                <input
                  type="text"
                  required
                  value={custFormData.name}
                  onChange={(e) => setCustFormData({ ...custFormData, name: e.target.value })}
                  placeholder="Es. Studio Tecnico Rossi Srl"
                  className="w-full px-3 py-1.5 rounded-lg border bg-white border-[#dadce0] dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold mb-1">Referente / Contatto</label>
                  <input
                    type="text"
                    value={custFormData.contactPerson || ''}
                    onChange={(e) => setCustFormData({ ...custFormData, contactPerson: e.target.value })}
                    placeholder="Ing. Marco Rossi"
                    className="w-full px-3 py-1.5 rounded-lg border bg-white border-[#dadce0] dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Città / Prov</label>
                  <input
                    type="text"
                    value={custFormData.city || ''}
                    onChange={(e) => setCustFormData({ ...custFormData, city: e.target.value })}
                    placeholder="Milano (MI)"
                    className="w-full px-3 py-1.5 rounded-lg border bg-white border-[#dadce0] dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold mb-1">Telefono</label>
                  <input
                    type="text"
                    value={custFormData.phone || ''}
                    onChange={(e) => setCustFormData({ ...custFormData, phone: e.target.value })}
                    placeholder="+39 02 ..."
                    className="w-full px-3 py-1.5 rounded-lg border bg-white border-[#dadce0] dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={custFormData.email || ''}
                    onChange={(e) => setCustFormData({ ...custFormData, email: e.target.value })}
                    placeholder="info@cliente.it"
                    className="w-full px-3 py-1.5 rounded-lg border bg-white border-[#dadce0] dark:bg-[#09160e] dark:border-[#00ff66]/40 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#dadce0] dark:border-[#00ff66]/30 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600 hover:bg-slate-100 border-[#dadce0] dark:text-gray-300 dark:hover:bg-[#00ff66]/10"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-bold bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07]"
                >
                  Salva Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden printable sheet for browser window.print() */}
      {selectedReportForPrint && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-8 z-[9999] font-sans">
          <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider">Rapportino Tecnico di Intervento</h1>
              <div className="text-sm">IO-IT Sistemi & Infrastrutture IT</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-bold">{selectedReportForPrint.reportNumber}</div>
              <div className="text-sm">Data: {selectedReportForPrint.date}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 border p-3 rounded">
            <div>
              <div className="text-xs uppercase text-gray-500 font-bold">Cliente</div>
              <div className="font-bold text-base">{selectedReportForPrint.customerName}</div>
              <div>Codice Conto Ad Hoc: <strong>{selectedReportForPrint.customerCode}</strong></div>
              <div>P.IVA / CF: {selectedReportForPrint.customerVat || 'N/D'}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500 font-bold">Dettagli Commessa</div>
              <div>Attività: <strong className="uppercase">{selectedReportForPrint.activityType}</strong></div>
              <div>Ore Lavorate: <strong>{selectedReportForPrint.hoursWorked ? `${selectedReportForPrint.hoursWorked} ore` : 'N/A'}</strong></div>
              <div>Riferimento: {selectedReportForPrint.jobReference || 'N/D'}</div>
              <div>Tecnico: {selectedReportForPrint.technician}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs uppercase text-gray-500 font-bold mb-1">Descrizione Lavorazione Svolta</div>
            <div className="p-3 border rounded min-h-[140px] text-sm whitespace-pre-wrap">
              {selectedReportForPrint.description}
            </div>
          </div>

          {selectedReportForPrint.notes && (
            <div className="mb-6">
              <div className="text-xs uppercase text-gray-500 font-bold mb-1">Note & Prescrizioni Tecniche</div>
              <div className="p-2 border rounded text-xs italic">
                {selectedReportForPrint.notes}
              </div>
            </div>
          )}

          <div className="mt-12 pt-4 border-t grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="mb-10 font-bold">Firma del Tecnico Operatore</div>
              <div className="border-t border-dashed border-gray-400 mx-8 pt-1">
                {selectedReportForPrint.technician}
              </div>
            </div>
            <div>
              <div className="mb-10 font-bold">Firma per Accettazione Cliente</div>
              <div className="border-t border-dashed border-gray-400 mx-8 pt-1">
                Timbro e Firma Legale Rappresentante
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
