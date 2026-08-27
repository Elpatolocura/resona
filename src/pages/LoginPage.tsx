import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc3, Mail, Lock, User, Eye, EyeOff, ArrowLeft, ArrowRight, Music2, Film, Tv, Globe, Moon, Sun, Settings, Check } from 'lucide-react';
import { useAuthStore, UserPreferences } from '../store/authStore';
import { useTheme } from '../components/ThemeProvider';
import { useLanguage, LANGUAGES } from '../components/LanguageProvider';
import { useContent, ContentSettings } from '../components/ContentProvider';
import { cn } from '../utils/format';
import { toast } from '../store/toastStore';

type Step = 'login' | 'register' | 'preferences-music' | 'preferences-movies' | 'preferences-series' | 'preferences-setup' | 'forgot' | 'reset-password' | 'reset-sent';

const MUSIC_GENRES = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Electrónica', 'Reggaetón', 'Salsa', 'Bachata', 'Indie', 'Clásica', 'Jazz', 'Metal', 'Country', 'Folk', 'K-Pop', 'Latin'];
const MOVIE_GENRES = ['Acción', 'Comedia', 'Drama', 'Terror', 'Ciencia ficción', 'Romance', 'Animación', 'Thriller', 'Aventura', 'Fantasía', 'Documental', 'Musical', 'Crimen', 'Misterio'];
const SERIES_GENRES = ['Drama', 'Comedia', 'Ciencia ficción', 'Crimen', 'Thriller', 'Fantasía', 'Romance', 'Documental', 'Acción', 'Animación', 'Horror', 'Reality', 'Anime', 'Medical'];

interface LoginPageProps {
  onPreferencesSaved?: () => void;
}

