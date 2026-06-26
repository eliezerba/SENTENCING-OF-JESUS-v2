/**
 * SearchPage – full-text search across source texts, translations, and titles.
 * Uses MiniSearch for client-side indexing.
 * Index is built once from EditionData on first render.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MiniSearch from 'minisearch';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/index';
import type { SearchDoc } from '../data/types';

type SearchField = 'all' | 'sourceText' | 'translation' | 'unitTitle';

function buildSearchIndex(docs: SearchDoc[]): MiniSearch<SearchDoc> {
  const ms = new MiniSearch<SearchDoc>({
    fields: ['unitTitle', 'sourceText', 'translation', 'language', 'witnessId'],
    storeFields: ['unitId', 'witnessId', 'unitTitle', 'sourceText', 'translation', 'language'],
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
    },
  });
  ms.addAll(docs);
  return ms;
}

function highlight(text: string, terms: string[]): React.ReactNode {
  if (!text || terms.length === 0) return text;
  // Use split with a capturing group: captured groups appear at odd indices
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const pattern = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function SearchPage() {
  const { data, uiLang, setActiveUnitId, setSelectedWitnesses } = useApp();
  const s = t(uiLang);
  const navigate = useNavigate();
  const dir = uiLang === 'he' ? 'rtl' : 'ltr';

  const [query, setQuery] = useState('');
  const [field, setField] = useState<SearchField>('all');

  // Build search documents
  const docs: SearchDoc[] = useMemo(
    () =>
      data.units.flatMap((unit) =>
        unit.readings.map((r) => ({
          id: `${unit.id}::${r.witnessId}`,
          unitId: unit.id,
          witnessId: r.witnessId,
          unitTitle: unit.title,
          sourceText: r.sourceText,
          translation: r.translation,
          language: r.language,
        })),
      ),
    [data],
  );

  const index = useMemo(() => buildSearchIndex(docs), [docs]);

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const searchFields: string[] | undefined =
      field === 'all'
        ? undefined
        : field === 'sourceText'
          ? ['sourceText']
          : field === 'translation'
            ? ['translation']
            : ['unitTitle'];
    const opts = searchFields ? { fields: searchFields } : {};
    return index.search(query, opts);
  }, [query, field, index]);

  const terms = useMemo(() => query.trim().toLowerCase().split(/\s+/).filter(Boolean), [query]);

  const handleResultClick = useCallback(
    (unitId: string, witnessId: string) => {
      setActiveUnitId(unitId);
      setSelectedWitnesses([witnessId]);
      navigate(`/edition?unit=${encodeURIComponent(unitId)}`);
    },
    [setActiveUnitId, setSelectedWitnesses, navigate],
  );

  const fieldOptions: { value: SearchField; label: string }[] = [
    { value: 'all', label: s.searchInAll },
    { value: 'sourceText', label: s.searchInSource },
    { value: 'translation', label: s.searchInTranslation },
    { value: 'unitTitle', label: s.searchInTitle },
  ];

  return (
    <div className="search-page" dir={dir}>
      <section className="search-form">
        <h1 className="search-form__heading">{s.navSearch}</h1>
        <div className="search-form__row">
          <input
            type="search"
            className="search-form__input"
            placeholder={s.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={s.searchPlaceholder}
            autoFocus
          />
        </div>
        <div className="search-form__filters" role="group" aria-label={s.searchIn}>
          <span>{s.searchIn}</span>
          {fieldOptions.map((opt) => (
            <button
              key={opt.value}
              className={`btn btn--filter ${field === opt.value ? 'btn--filter-active' : ''}`}
              onClick={() => setField(opt.value)}
              aria-pressed={field === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="search-results" aria-live="polite">
        {query.length >= 2 && (
          <p className="search-results__count">
            {s.searchResults}: {results.length}
          </p>
        )}
        {results.length === 0 && query.length >= 2 && (
          <p className="search-results__empty">{s.noResults}</p>
        )}
        <ul className="search-results__list">
          {results.map((res) => {
            const doc = docs.find((d) => d.id === res.id);
            if (!doc) return null;
            const unit = data.unitMap.get(doc.unitId);
            return (
              <li key={res.id} className="search-result">
                <button
                  className="search-result__link"
                  onClick={() => handleResultClick(doc.unitId, doc.witnessId)}
                >
                  <div className="search-result__meta">
                    <span className="search-result__unit-id">{doc.unitId}</span>
                    <span className="search-result__witness">{doc.witnessId}</span>
                    <span className={`lang-badge lang-badge--${doc.language}`}>{doc.language}</span>
                  </div>
                  <div className="search-result__title">
                    {highlight(unit?.title ?? doc.unitTitle, terms)}
                  </div>
                  {(field === 'all' || field === 'sourceText') && doc.sourceText && (
                    <div className="search-result__snippet search-result__snippet--source" dir="rtl">
                      {highlight(doc.sourceText.slice(0, 200), terms)}
                    </div>
                  )}
                  {(field === 'all' || field === 'translation') && doc.translation && (
                    <div className="search-result__snippet search-result__snippet--translation" dir="ltr">
                      {highlight(doc.translation.slice(0, 200), terms)}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
