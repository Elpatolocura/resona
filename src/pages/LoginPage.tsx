import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc3, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/format';
import { toast } from '../store/toastStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      let success: boolean;
      if (isLogin) {
        success = login(email, password);
      } else {
        success = register(name, email, password);
      }

      if (success) {
        toast(isLogin ? 'Bienvenido de vuelta' : 'Cuenta creada exitosamente', 'success');
        navigate('/');
      } else {
        toast('Por favor completa todos los campos', 'error');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-bg to-surface p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-muted transition hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="rounded-3xl border border-line bg-surface/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-fuchsia-500/30">
              <Disc3 className="h-8 w-8 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-text">Resona</h1>
            <p className="mt-1 text-sm text-muted">
              {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
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
            )}

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
                  {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                </div>
              ) : (
                isLogin ? 'Iniciar sesión' : 'Crear cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted transition hover:text-fuchsia-300"
            >
              {isLogin ? (
                '¿No tienes cuenta? <span className="font-semibold text-fuchsia-300">Regístrate</span>'
              ) : (
                '¿Ya tienes cuenta? <span className="font-semibold text-fuchsia-300">Inicia sesión</span>'
              )}
            </button>
          </div>

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
