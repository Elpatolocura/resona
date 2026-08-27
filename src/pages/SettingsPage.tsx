import { useState, useRef, useEffect } from 'react';
import { Settings, User, Music2, Film, Tv, Swords, Bell, Moon, Sun, Volume2, Globe, Save, Trash2, Sparkles, Check } from 'lucide-react';
import { cn } from '../utils/format';
import { toast } from '../store/toastStore';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTheme } from '../components/ThemeProvider';
import { useLanguage, LANGUAGES, useT } from '../components/LanguageProvider';
import { useContent } from '../components/ContentProvider';
import { useAuthStore, UserPreferences } from '../store/authStore';

interface SettingsSection {
  id: string;
  label: string;
  icon: typeof Settings;
}

const SECTIONS: SettingsSection[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'preferences', label: 'Preferencias', icon: Sparkles },
  { id: 'player', label: 'Reproductor', icon: Music2 },
  { id: 'content', label: 'Contenido', icon: Film },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'appearance', label: 'Apariencia', icon: Moon },
  { id: 'language', label: 'Idioma', icon: Globe },
  { id: 'storage', label: 'Almacenamiento', icon: Trash2 },
];

const MUSIC_GENRES = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Electrónica', 'Reggaetón', 'Salsa', 'Bachata', 'Indie', 'Clásica', 'Jazz', 'Metal', 'Country', 'Folk', 'K-Pop', 'Latin'];
const MOVIE_GENRES = ['Acción', 'Comedia', 'Drama', 'Terror', 'Ciencia ficción', 'Romance', 'Animación', 'Thriller', 'Aventura', 'Fantasía', 'Documental', 'Musical', 'Crimen', 'Misterio'];
const SERIES_GENRES = ['Drama', 'Comedia', 'Ciencia ficción', 'Crimen', 'Thriller', 'Fantasía', 'Romance', 'Documental', 'Acción', 'Animación', 'Horror', 'Reality', 'Anime', 'Medical'];

interface PlayerSettings {
  autoPlay: boolean;
  autoMix: boolean;
  audioQuality: string;
  defaultVolume: number;
}

interface NotificationSettings {
  newSongs: boolean;
  movieUpdates: boolean;
  forumActivity: boolean;
}

interface AppearanceSettings {
  animations: boolean;
  compact: boolean;
}

const DEFAULT_PLAYER: PlayerSettings = { autoPlay: true, autoMix: false, audioQuality: 'auto', defaultVolume: 80 };
const DEFAULT_NOTIFICATIONS: NotificationSettings = { newSongs: true, movieUpdates: true, forumActivity: false };
const DEFAULT_APPEARANCE: AppearanceSettings = { animations: true, compact: false };

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every((k) => a[k] === b[k]);
}

