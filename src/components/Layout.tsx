import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/index';

export function Layout({ children }: { children: React.ReactNode }) {
  const { uiLang, setUiLang } = useApp();
  const s = t(uiLang);
  const dir = uiLang === 'he' ? 'rtl' : 'ltr';

  // Keep <html> dir in sync
  document.documentElement.lang = uiLang;
  document.documentElement.dir = dir;

  return (
    <div className="app-shell" dir={dir} lang={uiLang}>
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink to="/" className="site-header__brand">
            <span className="site-header__title">{s.bookTitle}</span>
          </NavLink>
          <nav className="site-nav" aria-label="main navigation">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'site-nav__link active' : 'site-nav__link'}>
              {s.navHome}
            </NavLink>
            <NavLink to="/edition" className={({ isActive }) => isActive ? 'site-nav__link active' : 'site-nav__link'}>
              {s.navEdition}
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => isActive ? 'site-nav__link active' : 'site-nav__link'}>
              {s.navSearch}
            </NavLink>
          </nav>
          <div className="site-header__actions">
            <button
              className={`lang-toggle ${uiLang === 'he' ? 'active' : ''}`}
              onClick={() => setUiLang('he')}
              aria-pressed={uiLang === 'he'}
              title="עברית"
            >
              עב
            </button>
            <button
              className={`lang-toggle ${uiLang === 'en' ? 'active' : ''}`}
              onClick={() => setUiLang('en')}
              aria-pressed={uiLang === 'en'}
              title="English"
            >
              EN
            </button>
          </div>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <p>
            {uiLang === 'he'
              ? 'מהדורה דיגיטלית של גדעון בוהק, "גזר דינא דישו" — Open Book Publishers, 2026'
              : 'Digital edition of Gideon Bohak, "Gzar-dina de-Yeshu" — Open Book Publishers, 2026'}
          </p>
        </div>
      </footer>
    </div>
  );
}
