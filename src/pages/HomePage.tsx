import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/index';
import { CoverageMap } from '../components/CoverageMap';
import { WitnessSelector } from '../components/WitnessSelector';
import type { Language } from '../data/types';

const META_LABELS: Record<string, { he: string; en: string }> = {
  witness_group: { he: 'קבוצת עד', en: 'Witness group' },
  language_he: { he: 'שפה (עברית)', en: 'Language (Hebrew label)' },
  full_label: { he: 'כותרת מלאה', en: 'Full label' },
  material_format: { he: 'חומר/פורמט', en: 'Material format' },
  dimensions_cm: { he: 'מידות (סמ)', en: 'Dimensions (cm)' },
  lines_per_page: { he: 'שורות לעמוד', en: 'Lines per page' },
  condition: { he: 'מצב פיזי', en: 'Condition' },
  script_hand: { he: 'כתב יד', en: 'Script hand' },
  vocalization: { he: 'ניקוד', en: 'Vocalization' },
  line_fillers_quire: { he: 'מילוי שורות/קונטרס', en: 'Line fillers/quire' },
  text_coverage: { he: 'טווח כיסוי בטקסט', en: 'Text coverage' },
  manuscript_context: { he: 'הקשר כתה"י', en: 'Manuscript context' },
  textual_characteristics: { he: 'מאפיינים טקסטואליים', en: 'Textual characteristics' },
  biblical_verses_language: { he: 'שפת פסוקים', en: 'Biblical verses language' },
  name_spellings: { he: 'כתיבי שמות', en: 'Name spellings' },
  include_in_synopsis: { he: 'כלול בסינופסיס', en: 'Include in synopsis' },
  bohak_intro_pages: { he: 'עמודי מבוא (בוהק)', en: 'Bohak intro pages' },
  summary_paragraph_he: { he: 'סיכום (עברית)', en: 'Summary (Hebrew)' },
  notes_for_digital_edition: { he: 'הערות למהדורה דיגיטלית', en: 'Digital edition notes' },
};

function labelForMetaKey(key: string, uiLang: 'he' | 'en'): string {
  const known = META_LABELS[key];
  if (known) return known[uiLang];
  return key.replace(/_/g, ' ');
}

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