function arraysEqual(a: string[] = [], b: string[] = []): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [showClearData, setShowClearData] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { theme, setTheme, persistTheme } = useTheme();
  const { language, setLanguage, persistLanguage } = useLanguage();
  const { content, setContent, persistContent } = useContent();
  const { user, isAuthenticated, setPreferences, updateProfile } = useAuthStore();
  const t = useT();

  // Reference baselines (saved values)
  const savedThemeRef = useRef(theme);
  const savedLanguageRef = useRef(language);
  const savedContentRef = useRef(content);
  const savedProfileRef = useRef({ name: user?.name || '', email: user?.email || '' });
  const savedPreferencesRef = useRef<UserPreferences>({
    musicGenres: user?.preferences?.musicGenres || [],
    movieGenres: user?.preferences?.movieGenres || [],
    seriesGenres: user?.preferences?.seriesGenres || [],
    animeGenres: user?.preferences?.animeGenres || [],
    language: user?.preferences?.language || language || 'system',
    theme: user?.preferences?.theme || theme || 'dark',
  });

  const [savedPlayer, setSavedPlayer] = useState<PlayerSettings>(() => loadJSON('resona_player', DEFAULT_PLAYER));
  const [savedNotifications, setSavedNotifications] = useState<NotificationSettings>(() => loadJSON('resona_notifications', DEFAULT_NOTIFICATIONS));
  const [savedAppearance, setSavedAppearance] = useState<AppearanceSettings>(() => loadJSON('resona_appearance', DEFAULT_APPEARANCE));

  // Local draft states (edits remain in draft until user saves & confirms)
  const [draftProfile, setDraftProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [draftTheme, setDraftTheme] = useState(theme);
  const [draftLanguage, setDraftLanguage] = useState(language);
  const [draftContent, setDraftContent] = useState(content);
  const [draftPreferences, setDraftPreferences] = useState<UserPreferences>({
    musicGenres: user?.preferences?.musicGenres || [],
    movieGenres: user?.preferences?.movieGenres || [],
    seriesGenres: user?.preferences?.seriesGenres || [],
    animeGenres: user?.preferences?.animeGenres || [],
    language: user?.preferences?.language || language || 'system',
    theme: user?.preferences?.theme || theme || 'dark',
  });
  const [draftPlayer, setDraftPlayer] = useState<PlayerSettings>(savedPlayer);
  const [draftNotifications, setDraftNotifications] = useState<NotificationSettings>(savedNotifications);
  const [draftAppearance, setDraftAppearance] = useState<AppearanceSettings>(savedAppearance);

  // Sync draft profile/preferences when store user updates
  useEffect(() => {
    if (user) {
      const initialProfile = { name: user.name || '', email: user.email || '' };
      setDraftProfile(initialProfile);
      savedProfileRef.current = initialProfile;

      if (user.preferences) {
        const prefs: UserPreferences = {
          musicGenres: user.preferences.musicGenres || [],
          movieGenres: user.preferences.movieGenres || [],
          seriesGenres: user.preferences.seriesGenres || [],
          animeGenres: user.preferences.animeGenres || [],
          language: user.preferences.language || language || 'system',
          theme: user.preferences.theme || theme || 'dark',
        };
        setDraftPreferences(prefs);
        savedPreferencesRef.current = prefs;
      }
    }
  }, [user]);

  // Check if any draft state is dirty compared to saved baselines
  useEffect(() => {
    const profileDirty =
      draftProfile.name !== savedProfileRef.current.name ||
      draftProfile.email !== savedProfileRef.current.email;

    const themeDirty = draftTheme !== savedThemeRef.current;
    const languageDirty = draftLanguage !== savedLanguageRef.current;
    const contentDirty = !shallowEqual(draftContent as unknown as Record<string, unknown>, savedContentRef.current as unknown as Record<string, unknown>);

    const prefsDirty =
      !arraysEqual(draftPreferences.musicGenres, savedPreferencesRef.current.musicGenres) ||
      !arraysEqual(draftPreferences.movieGenres, savedPreferencesRef.current.movieGenres) ||
      !arraysEqual(draftPreferences.seriesGenres, savedPreferencesRef.current.seriesGenres) ||
      draftPreferences.language !== savedPreferencesRef.current.language ||
      draftPreferences.theme !== savedPreferencesRef.current.theme;

    const playerDirty = !shallowEqual(draftPlayer as unknown as Record<string, unknown>, savedPlayer as unknown as Record<string, unknown>);
    const notificationsDirty = !shallowEqual(draftNotifications as unknown as Record<string, unknown>, savedNotifications as unknown as Record<string, unknown>);
    const appearanceDirty = !shallowEqual(draftAppearance as unknown as Record<string, unknown>, savedAppearance as unknown as Record<string, unknown>);

    setHasChanges(profileDirty || themeDirty || languageDirty || contentDirty || prefsDirty || playerDirty || notificationsDirty || appearanceDirty);
  }, [draftProfile, draftTheme, draftLanguage, draftContent, draftPreferences, draftPlayer, draftNotifications, draftAppearance, savedPlayer, savedNotifications, savedAppearance]);

  const toggleGenre = (genre: string, key: 'musicGenres' | 'movieGenres' | 'seriesGenres') => {
    const list = draftPreferences[key];
    const updated = list.includes(genre) ? list.filter((g) => g !== genre) : [...list, genre];
    setDraftPreferences((prev) => ({ ...prev, [key]: updated }));
  };

  const handleSaveConfirmed = () => {
    // Apply theme & language globally
    setTheme(draftTheme as 'dark' | 'light' | 'system');
    persistTheme();
    savedThemeRef.current = draftTheme;

    setLanguage(draftLanguage as 'system' | 'es' | 'en' | 'pt' | 'fr');
    persistLanguage();
    savedLanguageRef.current = draftLanguage;

    // Apply content settings globally
    setContent(draftContent);
    persistContent();
    savedContentRef.current = { ...draftContent };

    // Apply profile
    updateProfile(draftProfile.name, draftProfile.email);
    savedProfileRef.current = { ...draftProfile };

    // Apply user preferences
    const finalPrefs: UserPreferences = {
      ...draftPreferences,
      language: draftLanguage,
      theme: draftTheme,
    };
    setPreferences(finalPrefs);
    savedPreferencesRef.current = { ...finalPrefs };

    // Save localStorage settings
    localStorage.setItem('resona_player', JSON.stringify(draftPlayer));
    setSavedPlayer({ ...draftPlayer });

    localStorage.setItem('resona_notifications', JSON.stringify(draftNotifications));
    setSavedNotifications({ ...draftNotifications });

    localStorage.setItem('resona_appearance', JSON.stringify(draftAppearance));
    setSavedAppearance({ ...draftAppearance });

    setShowSaveConfirm(false);
    setHasChanges(false);
    toast('¡Cambios guardados y aplicados exitosamente!', 'success');
  };

  const handleClearData = () => {
    localStorage.clear();
    toast('Datos locales eliminados', 'success');
    setShowClearData(false);
  };

  const handleDeleteAccount = () => {
    toast('Función no disponible aún', 'info');
    setShowDeleteAccount(false);
  };

  const SaveButton = () => (
    <div className="mt-6 flex justify-end border-t border-line pt-4">
      <button
        onClick={() => setShowSaveConfirm(true)}
        disabled={!hasChanges}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-lg transition',
          hasChanges
            ? 'bg-brand text-white shadow-fuchsia-500/30 hover:scale-[1.02] active:scale-95'
            : 'cursor-not-allowed bg-surface-3 text-faint',
        )}
      >
        <Save className="h-4 w-4" />
        {t('save')}
      </button>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">Configuración</h1>
        <p className="mt-2 text-muted">Personaliza tu experiencia en Resona</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <div className="w-full shrink-0 lg:w-64">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  'flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition lg:px-3',
                  activeSection === id
                    ? 'bg-brand/15 text-fuchsia-300'
                    : 'text-muted hover:bg-surface-2 hover:text-text',
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-2xl border border-line bg-surface/50 p-6">
          {/* Profile */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-text">Perfil</h2>
              
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-600/40 to-fuchsia-600/40 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white/80">
                    {draftProfile.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-text">{draftProfile.name || 'Usuario'}</p>
                  <p className="text-sm text-muted">{isAuthenticated ? 'Sesión activa' : 'No has iniciado sesión'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text">Nombre de usuario</label>
                  <input
                    type="text"
                    value={draftProfile.name}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-text outline-none transition focus:border-fuchsia-400/40"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text">Correo electrónico</label>
                  <input
                    type="email"
                    value={draftProfile.email}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-text outline-none transition focus:border-fuchsia-400/40"
                  />
                </div>
              </div>

              <SaveButton />
            </div>
          )}

          {/* Preferences */}
          {activeSection === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-text">Mis Preferencias</h2>
                <p className="mt-1 text-sm text-muted">Configura tus gustos de contenido registrados en tu cuenta</p>
              </div>

              <div className="space-y-6">
                {/* Music Genres */}
                <div className="rounded-xl border border-line p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Music2 className="h-5 w-5 text-fuchsia-300" />
                    <h3 className="font-semibold text-text">Música Preferida</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MUSIC_GENRES.map((genre) => {
                      const selected = draftPreferences.musicGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          onClick={() => toggleGenre(genre, 'musicGenres')}
                          className={cn(
                            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                            selected
                              ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                              : 'border-line text-muted hover:text-text',
                          )}
                        >
                          {selected && <Check className="h-3 w-3" />}
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Movie Genres */}
                <div className="rounded-xl border border-line p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Film className="h-5 w-5 text-blue-300" />
                    <h3 className="font-semibold text-text">Películas Preferidas</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MOVIE_GENRES.map((genre) => {
                      const selected = draftPreferences.movieGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          onClick={() => toggleGenre(genre, 'movieGenres')}
                          className={cn(
                            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                            selected
                              ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                              : 'border-line text-muted hover:text-text',
                          )}
                        >
                          {selected && <Check className="h-3 w-3" />}
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Series Genres */}
                <div className="rounded-xl border border-line p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Tv className="h-5 w-5 text-emerald-300" />
                    <h3 className="font-semibold text-text">Series Preferidas</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SERIES_GENRES.map((genre) => {
                      const selected = draftPreferences.seriesGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          onClick={() => toggleGenre(genre, 'seriesGenres')}
                          className={cn(
                            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                            selected
                              ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                              : 'border-line text-muted hover:text-text',
                          )}
                        >
                          {selected && <Check className="h-3 w-3" />}
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <SaveButton />
            </div>
          )}

          {/* Player */}
          {activeSection === 'player' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-text">Reproductor</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Reproducción automática</p>
                    <p className="text-sm text-muted">Siguiente canción al finalizar</p>
                  </div>
                  <button
                    onClick={() => setDraftPlayer((s) => ({ ...s, autoPlay: !s.autoPlay }))}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition',
                      draftPlayer.autoPlay ? 'bg-brand' : 'bg-surface-3',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      draftPlayer.autoPlay ? 'left-5.5' : 'left-0.5',
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Mezcla automática</p>
                    <p className="text-sm text-muted">Transiciones suaves entre canciones</p>
                  </div>
                  <button
                    onClick={() => setDraftPlayer((s) => ({ ...s, autoMix: !s.autoMix }))}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition',
                      draftPlayer.autoMix ? 'bg-brand' : 'bg-surface-3',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      draftPlayer.autoMix ? 'left-5.5' : 'left-0.5',
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Calidad de audio</p>
                    <p className="text-sm text-muted">Mayor calidad consume más datos</p>
                  </div>
                  <select
                    value={draftPlayer.audioQuality}
                    onChange={(e) => setDraftPlayer((s) => ({ ...s, audioQuality: e.target.value }))}
                    className="rounded-xl border border-line bg-surface-2 px-3 py-1.5 text-sm text-text outline-none"
                  >
                    <option value="auto">Automática</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-muted" />
                    <div>
                      <p className="font-medium text-text">Volumen por defecto</p>
                      <p className="text-sm text-muted">Volumen inicial al abrir la app</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={draftPlayer.defaultVolume}
                      onChange={(e) => setDraftPlayer((s) => ({ ...s, defaultVolume: parseInt(e.target.value) }))}
                      className="w-24 accent-fuchsia-500"
                    />
                    <span className="w-8 text-right text-sm text-muted">{draftPlayer.defaultVolume}%</span>
                  </div>
                </div>
              </div>

              <SaveButton />
            </div>
          )}

          {/* Content */}
          {activeSection === 'content' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-text">Contenido</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div className="flex items-center gap-3">
                    <Music2 className="h-5 w-5 text-fuchsia-300" />
                    <div>
                      <p className="font-medium text-text">Música</p>
                      <p className="text-sm text-muted">Mostrar contenido musical</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDraftContent((c) => ({ ...c, showMusic: !c.showMusic }))}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition',
                      draftContent.showMusic ? 'bg-brand' : 'bg-surface-3',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      draftContent.showMusic ? 'left-5.5' : 'left-0.5',
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div className="flex items-center gap-3">
                    <Film className="h-5 w-5 text-blue-300" />
                    <div>
                      <p className="font-medium text-text">Películas</p>
                      <p className="text-sm text-muted">Mostrar películas en tendencia</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDraftContent((c) => ({ ...c, showMovies: !c.showMovies }))}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition',
                      draftContent.showMovies ? 'bg-brand' : 'bg-surface-3',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      draftContent.showMovies ? 'left-5.5' : 'left-0.5',
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div className="flex items-center gap-3">
                    <Tv className="h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="font-medium text-text">Series</p>
                      <p className="text-sm text-muted">Mostrar series en tendencia</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDraftContent((c) => ({ ...c, showSeries: !c.showSeries }))}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition',
                      draftContent.showSeries ? 'bg-brand' : 'bg-surface-3',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      draftContent.showSeries ? 'left-5.5' : 'left-0.5',
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div className="flex items-center gap-3">
                    <Swords className="h-5 w-5 text-red-300" />
                    <div>
                      <p className="font-medium text-text">Anime</p>
                      <p className="text-sm text-muted">Mostrar anime en tendencia</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDraftContent((c) => ({ ...c, showAnime: !c.showAnime }))}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition',
                      draftContent.showAnime ? 'bg-brand' : 'bg-surface-3',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      draftContent.showAnime ? 'left-5.5' : 'left-0.5',
                    )} />
                  </button>
                </div>

                <div className="rounded-xl border border-line p-4">
                  <p className="mb-2 font-medium text-text">Contenido explícito</p>
                  <p className="mb-3 text-sm text-muted">Mostrar contenido con clasificación explícita</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDraftContent((c) => ({ ...c, explicitContent: true }))}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium transition',
                        draftContent.explicitContent
                          ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                          : 'border-line text-muted hover:text-text',
                      )}
                    >
                      Permitir
                    </button>
                    <button
                      onClick={() => setDraftContent((c) => ({ ...c, explicitContent: false }))}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium transition',
                        !draftContent.explicitContent
                          ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                          : 'border-line text-muted hover:text-text',
                      )}
                    >
                      No permitir
                    </button>
                  </div>
                </div>
              </div>

              <SaveButton />
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-text">Notificaciones</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Nuevas canciones</p>
                    <p className="text-sm text-muted">Cuando tus artistas favoritos publiquen</p>
                  </div>
                  <button
                    onClick={() => setDraftNotifications((s) => ({ ...s, newSongs: !s.newSongs }))}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition',
                      draftNotifications.newSongs ? 'bg-brand' : 'bg-surface-3',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      draftNotifications.newSongs ? 'left-5.5' : 'left-0.5',
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Actualizaciones de películas</p>
                    <p className="text-sm text-muted">Nuevas películas disponibles</p>
                  </div>
                  <button
                    onClick={() => setDraftNotifications((s) => ({ ...s, movieUpdates: !s.movieUpdates }))}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition',
                      draftNotifications.movieUpdates ? 'bg-brand' : 'bg-surface-3',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      draftNotifications.movieUpdates ? 'left-5.5' : 'left-0.5',
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Actividad del foro</p>
                    <p className="text-sm text-muted">Respuestas a tus publicaciones</p>
                  </div>
                  <button
                    onClick={() => setDraftNotifications((s) => ({ ...s, forumActivity: !s.forumActivity }))}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition',
                      draftNotifications.forumActivity ? 'bg-brand' : 'bg-surface-3',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      draftNotifications.forumActivity ? 'left-5.5' : 'left-0.5',
                    )} />
                  </button>
                </div>
              </div>

              <SaveButton />
            </div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-text">Apariencia</h2>
              
              <div className="space-y-4">
                <div className="rounded-xl border border-line p-4">
                  <p className="mb-3 font-medium text-text">Tema</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDraftTheme('dark')}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-4 py-3 transition',
                        draftTheme === 'dark' ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300' : 'border-line text-muted hover:text-text',
                      )}
                    >
                      <Moon className="h-4 w-4" />
                      <span className="text-sm font-medium">Oscuro</span>
                    </button>
                    <button
                      onClick={() => setDraftTheme('light')}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-4 py-3 transition',
                        draftTheme === 'light' ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300' : 'border-line text-muted hover:text-text',
                      )}
                    >
                      <Sun className="h-4 w-4" />
                      <span className="text-sm font-medium">Claro</span>
                    </button>
                    <button
                      onClick={() => setDraftTheme('system')}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-4 py-3 transition',
                        draftTheme === 'system' ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300' : 'border-line text-muted hover:text-text',
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      <span className="text-sm font-medium">Sistema</span>
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-muted">Los cambios se aplicarán a la aplicación únicamente al guardar y confirmar.</p>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Animaciones</p>
                    <p className="text-sm text-muted">Efectos visuales y transiciones</p>
                  </div>
                  <button
                    onClick={() => setDraftAppearance((s) => ({ ...s, animations: !s.animations }))}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition',
                      draftAppearance.animations ? 'bg-brand' : 'bg-surface-3',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      draftAppearance.animations ? 'left-5.5' : 'left-0.5',
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Compacto</p>
                    <p className="text-sm text-muted">Mostrar más contenido en pantalla</p>
                  </div>
                  <button
                    onClick={() => setDraftAppearance((s) => ({ ...s, compact: !s.compact }))}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition',
                      draftAppearance.compact ? 'bg-brand' : 'bg-surface-3',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      draftAppearance.compact ? 'left-5.5' : 'left-0.5',
                    )} />
                  </button>
                </div>
              </div>

              <SaveButton />
            </div>
          )}

          {/* Language */}
          {activeSection === 'language' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-text">{t('language')}</h2>
              
              <div className="space-y-4">
                <div className="rounded-xl border border-line p-4">
                  <p className="mb-3 font-medium text-text">{t('language')} de la interfaz</p>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setDraftLanguage(id)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border px-4 py-2.5 transition',
                          draftLanguage === id
                            ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                            : 'border-line text-muted hover:text-text',
                        )}
                      >
                        <Globe className="h-4 w-4" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted">El idioma seleccionado se aplicará al presionar Guardar y confirmar.</p>
                </div>

                <div className="rounded-xl border border-line p-4">
                  <p className="mb-3 font-medium text-text">Contenido en español</p>
                  <p className="mb-3 text-sm text-muted">Filtrar películas, series y música en español</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDraftContent((c) => ({ ...c, spanishOnly: true }))}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium transition',
                        draftContent.spanishOnly
                          ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                          : 'border-line text-muted hover:text-text',
                      )}
                    >
                      Solo español
                    </button>
                    <button
                      onClick={() => setDraftContent((c) => ({ ...c, spanishOnly: false }))}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium transition',
                        !draftContent.spanishOnly
                          ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                          : 'border-line text-muted hover:text-text',
                      )}
                    >
                      Todos los idiomas
                    </button>
                  </div>
                </div>
              </div>

              <SaveButton />
            </div>
          )}

          {/* Storage */}
          {activeSection === 'storage' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-text">Almacenamiento</h2>
              
              <div className="space-y-4">
                <div className="rounded-xl border border-line p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-text">Datos locales</p>
                    <span className="text-sm text-muted">~2.4 MB</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">Favoritos, playlists, configuración, caché</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Caché de imágenes</p>
                    <p className="text-sm text-muted">~1.8 MB</p>
                  </div>
                  <button className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-red-400/40 hover:text-red-300">
                    Limpiar
                  </button>
                </div>

                <button
                  onClick={() => setShowClearData(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Borrar todos los datos locales
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showClearData}
        title="Borrar datos locales"
        message="Se eliminarán tus favoritos, playlists, configuración y caché. Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        onClose={() => setShowClearData(false)}
        onConfirm={handleClearData}
      />

      <ConfirmDialog
        open={showDeleteAccount}
        title="Eliminar cuenta"
        message="Esta función no está disponible aún."
        confirmLabel="Entendido"
        onClose={() => setShowDeleteAccount(false)}
        onConfirm={handleDeleteAccount}
      />

      <ConfirmDialog
        open={showSaveConfirm}
        title="¿Deseas guardar los cambios?"
        message="¿Estás seguro de que deseas guardar y activar los cambios realizados en tu configuración?"
        confirmLabel="Sí, deseo guardar"
        cancelLabel="Cancelar"
        danger={false}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSaveConfirmed}
      />
    </div>
  );
}
