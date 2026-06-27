/**
 * TextUnitCard – displays one TextUnit in synoptic (LERA) mode.
 * Each selected witness gets its own column.
 */
import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/index';
import type { TextUnit, WitnessReading } from '../data/types';

// ---------------------------------------------------------------------------
// Text formatting
// ---------------------------------------------------------------------------

/**
 * Renders source text with colour coding:
 *   }...{  → editorial content (purple)
 *   numeric footnote refs → linked superscript markers
 */
function parseFootnotes(sectionNotes: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!sectionNotes.trim()) return map;

  // Notes are encoded as blocks that start with a number on its own line.
  const rx = /(?:^|\n)\s*(\d{1,3})\s*\n([\s\S]*?)(?=(?:\n\s*\d{1,3}\s*\n)|$)/g;
  let match: RegExpExecArray | null = rx.exec(sectionNotes);
  while (match) {
    const number = match[1].trim();
    const text = match[2].trim().replace(/\n{3,}/g, '\n\n');
    if (text.length > 0) map.set(number, text);
    match = rx.exec(sectionNotes);
  }

  return map;
}

function renderPlainSegmentWithFootnotes(
  text: string,
  unitId: string,
  witnessId: string,
  footnotes: Map<string, string>,
  seenNumbers: Set<string>,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const parts = text.split(/(\d{1,3})/g);
  let key = 0;

  for (const part of parts) {
    if (/^\d{1,3}$/.test(part) && footnotes.has(part)) {
      const isFirstForThisWitness = !seenNumbers.has(part);
      if (isFirstForThisWitness) seenNumbers.add(part);
      const refId = isFirstForThisWitness ? `fnref-${unitId}-${witnessId}-${part}` : undefined;
      nodes.push(
        <sup key={`fn-${key++}`} className="text-footnote-ref">
          <a id={refId} href={`#fn-${unitId}-${part}`}>
            {part}
          </a>
        </sup>,
      );
    } else if (part.length > 0) {
      nodes.push(<span key={`txt-${key++}`}>{part}</span>);
    }
  }

  return nodes;
}

function FormattedSourceText({
  text,
  unitId,
  witnessId,
  footnotes,
}: {
  text: string;
  unitId: string;
  witnessId: string;
  footnotes: Map<string, string>;
}) {
  if (!text) return <span className="text--empty">—</span>;

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  const seenNumbers = new Set<string>();

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
      parts.push(
        <React.Fragment key={key++}>
          {renderPlainSegmentWithFootnotes(remaining, unitId, witnessId, footnotes, seenNumbers)}
        </React.Fragment>,
      );
      break;
    }

    // Text before the special marker
    if (nextSpecial > 0) {
      parts.push(
        <React.Fragment key={key++}>
          {renderPlainSegmentWithFootnotes(
            remaining.slice(0, nextSpecial),
            unitId,
            witnessId,
            footnotes,
            seenNumbers,
          )}
        </React.Fragment>,
      );
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
  footnotes,
}: {
  unitId: string;
  reading: WitnessReading | undefined;
  displayMode: 'source' | 'both' | 'translation';
  footnotes: Map<string, string>;
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
          <FormattedSourceText
            text={reading.sourceText}
            unitId={unitId}
            witnessId={reading.witnessId}
            footnotes={footnotes}
          />
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
  const sectionNotesRaw = unit.readings.find((r) => r.sectionNotes.trim().length > 0)?.sectionNotes ?? '';

  const footnotes = useMemo(() => parseFootnotes(sectionNotesRaw), [sectionNotesRaw]);
  const footnoteEntries = useMemo(
    () =>
      Array.from(footnotes.entries()).sort(
        ([a], [b]) => parseInt(a, 10) - parseInt(b, 10),
      ),
    [footnotes],
  );

  const refTargetForFootnote = useMemo(() => {
    const targets = new Map<string, string>();
    for (const [num] of footnoteEntries) {
      for (const wid of selectedWitnesses) {
        const source = readingMap.get(wid)?.sourceText ?? '';
        const rx = new RegExp(`(^|\\D)${num}(?!\\d)`);
        if (rx.test(source)) {
          targets.set(num, `fnref-${unit.id}-${wid}-${num}`);
          break;
        }
      }
    }
    return targets;
  }, [footnoteEntries, selectedWitnesses, readingMap, unit.id]);

  return (
    <article className="text-unit-card" id={`unit-${unit.id}`} data-unit-id={unit.id}>
      <header className="text-unit-card__header">
        <span className="text-unit-card__id">{unit.id}</span>
        <h2 className="text-unit-card__title">{unit.shortTitle}</h2>
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
              footnotes={footnotes}
            />
          </div>
        ))}
      </div>
      {footnoteEntries.length > 0 && (
        <footer className="text-unit-card__footnotes" aria-label={uiLang === 'he' ? 'הערות שוליים' : 'Footnotes'}>
          <h3 className="text-unit-card__footnotes-title">{uiLang === 'he' ? 'הערות שוליים' : 'Footnotes'}</h3>
          <ol className="text-unit-card__footnotes-list">
            {footnoteEntries.map(([num, noteText]) => {
              const refTarget = refTargetForFootnote.get(num);
              return (
                <li key={num} id={`fn-${unit.id}-${num}`} className="text-unit-card__footnote-item">
                  <a
                    className="text-unit-card__footnote-num"
                    href={refTarget ? `#${refTarget}` : `#unit-${unit.id}`}
                  >
                    {num}
                  </a>
                  <p className="text-unit-card__footnote-text">{noteText}</p>
                </li>
              );
            })}
          </ol>
        </footer>
      )}
    </article>
  );
}
