/**
 * CoverageMap – visual inventory of which witnesses cover which chapters.
 * Rows = witnesses, Columns = chapters.
 * Cell colour: present (green), absent (light gray).
 *
 * Data derived from gzar_dina_edition_base.csv — no invented data.
 */
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/index';
import type { WitnessInfo, Chapter } from '../data/types';

export function CoverageMap() {
  const { data, uiLang, setSelectedWitnesses, setActiveUnitId } = useApp();
  const s = t(uiLang);
  const navigate = useNavigate();

  function handleCellClick(witness: WitnessInfo, chapter: Chapter) {
    if (!witness.chapterCoverage.has(chapter.id)) return;
    setSelectedWitnesses([witness.id]);
    const firstUnit = chapter.units[0];
    if (firstUnit) setActiveUnitId(firstUnit.id);
    navigate('/edition');
  }

  return (
    <div className="coverage-map">
      <div className="coverage-map__scroll">
        <table className="coverage-table" role="grid">
          <thead>
            <tr>
              <th className="coverage-table__corner">{s.witnessesTitle}</th>
              {data.chapters.map((ch) => (
                <th key={ch.id} className="coverage-table__ch-header" title={ch.title}>
                  <span className="coverage-table__ch-num">{ch.id}</span>
                  <span className="coverage-table__ch-short">{ch.title.split(' ').slice(0, 2).join(' ')}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.witnesses.map((w) => (
              <tr key={w.id}>
                <td className={`coverage-table__witness-label coverage-table__witness-label--${w.language}`}>
                  {w.siglum}
                </td>
                {data.chapters.map((ch) => {
                  const covered = w.chapterCoverage.has(ch.id);
                  // Count units this witness covers in this chapter
                  const unitCount = covered
                    ? ch.units.filter((u) =>
                        u.readings.some((r) => r.witnessId === w.id),
                      ).length
                    : 0;
                  return (
                    <td
                      key={ch.id}
                      className={`coverage-table__cell ${covered ? 'coverage-table__cell--present' : 'coverage-table__cell--absent'}`}
                      onClick={() => handleCellClick(w, ch)}
                      title={
                        covered
                          ? `${w.siglum} · ${s.chapterLabel} ${ch.id}: ${unitCount} ${s.unitsCount}`
                          : undefined
                      }
                      role={covered ? 'button' : undefined}
                      tabIndex={covered ? 0 : undefined}
                      onKeyDown={covered ? (e) => { if (e.key === 'Enter') handleCellClick(w, ch); } : undefined}
                    >
                      {covered ? unitCount : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="coverage-map__legend">
        <span className="coverage-map__legend-item coverage-map__legend-item--present">
          {uiLang === 'he' ? 'קיים' : 'Present'}
        </span>
        <span className="coverage-map__legend-item coverage-map__legend-item--absent">
          {uiLang === 'he' ? 'חסר' : 'Absent'}
        </span>
        <span className="coverage-map__legend-note">
          {uiLang === 'he'
            ? 'לחץ על תא כדי לנווט לאותו פרק ועד נוסח'
            : 'Click a cell to navigate to that chapter and witness'}
        </span>
      </div>
    </div>
  );
}
