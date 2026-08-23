import { useState } from 'react';
import { Settings, User, Music2, Film, Tv, Bell, Moon, Sun, Volume2, Globe, Save, Trash2, LogOut } from 'lucide-react';
import { cn } from '../utils/format';
import { toast } from '../store/toastStore';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTheme } from '../components/ThemeProvider';

interface SettingsSection {
  id: string;
  label: string;
  icon: typeof Settings;
}

const SECTIONS: SettingsSection[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'player', label: 'Reproductor', icon: Music2 },
  { id: 'content', label: 'Contenido', icon: Film },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'appearance', label: 'Apariencia', icon: Moon },
  { id: 'language', label: 'Idioma', icon: Globe },
  { id: 'storage', label: 'Almacenamiento', icon: Trash2 },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [showClearData, setShowClearData] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleClearData = () => {
    localStorage.clear();
    toast('Datos locales eliminados', 'success');
    setShowClearData(false);
  };

  const handleDeleteAccount = () => {
    toast('Función no disponible aún', 'info');
    setShowDeleteAccount(false);
  };

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
                  <User className="h-10 w-10 text-white/60" />
                </div>
                <div>
                  <p className="font-semibold text-text">Usuario de Resona</p>
                  <p className="text-sm text-muted">Miembro desde 2024</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text">Nombre de usuario</label>
                  <input type="text" defaultValue="Usuario Resona" className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-text outline-none transition focus:border-fuchsia-400/40" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text">Correo electrónico</label>
                  <input type="email" defaultValue="usuario@resona.app" className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-text outline-none transition focus:border-fuchsia-400/40" />
                </div>
              </div>
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
                  <button className="relative h-6 w-11 rounded-full bg-brand transition">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Mezcla automática</p>
                    <p className="text-sm text-muted">Transiciones suaves entre canciones</p>
                  </div>
                  <button className="relative h-6 w-11 rounded-full bg-surface-3 transition">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-faint shadow transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Calidad de audio</p>
                    <p className="text-sm text-muted">Mayor calidad consume más datos</p>
                  </div>
                  <select className="rounded-xl border border-line bg-surface-2 px-3 py-1.5 text-sm text-text outline-none">
                    <option>Automática</option>
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Baja</option>
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
                    <input type="range" min="0" max="100" defaultValue="80" className="w-24 accent-fuchsia-500" />
                    <span className="w-8 text-right text-sm text-muted">80%</span>
                  </div>
                </div>
              </div>
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
                  <button className="relative h-6 w-11 rounded-full bg-brand transition">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
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
                  <button className="relative h-6 w-11 rounded-full bg-brand transition">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
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
                  <button className="relative h-6 w-11 rounded-full bg-brand transition">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </button>
                </div>

                <div className="rounded-xl border border-line p-4">
                  <p className="mb-2 font-medium text-text">Contenido explícito</p>
                  <p className="mb-3 text-sm text-muted">Mostrar contenido con clasificación explícita</p>
                  <div className="flex gap-2">
                    <button className="rounded-full border border-fuchsia-400/50 bg-brand/15 px-4 py-2 text-sm font-medium text-fuchsia-300">
                      Permitir
                    </button>
                    <button className="rounded-full border border-line px-4 py-2 text-sm font-medium text-muted hover:text-text">
                      No permitir
                    </button>
                  </div>
                </div>
              </div>
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
                  <button className="relative h-6 w-11 rounded-full bg-brand transition">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Actualizaciones de películas</p>
                    <p className="text-sm text-muted">Nuevas películas disponibles</p>
                  </div>
                  <button className="relative h-6 w-11 rounded-full bg-brand transition">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Actividad del foro</p>
                    <p className="text-sm text-muted">Respuestas a tus publicaciones</p>
                  </div>
                  <button className="relative h-6 w-11 rounded-full bg-surface-3 transition">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-faint shadow transition-transform" />
                  </button>
                </div>
              </div>
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
                      onClick={() => setTheme('dark')}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-4 py-3 transition',
                        theme === 'dark' ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300' : 'border-line text-muted hover:text-text',
                      )}
                    >
                      <Moon className="h-4 w-4" />
                      <span className="text-sm font-medium">Oscuro</span>
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-4 py-3 transition',
                        theme === 'light' ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300' : 'border-line text-muted hover:text-text',
                      )}
                    >
                      <Sun className="h-4 w-4" />
                      <span className="text-sm font-medium">Claro</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-4 py-3 transition',
                        theme === 'system' ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300' : 'border-line text-muted hover:text-text',
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      <span className="text-sm font-medium">Sistema</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Animaciones</p>
                    <p className="text-sm text-muted">Efectos visuales y transiciones</p>
                  </div>
                  <button className="relative h-6 w-11 rounded-full bg-brand transition">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Compacto</p>
                    <p className="text-sm text-muted">Mostrar más contenido en pantalla</p>
                  </div>
                  <button className="relative h-6 w-11 rounded-full bg-surface-3 transition">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-faint shadow transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Language */}
          {activeSection === 'language' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-text">Idioma y región</h2>
              
              <div className="space-y-4">
                <div className="rounded-xl border border-line p-4">
                  <p className="mb-3 font-medium text-text">Idioma de la interfaz</p>
                  <select className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-text outline-none">
                    <option>Español</option>
                    <option>English</option>
                    <option>Português</option>
                    <option>Français</option>
                  </select>
                </div>

                <div className="rounded-xl border border-line p-4">
                  <p className="mb-3 font-medium text-text">Región</p>
                  <select className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-text outline-none">
                    <option>Latinoamérica</option>
                    <option>España</option>
                    <option>Estados Unidos</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-medium text-text">Solo contenido en español</p>
                    <p className="text-sm text-muted">Filtrar películas, series y música</p>
                  </div>
                  <button className="relative h-6 w-11 rounded-full bg-brand transition">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </button>
                </div>
              </div>
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

          {/* Save button (only for profile) */}
          {activeSection === 'profile' && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => toast('Cambios guardados', 'success')}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02] active:scale-95"
              >
                <Save className="h-4 w-4" />
                Guardar cambios
              </button>
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
    </div>
  );
}
