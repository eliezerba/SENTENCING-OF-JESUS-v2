/**
 * i18n/index.ts – UI string translations.
 * Two languages: Hebrew (he) and English (en).
 * This module controls only the interface language (menus, labels, headings,
 * filters, system messages). It is separate from the text display language
 * (source / translation) which is controlled by DisplayMode in AppContext.
 */

export type UILanguage = 'he' | 'en';

export interface Strings {
  // Site
  siteTitle: string;
  bookTitle: string;
  bookSubtitle: string;

  // Navigation
  navHome: string;
  navEdition: string;
  navSearch: string;

  // Home page
  aboutEdition: string;
  attribution: string;
  bookStructure: string;
  witnessInventory: string;
  witnessesTitle: string;
  coverageMap: string;
  goToEdition: string;
  selectChapters: string;
  selectWitnesses: string;
  chapterLabel: string;
  unitLabel: string;
  unitsCount: string;

  // Witness info
  language: string;
  shelfmark: string;
  dateApprox: string;
  sections: string;
  dataNotAvailable: string;

  // Edition page
  textKey: string;
  displayMode: string;
  sourceOnly: string;
  sourceAndTranslation: string;
  translationOnly: string;
  primaryWitness: string;
  filterByLanguage: string;
  allLanguages: string;
  noReadingForWitness: string;
  colorLegend: string;
  editorialContent: string;
  footnoteRef: string;
  unverifiedExtraction: string;
  expandAll: string;
  collapseAll: string;

  // Search page
  searchPlaceholder: string;
  searchButton: string;
  searchResults: string;
  noResults: string;
  resultUnit: string;
  resultWitness: string;
  searchIn: string;
  searchInAll: string;
  searchInSource: string;
  searchInTranslation: string;
  searchInTitle: string;

  // Languages
  langHebrew: string;
  langAramaic: string;
  langJudaeoArabic: string;
  langIndirect: string;
  langUnknown: string;

  // Warnings
  missingDataNote: string;
}

const he: Strings = {
  siteTitle: 'גזר דינא דישו | מהדורה דיגיטלית',
  bookTitle: 'גזר דינא דישו',
  bookSubtitle: 'מהדורה דיגיטלית מלומדת של פרוטוקולי משפטו של ישו',

  navHome: 'עמוד הבית',
  navEdition: 'מהדורה',
  navSearch: 'חיפוש',

  aboutEdition: 'על המהדורה',
  attribution: 'ייחוס',
  bookStructure: 'מבנה הטקסט',
  witnessInventory: 'מצאי עדי נוסח',
  witnessesTitle: 'עדי נוסח',
  coverageMap: 'מפת מצאי',
  goToEdition: 'עבור למהדורה',
  selectChapters: 'בחר פרקים',
  selectWitnesses: 'בחר עדי נוסח',
  chapterLabel: 'פרק',
  unitLabel: 'יחידה',
  unitsCount: 'יחידות טקסט',

  language: 'שפה',
  shelfmark: 'סימן ספרייה',
  dateApprox: 'תאריך משוער',
  sections: 'יחידות מכוסות',
  dataNotAvailable: 'לא קיים בנתונים',

  textKey: 'מפתח טקסט',
  displayMode: 'מצב תצוגה',
  sourceOnly: 'מקור בלבד',
  sourceAndTranslation: 'מקור + תרגום',
  translationOnly: 'תרגום בלבד',
  primaryWitness: 'עד נוסח ראשי',
  filterByLanguage: 'סינון לפי שפה',
  allLanguages: 'כל השפות',
  noReadingForWitness: 'אין נוסח לעד זה ביחידה זו',
  colorLegend: 'מקרא צבעים',
  editorialContent: 'תוספת עורכית (}...{)',
  footnoteRef: 'הפניה לשוליים',
  unverifiedExtraction: 'טקסט שחולץ ממקור לא מאומת',
  expandAll: 'פתח הכל',
  collapseAll: 'סגור הכל',

  searchPlaceholder: 'חיפוש בטקסט, עדים, פרקים…',
  searchButton: 'חיפוש',
  searchResults: 'תוצאות חיפוש',
  noResults: 'לא נמצאו תוצאות',
  resultUnit: 'יחידת טקסט',
  resultWitness: 'עד נוסח',
  searchIn: 'חפש ב:',
  searchInAll: 'הכל',
  searchInSource: 'טקסט מקור',
  searchInTranslation: 'תרגום',
  searchInTitle: 'כותרת',

  langHebrew: 'עברית',
  langAramaic: 'ארמית',
  langJudaeoArabic: 'יהודית-ערבית',
  langIndirect: 'עד עקיף',
  langUnknown: 'שפה לא ידועה',

  missingDataNote:
    'שים לב: נתוני שוליים (כגון סימן ספרייה ותאריך כתב היד) אינם קיימים בקובץ הנתונים הנוכחי (data/edition/witnesses.csv ריק). יש לספקם ידנית.',
};

const en: Strings = {
  siteTitle: 'Gzar Dina de-Yeshu | Digital Edition',
  bookTitle: 'Gzar Dina de-Yeshu',
  bookSubtitle: 'A scholarly digital edition of the protocols of the trial of Jesus',

  navHome: 'Home',
  navEdition: 'Edition',
  navSearch: 'Search',

  aboutEdition: 'About the Edition',
  attribution: 'Attribution',
  bookStructure: 'Text Structure',
  witnessInventory: 'Witness Inventory',
  witnessesTitle: 'Textual Witnesses',
  coverageMap: 'Coverage Map',
  goToEdition: 'Go to Edition',
  selectChapters: 'Select Chapters',
  selectWitnesses: 'Select Witnesses',
  chapterLabel: 'Chapter',
  unitLabel: 'Unit',
  unitsCount: 'text units',

  language: 'Language',
  shelfmark: 'Shelfmark',
  dateApprox: 'Approximate Date',
  sections: 'Sections covered',
  dataNotAvailable: 'Not available in current data',

  textKey: 'Text Key',
  displayMode: 'Display Mode',
  sourceOnly: 'Source only',
  sourceAndTranslation: 'Source + Translation',
  translationOnly: 'Translation only',
  primaryWitness: 'Primary Witness',
  filterByLanguage: 'Filter by language',
  allLanguages: 'All languages',
  noReadingForWitness: 'No reading for this witness in this unit',
  colorLegend: 'Colour Legend',
  editorialContent: 'Editorial content (}…{)',
  footnoteRef: 'Footnote reference',
  unverifiedExtraction: 'Unverified extracted text',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',

  searchPlaceholder: 'Search text, witnesses, sections…',
  searchButton: 'Search',
  searchResults: 'Search Results',
  noResults: 'No results found',
  resultUnit: 'Text unit',
  resultWitness: 'Witness',
  searchIn: 'Search in:',
  searchInAll: 'All',
  searchInSource: 'Source text',
  searchInTranslation: 'Translation',
  searchInTitle: 'Title',

  langHebrew: 'Hebrew',
  langAramaic: 'Aramaic',
  langJudaeoArabic: 'Judaeo-Arabic',
  langIndirect: 'Indirect witness',
  langUnknown: 'Unknown language',

  missingDataNote:
    'Note: Manuscript metadata (shelfmark, date) is not available in the current data files (data/edition/witnesses.csv is empty). It must be supplied manually.',
};

export const translations: Record<UILanguage, Strings> = { he, en };

export function t(lang: UILanguage): Strings {
  return translations[lang];
}
