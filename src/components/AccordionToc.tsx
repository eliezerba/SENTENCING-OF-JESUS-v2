import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/index';
import type { Chapter } from '../data/types';

interface AccordionTocProps {
  onSelectUnit?: (unitId: string) => void;
}

export function AccordionToc({ onSelectUnit }: AccordionTocProps) {
  const { uiLang, data, activeUnitId, setActiveUnitId } = useApp();
  const s = t(uiLang);

  // Initially expand the chapter of the active unit
  const activeChapter = activeUnitId ? activeUnitId.split('.')[0] : null;
  const [openChapters, setOpenChapters] = useState<Set<string>>(
    new Set(activeChapter ? [activeChapter] : []),
  );

  function toggleChapter(chId: string) {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chId)) next.delete(chId);
      else next.add(chId);
      return next;
    });
  }

  function handleUnitClick(unitId: string) {
    setActiveUnitId(unitId);
    onSelectUnit?.(unitId);
  }

  function expandAll() {
    setOpenChapters(new Set(data.chapters.map((c) => c.id)));
  }

  function collapseAll() {
    setOpenChapters(new Set());
  }

  return (
    <div className="accordion-toc">
      <div className="accordion-toc__actions">
        <button className="btn btn--tiny" onClick={expandAll}>{s.expandAll}</button>
        <button className="btn btn--tiny" onClick={collapseAll}>{s.collapseAll}</button>
      </div>
      {data.chapters.map((ch: Chapter) => {
        const isOpen = openChapters.has(ch.id);
        return (
          <div key={ch.id} className="accordion-toc__chapter">
            <button
              className={`accordion-toc__chapter-header ${isOpen ? 'open' : ''}`}
              onClick={() => toggleChapter(ch.id)}
              aria-expanded={isOpen}
            >
              <span className="accordion-toc__chapter-num">
                {s.chapterLabel} {ch.id}
              </span>
              <span className="accordion-toc__chapter-title">{ch.title}</span>
              <span className="accordion-toc__chapter-count">
                {ch.units.length}
              </span>
              <span className="accordion-toc__chevron">{isOpen ? '▾' : '▸'}</span>
            </button>
            {isOpen && (
              <ul className="accordion-toc__units" role="list">
                {ch.units.map((unit) => (
                  <li key={unit.id}>
                    <button
                      className={`accordion-toc__unit ${activeUnitId === unit.id ? 'active' : ''}`}
                      onClick={() => handleUnitClick(unit.id)}
                    >
                      <span className="accordion-toc__unit-id">{unit.id}</span>
                      <span className="accordion-toc__unit-title">{unit.shortTitle}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