export default function LoginPage({ onPreferencesSaved }: LoginPageProps) {
  const navigate = useNavigate();
  const { login, register, setPreferences, updatePassword } = useAuthStore();
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();
  const { setContent } = useContent();

  const [step, setStep] = useState<Step>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [selectedMusic, setSelectedMusic] = useState<string[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [prefLanguage, setPrefLanguage] = useState('system');
  const [prefTheme, setPrefTheme] = useState('dark');

  const toggleGenre = (genre: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(genre) ? list.filter((g) => g !== genre) : [...list, genre]);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.preferences) {
          const prefs = currentUser.preferences;
          setTheme(prefs.theme as 'dark' | 'light' | 'system');
          setLanguage(prefs.language as 'system' | 'es' | 'en' | 'pt' | 'fr');
          if (prefs.musicGenres.length === 0 && prefs.movieGenres.length === 0) {
            setContent({ showMusic: true, showMovies: true, showSeries: true, explicitContent: false });
          }
        }
        toast('Bienvenido de vuelta', 'success');
        navigate('/');
      } else {
        toast('Correo o contraseña incorrectos', 'error');
      }
      setLoading(false);
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast('Por favor completa todos los campos', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const success = register(name, email, password);
      if (success) {
        setStep('preferences-music');
      } else {
        toast('Error al crear la cuenta', 'error');
      }
      setLoading(false);
    }, 600);
  };

  const handleSavePreferences = () => {
    const prefs: UserPreferences = {
      musicGenres: selectedMusic,
      movieGenres: selectedMovies,
      seriesGenres: selectedSeries,
      language: prefLanguage,
      theme: prefTheme,
    };
    setPreferences(prefs);
    setTheme(prefTheme as 'dark' | 'light' | 'system');
    setLanguage(prefLanguage as 'system' | 'es' | 'en' | 'pt' | 'fr');
    setContent({
      showMusic: selectedMusic.length > 0,
      showMovies: selectedMovies.length > 0,
      showSeries: selectedSeries.length > 0,
      explicitContent: false,
    });
    if (onPreferencesSaved) {
      onPreferencesSaved();
    }
    toast('Preferencias guardadas. ¡Bienvenido a Resona!', 'success');
    navigate('/');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast('Ingresa tu correo electrónico', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setStep('reset-password');
      setLoading(false);
    }, 600);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast('Por favor completa los campos de contraseña', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Las contraseñas no coinciden', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const success = updatePassword(resetEmail, newPassword);
      if (success) {
        toast('Contraseña restablecida exitosamente', 'success');
        setStep('login');
        setEmail(resetEmail);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast('Error al restablecer la contraseña', 'error');
      }
      setLoading(false);
    }, 800);
  };

  const renderLogin = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Correo electrónico</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-faint" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full rounded-xl border border-line bg-surface-2 py-3 pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-faint" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full rounded-xl border border-line bg-surface-2 py-3 pl-10 pr-10 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition hover:text-text"
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setStep('forgot')}
          className="text-sm text-fuchsia-400 transition hover:text-fuchsia-300"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Iniciando sesión...
          </div>
        ) : (
          'Iniciar sesión'
        )}
      </button>
    </form>
  );

  const renderRegister = () => (
    <form onSubmit={handleRegisterSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Nombre</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-faint" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full rounded-xl border border-line bg-surface-2 py-3 pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Correo electrónico</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-faint" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full rounded-xl border border-line bg-surface-2 py-3 pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-faint" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full rounded-xl border border-line bg-surface-2 py-3 pl-10 pr-10 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition hover:text-text"
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Creando cuenta...
          </div>
        ) : (
          'Crear cuenta'
        )}
      </button>
    </form>
  );

  const renderPreferenceStep = (
    title: string,
    subtitle: string,
    Icon: typeof Music2,
    genres: string[],
    selected: string[],
    onToggle: (g: string) => void,
    onNext: () => void,
    onBack: () => void,
    stepNum: number,
    total: number,
  ) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20">
          <Icon className="h-5 w-5 text-fuchsia-300" />
        </div>
        <div>
          <h3 className="font-bold text-text">{title}</h3>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={cn('h-1.5 flex-1 rounded-full', i < stepNum ? 'bg-brand' : 'bg-surface-3')} />
        ))}
        <span className="ml-1">{stepNum}/{total}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onToggle(genre)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition',
              selected.includes(genre)
                ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                : 'border-line text-muted hover:text-text hover:border-fuchsia-400/30',
            )}
          >
            {selected.includes(genre) && <Check className="h-3 w-3" />}
            {genre}
          </button>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-muted transition hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </button>
        <button
          onClick={onNext}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02] active:scale-95"
        >
          {selected.length === 0 ? 'Omitir' : 'Continuar'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderPreferencesSetup = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20">
          <Settings className="h-5 w-5 text-fuchsia-300" />
        </div>
        <div>
          <h3 className="font-bold text-text">Configura tu plataforma</h3>
          <p className="text-xs text-muted">Idioma y tema de Resona</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={cn('h-1.5 flex-1 rounded-full', i < 3 ? 'bg-brand' : 'bg-surface-3')} />
        ))}
        <span className="ml-1">3/3</span>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-line p-4">
          <div className="mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted" />
            <p className="text-sm font-medium text-text">Idioma de la plataforma</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setPrefLanguage(id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2 transition',
                  prefLanguage === id
                    ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                    : 'border-line text-muted hover:text-text',
                )}
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line p-4">
          <div className="mb-3 flex items-center gap-2">
            <Moon className="h-4 w-4 text-muted" />
            <p className="text-sm font-medium text-text">Tema</p>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'dark', label: 'Oscuro', icon: Moon },
              { id: 'light', label: 'Claro', icon: Sun },
              { id: 'system', label: 'Sistema', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPrefTheme(id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-4 py-2.5 transition',
                  prefTheme === id
                    ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                    : 'border-line text-muted hover:text-text',
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setStep('preferences-series')}
          className="flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-muted transition hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </button>
        <button
          onClick={handleSavePreferences}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02] active:scale-95"
        >
          <Check className="h-4 w-4" />
          ¡Empezar!
        </button>
      </div>
    </div>
  );

  const renderForgot = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      <div className="text-center">
        <h3 className="font-bold text-text">Recuperar contraseña</h3>
        <p className="mt-1 text-sm text-muted">Ingresa tu correo electrónico para restablecer tu contraseña</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Correo electrónico</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-faint" />
          <input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full rounded-xl border border-line bg-surface-2 py-3 pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Verificando...
          </div>
        ) : (
          'Continuar'
        )}
      </button>

      <button
        type="button"
        onClick={() => setStep('login')}
        className="flex w-full items-center justify-center gap-2 text-sm text-muted transition hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio de sesión
      </button>
    </form>
  );

  const renderResetPassword = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="text-center">
        <h3 className="font-bold text-text">Nueva contraseña</h3>
        <p className="mt-1 text-sm text-muted">Crea una nueva contraseña para <span className="font-medium text-text">{resetEmail}</span></p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Nueva contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-faint" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full rounded-xl border border-line bg-surface-2 py-3 pl-10 pr-10 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition hover:text-text"
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Confirmar nueva contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-faint" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full rounded-xl border border-line bg-surface-2 py-3 pl-10 pr-10 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Guardando...
          </div>
        ) : (
          'Restablecer contraseña'
        )}
      </button>

      <button
        type="button"
        onClick={() => setStep('forgot')}
        className="flex w-full items-center justify-center gap-2 text-sm text-muted transition hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>
    </form>
  );

  const renderResetSent = () => (
    <div className="space-y-4 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
        <Check className="h-6 w-6 text-emerald-300" />
      </div>
      <h3 className="font-bold text-text">Correo enviado</h3>
      <p className="text-sm text-muted">
        Si existe una cuenta asociada a <span className="font-medium text-text">{resetEmail}</span>, recibirás un correo con las instrucciones para recuperar tu contraseña.
      </p>

      <div className="rounded-xl border border-line p-4 text-left">
        <p className="mb-2 text-sm font-medium text-text">¿No recibiste el correo?</p>
        <ul className="space-y-1 text-xs text-muted">
          <li>• Revisa tu carpeta de spam o junk</li>
          <li>• Verifica que el correo sea correcto</li>
          <li>• Espera unos minutos y vuelve a intentar</li>
        </ul>
      </div>

      <button
        onClick={() => { setStep('login'); setResetEmail(''); }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02] active:scale-95"
      >
        Volver al inicio de sesión
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-bg to-surface p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {step !== 'login' && step !== 'forgot' && step !== 'reset-password' && step !== 'reset-sent' && (
          <button
            onClick={() => {
              if (step === 'register') setStep('login');
              else if (step === 'preferences-music') setStep('register');
              else if (step === 'preferences-movies') setStep('preferences-music');
              else if (step === 'preferences-series') setStep('preferences-movies');
              else if (step === 'preferences-setup') setStep('preferences-series');
            }}
            className="mb-6 flex items-center gap-2 text-sm text-muted transition hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
        )}

        {(step === 'login' || step === 'forgot' || step === 'reset-password' || step === 'reset-sent') && (
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm text-muted transition hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
        )}

        <div className="rounded-3xl border border-line bg-surface/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-fuchsia-500/30">
              <Disc3 className="h-8 w-8 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-text">Resona</h1>
            <p className="mt-1 text-sm text-muted">
              {step === 'login' && 'Inicia sesión para continuar'}
              {step === 'register' && 'Crea tu cuenta'}
              {step === 'forgot' && 'Recupera tu acceso'}
              {step === 'reset-password' && 'Ingresa tu nueva contraseña'}
              {step === 'reset-sent' && 'Revisa tu correo'}
              {step === 'preferences-music' && '¿Qué música te gusta?'}
              {step === 'preferences-movies' && '¿Qué películas prefieres?'}
              {step === 'preferences-series' && '¿Qué series te interesan?'}
              {step === 'preferences-setup' && 'Personaliza tu experiencia'}
            </p>
          </div>

          {step === 'login' && renderLogin()}
          {step === 'register' && renderRegister()}
          {step === 'forgot' && renderForgot()}
          {step === 'reset-password' && renderResetPassword()}
          {step === 'reset-sent' && renderResetSent()}
          {step === 'preferences-music' && renderPreferenceStep(
            'Géneros musicales',
            'Selecciona tus favoritos (puedes omitir)',
            Music2,
            MUSIC_GENRES,
            selectedMusic,
            (g) => toggleGenre(g, selectedMusic, setSelectedMusic),
            () => setStep('preferences-movies'),
            () => setStep('register'),
            1, 3,
          )}
          {step === 'preferences-movies' && renderPreferenceStep(
            'Géneros de películas',
            '¿Qué tipo de películas disfrutas?',
            Film,
            MOVIE_GENRES,
            selectedMovies,
            (g) => toggleGenre(g, selectedMovies, setSelectedMovies),
            () => setStep('preferences-series'),
            () => setStep('preferences-music'),
            2, 3,
          )}
          {step === 'preferences-series' && renderPreferenceStep(
            'Géneros de series',
            'Elige tus series favoritas',
            Tv,
            SERIES_GENRES,
            selectedSeries,
            (g) => toggleGenre(g, selectedSeries, setSelectedSeries),
            () => setStep('preferences-setup'),
            () => setStep('preferences-movies'),
            3, 3,
          )}
          {step === 'preferences-setup' && renderPreferencesSetup()}

          {step === 'login' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => { setStep('register'); setEmail(''); setPassword(''); }}
                className="text-sm text-muted transition hover:text-fuchsia-300"
              >
                ¿No tienes cuenta? <span className="font-semibold text-fuchsia-300">Regístrate</span>
              </button>
            </div>
          )}

          {step === 'register' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => { setStep('login'); setName(''); setEmail(''); setPassword(''); }}
                className="text-sm text-muted transition hover:text-fuchsia-300"
              >
                ¿Ya tienes cuenta? <span className="font-semibold text-fuchsia-300">Inicia sesión</span>
              </button>
            </div>
          )}

          <div className="mt-8 border-t border-line pt-6">
            <p className="text-center text-xs text-faint">
              Al continuar, aceptas los términos y condiciones de Resona.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
