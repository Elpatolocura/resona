import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

type Language = 'system' | 'es' | 'en' | 'pt' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  resolvedLanguage: 'es' | 'en' | 'pt' | 'fr';
  persistLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'system',
  setLanguage: () => {},
  resolvedLanguage: 'es',
  persistLanguage: () => {},
});

const LANG_MAP: Record<string, 'es' | 'en' | 'pt' | 'fr'> = {
  es: 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'es-AR': 'es',
  'es-CO': 'es',
  en: 'en',
  'en-US': 'en',
  'en-GB': 'en',
  pt: 'pt',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  fr: 'fr',
  'fr-FR': 'fr',
};

export const useLanguage = () => useContext(LanguageContext);

export const LABELS: Record<'es' | 'en' | 'pt' | 'fr', Record<string, string>> = {
  es: {
    home: 'Inicio',
    search: 'Buscar',
    library: 'Biblioteca',
    favorites: 'Favoritos',
    playlists: 'Playlists',
    forum: 'Foro',
    settings: 'Configuración',
    movies: 'Películas',
    series: 'Series',
    nowPlaying: 'Reproduciendo',
    movie: 'Película',
    tvShow: 'Serie',
    similarSongs: 'Canciones similares',
    queue: 'Cola de reproducción',
    share: 'Compartir',
    report: 'Denunciar',
    addToQueue: 'Añadir a la cola',
    playNext: 'Reproducir a continuación',
    addToFavorites: 'Añadir a favoritos',
    removeFromFavorites: 'Quitar de favoritos',
    addToPlaylist: 'Añadir a playlist',
    newPlaylist: 'Nueva playlist con esta canción',
    language: 'Idioma',
    systemLang: 'Sistema',
    profile: 'Perfil',
    player: 'Reproductor',
    content: 'Contenido',
    notifications: 'Notificaciones',
    appearance: 'Apariencia',
    storage: 'Almacenamiento',
    dark: 'Oscuro',
    light: 'Claro',
    system: 'Sistema',
    save: 'Guardar cambios',
    clearData: 'Borrar datos locales',
  },
  en: {
    home: 'Home',
    search: 'Search',
    library: 'Library',
    favorites: 'Favorites',
    playlists: 'Playlists',
    forum: 'Forum',
    settings: 'Settings',
    movies: 'Movies',
    series: 'TV Shows',
    nowPlaying: 'Now Playing',
    movie: 'Movie',
    tvShow: 'TV Show',
    similarSongs: 'Similar Songs',
    queue: 'Queue',
    share: 'Share',
    report: 'Report',
    addToQueue: 'Add to Queue',
    playNext: 'Play Next',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    addToPlaylist: 'Add to Playlist',
    newPlaylist: 'New playlist with this song',
    language: 'Language',
    systemLang: 'System',
    profile: 'Profile',
    player: 'Player',
    content: 'Content',
    notifications: 'Notifications',
    appearance: 'Appearance',
    storage: 'Storage',
    dark: 'Dark',
    light: 'Light',
    system: 'System',
    save: 'Save changes',
    clearData: 'Clear local data',
  },
  pt: {
    home: 'Início',
    search: 'Pesquisar',
    library: 'Biblioteca',
    favorites: 'Favoritos',
    playlists: 'Playlists',
    forum: 'Fórum',
    settings: 'Configurações',
    movies: 'Filmes',
    series: 'Séries',
    nowPlaying: 'Tocando Agora',
    movie: 'Filme',
    tvShow: 'Série',
    similarSongs: 'Músicas Similares',
    queue: 'Fila de Reprodução',
    share: 'Compartilhar',
    report: 'Denunciar',
    addToQueue: 'Adicionar à Fila',
    playNext: 'Reproduzir a Seguir',
    addToFavorites: 'Adicionar aos Favoritos',
    removeFromFavorites: 'Remover dos Favoritos',
    addToPlaylist: 'Adicionar à Playlist',
    newPlaylist: 'Nova playlist com esta música',
    language: 'Idioma',
    systemLang: 'Sistema',
    profile: 'Perfil',
    player: 'Reprodutor',
    content: 'Conteúdo',
    notifications: 'Notificações',
    appearance: 'Aparência',
    storage: 'Armazenamento',
    dark: 'Escuro',
    light: 'Claro',
    system: 'Sistema',
    save: 'Salvar alterações',
    clearData: 'Limpar dados locais',
  },
  fr: {
    home: 'Accueil',
    search: 'Rechercher',
    library: 'Bibliothèque',
    favorites: 'Favoris',
    playlists: 'Playlists',
    forum: 'Forum',
    settings: 'Paramètres',
    movies: 'Films',
    series: 'Séries',
    nowPlaying: 'En Lecture',
    movie: 'Film',
    tvShow: 'Série',
    similarSongs: 'Chansons Similaires',
    queue: 'File d\'Attente',
    share: 'Partager',
    report: 'Signaler',
    addToQueue: 'Ajouter à la File',
    playNext: 'Lire Ensuite',
    addToFavorites: 'Ajouter aux Favoris',
    removeFromFavorites: 'Retirer des Favoris',
    addToPlaylist: 'Ajouter à la Playlist',
    newPlaylist: 'Nouvelle playlist avec cette chanson',
    language: 'Langue',
    systemLang: 'Système',
    profile: 'Profil',
    player: 'Lecteur',
    content: 'Contenu',
    notifications: 'Notifications',
    appearance: 'Apparence',
    storage: 'Stockage',
    dark: 'Sombre',
    light: 'Clair',
    system: 'Système',
    save: 'Enregistrer',
    clearData: 'Effacer les données locales',
  },
};

