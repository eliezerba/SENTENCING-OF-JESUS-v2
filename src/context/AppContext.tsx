import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DisplayMode, EditionData } from '../data/types';
import type { UILanguage } from '../i18n/index';
import { getEditionData } from '../data/loader';

interface AppState {
  uiLang: UILanguage;
  displayMode: DisplayMode;
  selectedWitnesses: string[];
  activeUnitId: string | null;
  data: EditionData;
}

interface AppActions {
  setUiLang: (lang: UILanguage) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  toggleWitness: (id: string) => void;
  setSelectedWitnesses: (ids: string[]) => void;
  setActiveUnitId: (id: string | null) => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const data = useMemo(() => getEditionData(), []);

  const [uiLang, setUiLang] = useState<UILanguage>('he');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('both');
  const [selectedWitnesses, setSelectedWitnesses] = useState<string[]>(() => {
    // Default: one witness from each main language group for a meaningful first view.
    // Heb1 has the broadest Hebrew coverage; Ar1 broadest Aramaic; JA1 broadest Judaeo-Arabic.
    const preferred = ['Heb1', 'Ar1', 'JA1'];
    const available = data.witnesses.map((w) => w.id);
    const defaults = preferred.filter((id) => available.includes(id));
    return defaults.length > 0 ? defaults : available.slice(0, 2);
  });
  const [activeUnitId, setActiveUnitId] = useState<string | null>(
    data.units[0]?.id ?? null,
  );

  const toggleWitness = useCallback(
    (id: string) => {
      setSelectedWitnesses((prev) =>
        prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      uiLang,
      displayMode,
      selectedWitnesses,
      activeUnitId,
      data,
      setUiLang,
      setDisplayMode,
      toggleWitness,
      setSelectedWitnesses,
      setActiveUnitId,
    }),
    [uiLang, displayMode, selectedWitnesses, activeUnitId, data, toggleWitness],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState & AppActions {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
