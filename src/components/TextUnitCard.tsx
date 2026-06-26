/**
 * TextUnitCard – displays one TextUnit in synoptic (LERA) mode.
 * Each selected witness gets its own column.
 */
import React from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/index';
import type { TextUnit, WitnessReading } from '../data/types';

// ---------------------------------------------------------------------------
// Text formatting
// ---------------------------------------------------------------------------

/**
 * Renders source text with colour coding:
 *   }...{  → editorial content (purple)
 *   digits at end of word (footnote refs) → small, muted
 */
function FormattedSourceText({ text }: { text: string }) {
  if (!text) return <span className="text--empty">—</span>;

  // Split by }...{ pattern and footnote refs
  // We process character by character to handle these markers
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Reversed curly braces: }...{
    const revStart = remaining.indexOf('}');
    // Regular editorial [...]
    const sqStart = remaining.indexOf('[');
    // Footnote: number followed by whitespace or end of word (look for 1-2 digits after a character boundary)

    const nextSpecial = Math.min(
      revStart >= 0 ? revStart : Infinity,
      sqStart >= 0 ? sqStart : Infinity,
    );

    if (nextSpecial === Infinity) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    // Text before the special marker
    if (nextSpecial > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, nextSpecial)}</span>);
      remaining = remaining.slice(nextSpecial);
    }

    if (remaining.startsWith('}')) {
      // Find closing {
      const end = remaining.indexOf('{', 1);
      if (end >= 0) {
        const inner = remaining.slice(1, end);
        parts.push(
          <span key={key++} className="text--editorial" title="editorial addition">
            {'}'}
            {inner}
            {'{'}
          </span>,
        );
        remaining = remaining.slice(end + 1);
      } else {
        parts.push(<span key={key++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }
    } else if (remaining.startsWith('[')) {
      const end = remaining.indexOf(']', 1);
      if (end >= 0) {
        const inner = remaining.slice(1, end);
        parts.push(
          <span key={key++} className="text--restoration" title="editorial restoration">
            {'['}
            {inner}
            {']'}
          </span>,
        );
        remaining = remaining.slice(end + 1);
      } else {
        parts.push(<span key={key++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }
    } else {
      parts.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }

  return <>{parts}</>;
}

// ---------------------------------------------------------------------------
// Single witness reading column
// ---------------------------------------------------------------------------

function WitnessReadingColumn({
  unitId,
  reading,
  displayMode,
}: {
  unitId: string;
  reading: WitnessReading | undefined;
  displayMode: 'source' | 'both' | 'translation';
}) {
  const { uiLang } = useApp();
  const s = t(uiLang);

  const isRtlLang =
    reading?.language === 'hebrew' ||
    reading?.language === 'aramaic' ||
    reading?.language === 'judaeo-arabic';

  if (!reading) {
    return (
      <div className="reading-col reading-col--absent">
        <p className="reading-col__empty">{s.noReadingForWitness}</p>
      </div>
    );
  }

  return (
    <div
      className={`reading-col reading-col--lang-${reading.language} ${!reading.verified ? 'reading-col--unverified' : ''}`}
      data-unit={unitId}
      data-witness={reading.witnessId}
    >
      {!reading.verified && (
        <div className="reading-col__unverified-badge" title={s.unverifiedExtraction}>
          ⚠
        </div>
      )}
      {(displayMode === 'source' || displayMode === 'both') && reading.sourceText && (
        <div
          className="reading-col__source"
          dir={isRtlLang ? 'rtl' : 'ltr'}
          lang={reading.language === 'hebrew' ? 'he' : reading.language === 'aramaic' ? 'arc' : undefined}
        >
          <FormattedSourceText text={reading.sourceText} />
        </div>
      )}
      {displayMode === 'both' && reading.sourceText && reading.translation && (
        <hr className="reading-col__divider" />
      )}
      {(displayMode === 'translation' || displayMode === 'both') && reading.translation && (
        <div className="reading-col__translation" dir="ltr" lang="en">
          {reading.translation}
        </div>
      )}
      {!reading.sourceText && !reading.translation && (
        <p className="reading-col__empty">{s.noReadingForWitness}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TextUnitCard – the main export
// ---------------------------------------------------------------------------

interface TextUnitCardProps {
  unit: TextUnit;
  selectedWitnesses: string[];
}

export function TextUnitCard({ unit, selectedWitnesses }: TextUnitCardProps) {
  const { displayMode, uiLang } = useApp();

  const readingMap = new Map(unit.readings.map((r) => [r.witnessId, r]));

  return (
    <article className="text-unit-card" id={`unit-${unit.id}`}>
      <header className="text-unit-card__header">
        <span className="text-unit-card__id">{unit.id}</span>
        <h2 className="text-unit-card__title">{unit.shortTitle}</h2>
        {unit.readings[0]?.sectionNotes && (
          <details className="text-unit-card__notes">
            <summary>{uiLang === 'he' ? 'הערות' : 'Notes'}</summary>
            <p>{unit.readings[0].sectionNotes}</p>
          </details>
        )}
      </header>
      <div
        className="text-unit-card__columns"
        style={{ gridTemplateColumns: `repeat(${selectedWitnesses.length}, 1fr)` }}
      >
        {selectedWitnesses.map((wid) => (
          <div key={wid} className="text-unit-card__column-wrap">
            <div className="text-unit-card__witness-header">
              <span className="text-unit-card__witness-siglum">{wid}</span>
              {readingMap.get(wid) && (
                <span className={`lang-badge lang-badge--${readingMap.get(wid)!.language}`}>
                  {readingMap.get(wid)!.language}
                </span>
              )}
            </div>
            <WitnessReadingColumn
              unitId={unit.id}
              reading={readingMap.get(wid)}
              displayMode={displayMode}
            />
          </div>
        ))}
      </div>
    </article>
  );
}