export function HomePage() {
  const { uiLang, data, setActiveUnitId, selectedWitnesses } = useApp();
  const s = t(uiLang);
  const navigate = useNavigate();
  const [attributionOpen, setAttributionOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const hasWitnessMetadata = data.witnesses.some((w) => Object.keys(w.metadata).length > 0);

  function handleGoToEdition() {
    if (selectedChapterId) {
      const ch = data.chapters.find((c) => c.id === selectedChapterId);
      if (ch?.units[0]) setActiveUnitId(ch.units[0].id);
    }
    navigate('/edition');
  }

  const dir = uiLang === 'he' ? 'rtl' : 'ltr';

  return (
    <div className="home-page" dir={dir}>
      {/* ── About the Edition ── */}
      <section className="home-section home-section--about">
        <h1 className="home-section__heading">{s.aboutEdition}</h1>
        <p className="home-intro">
          {uiLang === 'he'
            ? 'מהדורה דיגיטלית מלומדת של "גזר דינא דישו" (Gzar-dina de-Yeshu) מאת גדעון בוהק. המהדורה מכילה 83 יחידות טקסט, 16 עדי נוסח בשפות עברית, ארמית ויהודית-ערבית, עם תרגום לאנגלית.'
            : 'A scholarly digital edition of "Gzar-dina de-Yeshu" by Gideon Bohak. The edition comprises 83 text units across 10 chapters, with 16 textual witnesses in Hebrew, Aramaic, and Judaeo-Arabic, accompanied by English translation.'}
        </p>
        <button
          className="btn btn--outline home-attribution-toggle"
          onClick={() => setAttributionOpen((o) => !o)}
          aria-expanded={attributionOpen}
        >
          {s.attribution} {attributionOpen ? '▾' : '▸'}
        </button>
        {attributionOpen && (
          <div className="home-attribution">
            <p>
              {uiLang === 'he'
                ? 'גדעון בוהק, "משפטו של ישו — פרוטוקולים היהודיים האותנטיים של משפט ישו". Open Book Publishers, 2026.'
                : 'Gideon Bohak, "The Sentencing of Jesus (Gzar-dina de-Yeshu): The \'Authentic\' Jewish Protocols of the Trial of Jesus". Open Book Publishers, 2026.'}
            </p>
            <p>
              {uiLang === 'he'
                ? 'גרסה דיגיטלית זו נוצרה כאב-טיפוס דיגיטלי ומכילה טקסט שחולץ ממקור שלא אומת עדיין. יש להתייחס לנוסח בהתאם.'
                : 'This digital prototype contains text extracted from source material that has not yet been fully verified. Please treat the text accordingly.'}
            </p>
          </div>
        )}
      </section>

      <div className="home-body">
        {/* ── Book Structure ── */}
        <section className="home-section home-section--structure">
          <h2 className="home-section__heading">{s.bookStructure}</h2>
          <div className="chapter-grid">
            {data.chapters.map((ch) => (
              <div
                key={ch.id}
                className={`chapter-card ${selectedChapterId === ch.id ? 'chapter-card--selected' : ''}`}
                onClick={() => setSelectedChapterId(ch.id === selectedChapterId ? null : ch.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelectedChapterId(ch.id === selectedChapterId ? null : ch.id); }}
              >
                <div className="chapter-card__num">{s.chapterLabel} {ch.id}</div>
                <div className="chapter-card__title">{ch.title}</div>
                <div className="chapter-card__count">{ch.units.length} {s.unitsCount}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Witness List ── */}
        <section className="home-section home-section--witnesses">
          <h2 className="home-section__heading">{s.witnessesTitle}</h2>
          {!hasWitnessMetadata && (
            <p className="home-missing-data-note">
              ⚠ {s.missingDataNote}
            </p>
          )}
          <div className="witness-grid">
            {data.witnesses.map((w) => (
              <div key={w.id} className={`witness-card witness-card--${w.language}`}>
                <div className="witness-card__siglum">{w.siglum}</div>
                {w.displayName !== w.siglum && (
                  <div className="witness-card__display-name">{w.displayName}</div>
                )}
                <div className={`lang-badge lang-badge--${w.language}`}>
                  {langLabel(w.language, uiLang)}
                </div>
                <table className="witness-card__meta">
                  <tbody>
                    <tr>
                      <th>{s.shelfmark}</th>
                      <td className="text--muted">{w.shelfmark ?? s.dataNotAvailable}</td>
                    </tr>
                    <tr>
                      <th>{s.dateApprox}</th>
                      <td className="text--muted">{w.dateApprox ?? s.dataNotAvailable}</td>
                    </tr>
                    <tr>
                      <th>{s.sections}</th>
                      <td>{w.sectionCount}</td>
                    </tr>
                  </tbody>
                </table>
                {Object.keys(w.metadata).length > 0 && (
                  <details className="witness-card__details">
                    <summary>{uiLang === 'he' ? 'פרטים מלאים' : 'Full details'}</summary>
                    <table className="witness-card__meta witness-card__meta--full">
                      <tbody>
                        {Object.entries(w.metadata)
                          .filter(([k]) => k !== 'witness_id')
                          .map(([k, v]) => (
                            <tr key={k}>
                              <th>{labelForMetaKey(k, uiLang)}</th>
                              <td>{v}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </details>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Quick navigation ── */}
      <section className="home-section home-section--navigate">
        <h2 className="home-section__heading">{s.goToEdition}</h2>
        <div className="home-navigate">
          <div className="home-navigate__chapter">
            <label>{s.selectChapters}:</label>
            <select
              value={selectedChapterId ?? ''}
              onChange={(e) => setSelectedChapterId(e.target.value || null)}
              className="home-navigate__select"
            >
              <option value="">{uiLang === 'he' ? 'כל הפרקים' : 'All chapters'}</option>
              {data.chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {s.chapterLabel} {ch.id}: {ch.title}
                </option>
              ))}
            </select>
          </div>
          <div className="home-navigate__witnesses">
            <label>{s.selectWitnesses}:</label>
            <WitnessSelector />
          </div>
          <button className="btn btn--primary" onClick={handleGoToEdition}>
            {s.goToEdition} →
          </button>
          {selectedWitnesses.length === 0 && (
            <p className="home-navigate__warning">
              {uiLang === 'he'
                ? 'בחר לפחות עד נוסח אחד כדי להציג את המהדורה'
                : 'Select at least one witness to display the edition'}
            </p>
          )}
        </div>
      </section>

      {/* ── Coverage Map ── */}
      <section className="home-section home-section--coverage">
        <h2 className="home-section__heading">{s.coverageMap}</h2>
        <p className="home-coverage-note">
          {uiLang === 'he'
            ? 'מספר יחידות הטקסט שיש לכל עד נוסח בכל פרק. לחץ על תא כדי לנווט לאותו פרק.'
            : 'Number of text units each witness covers per chapter. Click a cell to navigate.'}
        </p>
        <CoverageMap />
      </section>
    </div>
  );
}