export const LANGUAGES = [
  { id: 'system' as Language, label: 'Sistema', code: 'SYS' },
  { id: 'es' as Language, label: 'Español', code: 'ES' },
  { id: 'en' as Language, label: 'English', code: 'EN' },
  { id: 'pt' as Language, label: 'Português', code: 'PT' },
  { id: 'fr' as Language, label: 'Français', code: 'FR' },
];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('resona_language');
    if (saved && (saved === 'system' || saved === 'es' || saved === 'en' || saved === 'pt' || saved === 'fr')) {
      return saved as Language;
    }
    const userLang = useAuthStore.getState().user?.preferences?.language;
    if (userLang && (userLang === 'system' || userLang === 'es' || userLang === 'en' || userLang === 'pt' || userLang === 'fr')) {
      return userLang as Language;
    }
    return 'system';
  });

  const [resolvedLanguage, setResolvedLanguage] = useState<'es' | 'en' | 'pt' | 'fr'>('es');

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('resona_language', newLang);
  }, []);

  const persistLanguage = useCallback(() => {
    localStorage.setItem('resona_language', language);
  }, [language]);

  // Sync language if auth user changes and has preferences
  useEffect(() => {
    const unsub = useAuthStore.subscribe((state) => {
      const prefLang = state.user?.preferences?.language;
      if (prefLang && (prefLang === 'system' || prefLang === 'es' || prefLang === 'en' || prefLang === 'pt' || prefLang === 'fr')) {
        setLanguageState(prefLang as Language);
        localStorage.setItem('resona_language', prefLang);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const resolveLanguage = () => {
      if (language === 'system') {
        const systemLang = navigator.language || 'es';
        setResolvedLanguage(LANG_MAP[systemLang] || 'es');
      } else {
        setResolvedLanguage(language);
      }
    };

    resolveLanguage();
    localStorage.setItem('resona_language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, resolvedLanguage, persistLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT() {
  const { resolvedLanguage } = useLanguage();
  return (key: string) => LABELS[resolvedLanguage]?.[key] || LABELS['es'][key] || key;
}
