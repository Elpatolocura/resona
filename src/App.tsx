import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { LanguageProvider } from './components/LanguageProvider';
import { ContentProvider } from './components/ContentProvider';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import FavoritesPage from './pages/FavoritesPage';
import MyListPage from './pages/MyListPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import AlbumPage from './pages/AlbumPage';
import ArtistPage from './pages/ArtistPage';
import MoviesPage from './pages/MoviesPage';
import TvShowsPage from './pages/TvShowsPage';
import AnimePage from './pages/AnimePage';
import LiveTVPage from './pages/LiveTVPage';
import MediaDetailPage from './pages/MediaDetailPage';
import WatchPage from './pages/WatchPage';
import ForumPage from './pages/ForumPage';
import ForumThreadPage from './pages/ForumThreadPage';
import PlayerPage from './pages/PlayerPage';
import SettingsPage from './pages/SettingsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ContentProvider>
          <HashRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/player" element={<PlayerPage />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/my-list" element={<MyListPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/playlists" element={<PlaylistsPage />} />
                <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
                <Route path="/album/:id" element={<AlbumPage />} />
                <Route path="/artist/:id" element={<ArtistPage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/tv" element={<TvShowsPage />} />
                <Route path="/anime" element={<AnimePage />} />
                <Route path="/live-tv" element={<LiveTVPage />} />
                <Route path="/media/:kind/:id" element={<MediaDetailPage />} />
                <Route path="/watch/:kind/:id" element={<WatchPage />} />
                <Route path="/forum" element={<ForumPage />} />
                <Route path="/forum/:id" element={<ForumThreadPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<HomePage />} />
              </Route>
            </Routes>
          </HashRouter>
        </ContentProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
