import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { EditionPage } from './pages/EditionPage';
import { SearchPage } from './pages/SearchPage';

export function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/edition" element={<EditionPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}
