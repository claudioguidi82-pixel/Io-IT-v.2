import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SystemLogItem, LogCategory, LogLevel } from '../types';

interface LogContextType {
  logs: SystemLogItem[];
  addLog: (entry: {
    category: LogCategory;
    level: LogLevel;
    title: string;
    details?: string;
    durationMs?: number;
    rawPayload?: any;
  }) => void;
  clearLogs: () => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

const STORAGE_KEY = 'io_it_system_logs';

function formatTimestamp(): { time: string; date: string } {
  const now = new Date();
  const time = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
  const date = now.toLocaleDateString('it-IT');
  return { time, date };
}

export const LogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<SystemLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Errore lettura log da localStorage:', e);
    }
    const { time, date } = formatTimestamp();
    return [
      {
        id: 'boot-' + Date.now(),
        timestamp: time,
        dateStr: date,
        category: 'SYSTEM',
        level: 'INFO',
        title: 'Motore IO-IT v3.8 Inizializzato',
        details: 'Moduli pronti: Diagnostica Guasti (3CX, Zucchetti, Windows, Rete), Speedtest Ookla, Storico Reti, Blocco Note.',
      },
    ];
  });

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-200)));
    } catch (e) {
      console.warn('Errore salvataggio log in localStorage:', e);
    }
  }, [logs]);

  const addLog = useCallback(
    (entry: {
      category: LogCategory;
      level: LogLevel;
      title: string;
      details?: string;
      durationMs?: number;
      rawPayload?: any;
    }) => {
      const { time, date } = formatTimestamp();
      const newLog: SystemLogItem = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        timestamp: time,
        dateStr: date,
        category: entry.category,
        level: entry.level,
        title: entry.title,
        details: entry.details,
        durationMs: entry.durationMs,
        rawPayload: entry.rawPayload,
      };

      setLogs((prev) => [...prev, newLog]);
    },
    []
  );

  const clearLogs = useCallback(() => {
    const { time, date } = formatTimestamp();
    const resetLog: SystemLogItem = {
      id: 'reset-' + Date.now(),
      timestamp: time,
      dateStr: date,
      category: 'SYSTEM',
      level: 'INFO',
      title: 'Console log resettata manualmente',
      details: 'Tutti gli eventi storici sono stati rimossi.',
    };
    setLogs([resetLog]);
  }, []);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  return (
    <LogContext.Provider
      value={{
        logs,
        addLog,
        clearLogs,
        isDrawerOpen,
        toggleDrawer,
        setDrawerOpen,
      }}
    >
      {children}
    </LogContext.Provider>
  );
};

export function useSystemLogs() {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useSystemLogs must be used within a LogProvider');
  }
  return context;
}
