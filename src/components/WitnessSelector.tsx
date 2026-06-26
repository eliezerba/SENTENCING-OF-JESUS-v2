import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/index';
import type { Language } from '../data/types';

const LANGUAGE_ORDER: Language[] = ['hebrew', 'aramaic', 'judaeo-arabic', 'indirect', 'unknown'];

function langLabel(lang: Language, uiLang: 'he' | 'en'): string {
  const s = t(uiLang);
  switch (lang) {
    case 'hebrew': return s.langHebrew;
    case 'aramaic': return s.langAramaic;
    case 'judaeo-arabic': return s.langJudaeoArabic;
    case 'indirect': return s.langIndirect;
    default: return s.langUnknown;
  }
}

export function WitnessSelector() {
  const { uiLang, data, selectedWitnesses, toggleWitness, setSelectedWitnesses } = useApp();
  const s = t(uiLang);
  const [langFilter, setLangFilter] = useState<Language | 'all'>('all');

  const visibleWitnesses = data.witnesses.filter(
    (w) => langFilter === 'all' || w.language === langFilter,
  );

  const availableLangs = Array.from(new Set(data.witnesses.map((w) => w.language))).sort(
    (a, b) => LANGUAGE_ORDER.indexOf(a) - LANGUAGE_ORDER.indexOf(b),
  );

  function selectAll() {
    setSelectedWitnesses(visibleWitnesses.map((w) => w.id));
  }

  function deselectAll() {
    const visibleIds = new Set(visibleWitnesses.map((w) => w.id));
    setSelectedWitnesses(selectedWitnesses.filter((id) => !visibleIds.has(id)));
  }

  return (
    <div className="witness-selector">
      <div className="witness-selector__filter">
        <label className="witness-selector__filter-label">{s.filterByLanguage}:</label>
        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value as Language | 'all')}
          className="witness-selector__select"
        >
          <option value="all">{s.allLanguages}</option>
          {availableLangs.map((lang) => (
            <option key={lang} value={lang}>
              {langLabel(lang, uiLang)}
            </option>
          ))}
        </select>
        <button className="btn btn--small" onClick={selectAll}>✓</button>
        <button className="btn btn--small" onClick={deselectAll}>✕</button>
      </div>
      <div className="witness-selector__list">
        {visibleWitnesses.map((w) => {
          const isSelected = selectedWitnesses.includes(w.id);
          return (
            <button
              key={w.id}
              className={`witness-chip ${isSelected ? 'witness-chip--selected' : ''} witness-chip--lang-${w.language}`}
              onClick={() => toggleWitness(w.id)}
              aria-pressed={isSelected}
              title={`${langLabel(w.language, uiLang)} · ${w.sectionCount} ${s.sections}`}
            >
              <span className="witness-chip__siglum">{w.siglum}</span>
              <span className="witness-chip__lang">{langLabel(w.language, uiLang)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
