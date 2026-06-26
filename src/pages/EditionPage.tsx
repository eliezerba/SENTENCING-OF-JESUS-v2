/**
 * EditionPage – LERA-style synoptic text edition.
 *
 * Layout:
 *   Left panel  : AccordionToc (hierarchical text key)
 *   Centre      : TextUnitCard (synoptic columns per witness)
 *   Right panel : WitnessSelector + DisplayMode controls + ColorLegend
 *
 * The active unit is stored in AppContext and synced to the URL hash
 * so deep-linking works (e.g. #/edition?unit=3.5).
 */
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/index';
import { AccordionToc } from '../components/AccordionToc';
import { WitnessSelector } from '../components/WitnessSelector';
import { TextUnitCard } from '../components/TextUnitCard';
import type { DisplayMode } from '../data/types';

function ColorLegend({ uiLang }: { uiLang: 'he' | 'en' }) {
  const s = t(uiLang);
  return (
    <div className="color-legend">
      <h3 className="color-legend__title">{s.colorLegend}</h3>
      <ul className="color-legend__list">
        <li>
          <span className="text--editorial">{'}'}{uiLang === 'he' ? 'דוגמה' : 'example'}{'{'}</span>
          <span>{s.editorialContent}</span>
        </li>
        <li>
          <span className="text--restoration">{'['}…{']'}</span>
          <span>{uiLang === 'he' ? 'שחזור עורכי' : 'Editorial restoration'}</span>
        </li>
        <li>
          <span className="reading-col--unverified-sample">⚠</span>
          <span>{s.unverifiedExtraction}</span>
        </li>
      </ul>
    </div>
  );
}

export function EditionPage() {
  const { uiLang, data, activeUnitId, setActiveUnitId, displayMode, setDisplayMode, selectedWitnesses } =
    useApp();
  const s = t(uiLang);
  const dir = uiLang === 'he' ? 'rtl' : 'ltr';
  const [searchParams, setSearchParams] = useSearchParams();
  const readingAreaRef = useRef<HTMLDivElement>(null);

  // Sync activeUnitId ↔ URL ?unit=
  useEffect(() => {
    const urlUnit = searchParams.get('unit');
    if (urlUnit && data.unitMap.has(urlUnit)) {
      setActiveUnitId(urlUnit);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeUnitId) {
      setSearchParams({ unit: activeUnitId }, { replace: true });
    }
  }, [activeUnitId, setSearchParams]);

  // Scroll active unit into view when it changes
  useEffect(() => {
    if (!activeUnitId || !readingAreaRef.current) return;
    const el = readingAreaRef.current.querySelector(`#unit-${CSS.escape(activeUnitId)}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeUnitId]);

  const activeUnit = activeUnitId ? data.unitMap.get(activeUnitId) : null;

  function handleTocSelect(unitId: string) {
    setActiveUnitId(unitId);
  }

  const displayModeOptions: { value: DisplayMode; label: string }[] = [
    { value: 'source', label: s.sourceOnly },
    { value: 'both', label: s.sourceAndTranslation },
    { value: 'translation', label: s.translationOnly },
  ];

  return (
    <div className="edition-page" dir={dir}>
      {/* ── Left: Text Key ── */}
      <aside className="edition-toc" aria-label={s.textKey}>
        <h2 className="edition-toc__heading">{s.textKey}</h2>
        <AccordionToc onSelectUnit={handleTocSelect} />
      </aside>

      {/* ── Centre: Reading Area ── */}
      <div className="edition-reading" ref={readingAreaRef}>
        {/* Controls bar */}
        <div className="edition-controls">
          <div className="edition-controls__mode" role="group" aria-label={s.displayMode}>
            <span className="edition-controls__label">{s.displayMode}:</span>
            {displayModeOptions.map((opt) => (
              <button
                key={opt.value}
                className={`btn btn--mode ${displayMode === opt.value ? 'btn--mode-active' : ''}`}
                onClick={() => setDisplayMode(opt.value)}
                aria-pressed={displayMode === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {activeUnit && (
            <div className="edition-controls__active-unit">
              <span className="edition-controls__unit-id">{activeUnit.id}</span>
              <span className="edition-controls__unit-title">{activeUnit.chapterTheme}</span>
            </div>
          )}
        </div>

        {/* Witness column headers (sticky) */}
        {selectedWitnesses.length > 0 && (
          <div
            className="edition-witness-strip"
            style={{ gridTemplateColumns: `repeat(${selectedWitnesses.length}, 1fr)` }}
          >
            {selectedWitnesses.map((wid) => {
              const wit = data.witnessMap.get(wid);
              return (
                <div key={wid} className={`edition-witness-strip__col edition-witness-strip__col--${wit?.language ?? 'unknown'}`}>
                  <strong>{wid}</strong>
                  {wit && <span className={`lang-badge lang-badge--${wit.language}`}>{wit.language}</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Units display */}
        {selectedWitnesses.length === 0 ? (
          <div className="edition-empty">
            <p>{uiLang === 'he' ? 'בחר עדי נוסח כדי להציג את הטקסט' : 'Select witnesses to display the text'}</p>
          </div>
        ) : activeUnit ? (
          /* Show active unit only (single-unit focus mode) */
          <TextUnitCard unit={activeUnit} selectedWitnesses={selectedWitnesses} />
        ) : (
          <div className="edition-empty">
            <p>{uiLang === 'he' ? 'בחר יחידת טקסט ממפתח הטקסט' : 'Select a text unit from the text key'}</p>
          </div>
        )}

        {/* Navigation between units */}
        {activeUnit && (
          <div className="edition-unit-nav">
            {activeUnit.order > 1 && (
              <button
                className="btn btn--nav"
                onClick={() => setActiveUnitId(data.units[activeUnit.order - 2].id)}
              >
                {uiLang === 'he' ? '← הקודם' : '← Previous'}
              </button>
            )}
            <span className="edition-unit-nav__pos">
              {activeUnit.order} / {data.units.length}
            </span>
            {activeUnit.order < data.units.length && (
              <button
                className="btn btn--nav"
                onClick={() => setActiveUnitId(data.units[activeUnit.order].id)}
              >
                {uiLang === 'he' ? 'הבא →' : 'Next →'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Right: Controls ── */}
      <aside className="edition-sidebar" aria-label={s.selectWitnesses}>
        <section className="edition-sidebar__section">
          <h3 className="edition-sidebar__heading">{s.selectWitnesses}</h3>
          <WitnessSelector />
        </section>
        <section className="edition-sidebar__section">
          <ColorLegend uiLang={uiLang} />
        </section>
      </aside>
    </div>
  );
}
