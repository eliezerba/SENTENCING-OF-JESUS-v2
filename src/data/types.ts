// Core types for Gzar-Dina Digital Edition v2
// All data is derived from gzar_dina_edition_base.csv

export type Language =
  | 'hebrew'
  | 'aramaic'
  | 'judaeo-arabic'
  | 'indirect'
  | 'unknown';

export type DisplayMode = 'source' | 'both' | 'translation';
export type UILanguage = 'he' | 'en';

/** One witness's reading of one text unit (section) */
export interface WitnessReading {
  witnessId: string;
  language: Language;
  status: string;
  sourceText: string;
  translation: string;
  verified: boolean;
  witnessNotes: string;
  sectionNotes: string;
}

/**
 * A TextUnit is the core editorial object.
 * It corresponds to one section of the text and contains
 * all available witness readings for that section.
 */
export interface TextUnit {
  /** Stable identifier, e.g. "3.5" */
  id: string;
  /** Chapter number as string, e.g. "3" */
  chapter: string;
  /** Section number within chapter, e.g. "5" */
  sectionNum: string;
  /** Full section title from the edition */
  title: string;
  /** Theme label derived from the section title (part before the colon) */
  chapterTheme: string;
  /** Short descriptive label (part after the colon) */
  shortTitle: string;
  /** Sort order within the full text */
  order: number;
  /** All witness readings for this unit */
  readings: WitnessReading[];
}

/** Metadata about a textual witness (manuscript / tradition) */
export interface WitnessInfo {
  id: string;
  language: Language;
  /** Short display siglum (same as id) */
  siglum: string;
  /** Human-readable display name */
  displayName: string;
  /**
   * Shelfmark: NOT available in current data.
   * Source: data/edition/witnesses.csv (currently empty).
   * Needs to be supplied by the editor.
   */
  shelfmark: string | null;
  /**
   * Approximate date: NOT available in current data.
   * Source: data/edition/witnesses.csv (currently empty).
   * Needs to be supplied by the editor.
   */
  dateApprox: string | null;
  /** Number of sections in which this witness appears */
  sectionCount: number;
  /** Set of chapter ids this witness covers */
  chapterCoverage: Set<string>;
  /** Additional metadata loaded from gzar_dina_witnesses.csv */
  metadata: Record<string, string>;
}

/** A chapter groups multiple TextUnits under a common theme */
export interface Chapter {
  /** Chapter number as string, e.g. "0", "1", ..., "9" */
  id: string;
  /** Theme label, e.g. "An Introductory Interpolation" */
  title: string;
  /** Hebrew chapter title (not available; to be supplied) */
  titleHe: string;
  units: TextUnit[];
}

/** Full parsed edition data */
export interface EditionData {
  units: TextUnit[];
  unitMap: Map<string, TextUnit>;
  chapters: Chapter[];
  witnesses: WitnessInfo[];
  witnessMap: Map<string, WitnessInfo>;
}

/** A searchable document for the search index */
export interface SearchDoc {
  id: string;           // unique, e.g. "3.5::Heb1"
  unitId: string;       // section_id
  witnessId: string;
  unitTitle: string;
  sourceText: string;
  translation: string;
  language: string;
}
