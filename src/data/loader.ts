/**
 * loader.ts – parses gzar_dina_edition_base.csv and builds the
 * full EditionData structure (TextUnits, Chapters, Witnesses).
 *
 * Data source: gzar_dina_edition_base.csv (root of v2 folder).
 *
 * Fields used:
 *   section_id, section_title, witness_id, language, status,
 *   source_text, translation, witness_notes_raw, section_notes_raw,
 *   verified
 *
 * Columns present but not yet populated (will show as empty):
 *   - Witness shelfmark / date: not in witnesses.csv (empty file).
 *     Must be supplied by the editor via data/edition/witnesses.csv.
 *   - Named entity index: persons.csv, places.csv are empty.
 *   - Section features: section_features.csv is empty.
 */

import type {
  Language,
  WitnessReading,
  TextUnit,
  WitnessInfo,
  Chapter,
  EditionData,
} from './types';
import csvRaw from '../../gzar_dina_edition_base.csv?raw';

// ---------------------------------------------------------------------------
// CSV parser (handles quoted fields with embedded newlines and commas)
// ---------------------------------------------------------------------------

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ',') {
      currentRow.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      currentRow.push(field);
      field = '';
      if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
      currentRow = [];
      continue;
    }

    field += ch;
  }

  if (field.length > 0 || currentRow.length > 0) {
    currentRow.push(field);
    if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Language normalisation
// ---------------------------------------------------------------------------

function normaliseLanguage(raw: string): Language {
  const v = raw.trim().toLowerCase();
  if (v === 'hebrew') return 'hebrew';
  if (v === 'aramaic') return 'aramaic';
  if (v.includes('judaeo') || v.includes('judeo') || v === 'ja') return 'judaeo-arabic';
  if (v.includes('indirect')) return 'indirect';
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Section-id sort (numeric-aware: 0.1, 0.2, …, 0.9, 0.10, 1.1, …)
// ---------------------------------------------------------------------------

function sectionSortKey(id: string): number[] {
  return id.split('.').map((part) => {
    const m = part.match(/^(\d+)([a-z]?)$/i);
    if (!m) return 0;
    return parseInt(m[1], 10) * 100 + (m[2] ? m[2].charCodeAt(0) - 96 : 0);
  });
}

function compareSectionIds(a: string, b: string): number {
  const ka = sectionSortKey(a);
  const kb = sectionSortKey(b);
  for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
    const diff = (ka[i] ?? 0) - (kb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Title decomposition helpers
// ---------------------------------------------------------------------------

/**
 * Given "3.5. Pilatus and Yeshu: Interrogating Yeshu about His Name"
 * returns { chapterTheme: "Pilatus and Yeshu", shortTitle: "Interrogating Yeshu about His Name" }
 */
function decomposeSectionTitle(raw: string): { chapterTheme: string; shortTitle: string } {
  // Strip leading "X.Y. " prefix
  const withoutPrefix = raw.replace(/^\d+\.\d+[a-z]?\.\s*/i, '').trim();
  const colonIdx = withoutPrefix.indexOf(':');
  if (colonIdx === -1) return { chapterTheme: withoutPrefix, shortTitle: withoutPrefix };
  return {
    chapterTheme: withoutPrefix.slice(0, colonIdx).trim(),
    shortTitle: withoutPrefix.slice(colonIdx + 1).trim(),
  };
}

// ---------------------------------------------------------------------------
// Main loader
// ---------------------------------------------------------------------------

let _editionData: EditionData | null = null;

export function getEditionData(): EditionData {
  if (_editionData) return _editionData;

  const rows = parseCsv(csvRaw);
  if (rows.length < 2) throw new Error('CSV parse failed: no data rows');

  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));

  const col = (row: string[], name: string): string => {
    const idx = headers.indexOf(name);
    return idx >= 0 ? (row[idx] ?? '').trim() : '';
  };

  // Accumulate per-section data
  const unitAccumulator = new Map<
    string,
    { title: string; readings: WitnessReading[]; readingWitnesses: Set<string> }
  >();

  // Accumulate per-witness data
  const witnessAccumulator = new Map<
    string,
    { language: Language; sections: Set<string>; chapters: Set<string> }
  >();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const sectionId = col(row, 'section_id');
    const sectionTitle = col(row, 'section_title');
    const witnessId = col(row, 'witness_id');
    if (!sectionId || !witnessId) continue;

    const chapterId = sectionId.split('.')[0];
    const language = normaliseLanguage(col(row, 'language'));
    const sourceText = col(row, 'source_text');
    const translation = col(row, 'translation');
    const status = col(row, 'status') || 'unknown';
    const verified = col(row, 'verified').toLowerCase() === 'true';
    const witnessNotes = col(row, 'witness_notes_raw');
    const sectionNotes = col(row, 'section_notes_raw');

    const reading: WitnessReading = {
      witnessId,
      language,
      status,
      sourceText,
      translation,
      verified,
      witnessNotes,
      sectionNotes,
    };

    // Unit accumulator – deduplicate by (section_id, witness_id)
    const existingUnit = unitAccumulator.get(sectionId);
    if (!existingUnit) {
      unitAccumulator.set(sectionId, {
        title: sectionTitle,
        readings: [reading],
        readingWitnesses: new Set([witnessId]),
      });
    } else {
      if (!existingUnit.title && sectionTitle) existingUnit.title = sectionTitle;
      if (!existingUnit.readingWitnesses.has(witnessId)) {
        existingUnit.readings.push(reading);
        existingUnit.readingWitnesses.add(witnessId);
      }
    }

    // Witness accumulator
    const existingWit = witnessAccumulator.get(witnessId);
    if (!existingWit) {
      witnessAccumulator.set(witnessId, {
        language,
        sections: new Set([sectionId]),
        chapters: new Set([chapterId]),
      });
    } else {
      existingWit.sections.add(sectionId);
      existingWit.chapters.add(chapterId);
    }
  }

  // Build TextUnits in sorted order
  const sortedIds = Array.from(unitAccumulator.keys()).sort(compareSectionIds);

  const units: TextUnit[] = sortedIds.map((id, idx) => {
    const acc = unitAccumulator.get(id)!;
    const chapterId = id.split('.')[0];
    const sectionNum = id.split('.').slice(1).join('.');
    const { chapterTheme, shortTitle } = decomposeSectionTitle(acc.title);
    return {
      id,
      chapter: chapterId,
      sectionNum,
      title: acc.title,
      chapterTheme,
      shortTitle,
      order: idx + 1,
      readings: acc.readings,
    };
  });

  const unitMap = new Map(units.map((u) => [u.id, u]));

  // Build chapters
  const chapterMap = new Map<string, TextUnit[]>();
  for (const unit of units) {
    const list = chapterMap.get(unit.chapter) ?? [];
    list.push(unit);
    chapterMap.set(unit.chapter, list);
  }

  const chapters: Chapter[] = Array.from(chapterMap.entries())
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([chId, chUnits]) => {
      // Take chapter theme from the first unit
      const theme = chUnits[0]?.chapterTheme ?? `Chapter ${chId}`;
      return {
        id: chId,
        title: theme,
        titleHe: '', // Not available in current data
        units: chUnits,
      };
    });

  // Build WitnessInfo list
  const witnesses: WitnessInfo[] = Array.from(witnessAccumulator.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, acc]) => ({
      id,
      language: acc.language,
      siglum: id,
      displayName: id,
      shelfmark: null,   // Not in data — needs to be supplied by editor
      dateApprox: null,  // Not in data — needs to be supplied by editor
      sectionCount: acc.sections.size,
      chapterCoverage: acc.chapters,
    }));

  const witnessMap = new Map(witnesses.map((w) => [w.id, w]));

  _editionData = { units, unitMap, chapters, witnesses, witnessMap };
  return _editionData;
}

/** Returns the set of witnessIds that have a reading for the given sectionId */
export function witnessesForUnit(unitId: string): string[] {
  const data = getEditionData();
  const unit = data.unitMap.get(unitId);
  if (!unit) return [];
  return unit.readings.map((r) => r.witnessId);
}
