import React, { useState } from 'react';
import { UserSession } from '../types';
import { loginWithEmail, registerWithEmail } from '../services/localAuth';

interface AuthPanelProps {
  onBack: () => void;
  onSuccess: (session: UserSession) => void;
}

type AuthMode = 'login' | 'register';

export const AuthPanel: React.FC<AuthPanelProps> = ({ onBack, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailAccess = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const session = mode === 'register'
        ? registerWithEmail({ name, email, password })
        : loginWithEmail({ email, password });

      onSuccess(session);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'No se pudo iniciar la sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8f2_0%,#f8fafc_48%,#eef5ff_100%)] px-6 py-10 text-slate-950 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[36px] bg-slate-950 p-8 text-white shadow-[0_30px_100px_rgba(15,23,42,0.24)] lg:p-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-slate-200 transition hover:border-white/20 hover:text-white"
          >
            <span>{'<'}</span>
            Volver
          </button>

          <p className="mt-8 text-xs font-black uppercase tracking-[0.35em] text-orange-300">Acceso a plataforma</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">Entra al nuevo Laboratorio de Invitaciones.</h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Desde aquí se activa el panel con plantillas, editor, guardado de proyectos, tutorial y vista final de cada invitación.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              'Registro con correo y contraseña.',
              'Acceso directo desde la interfaz original del laboratorio.',
              'Historial y proyectos guardados dentro del panel.',
              'Panel renovado con sidebar ocultable y perfil circular.',
            ].map((item) => (
              <div key={item} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold leading-7 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[36px] border border-black/5 bg-white p-8 shadow-[0_30px_100px_rgba(15,23,42,0.08)] lg:p-10">
          <div className="flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-black uppercase tracking-[0.22em] transition ${
                mode === 'register' ? 'bg-slate-950 text-white' : 'text-slate-500'
              }`}
            >
              Registro
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-black uppercase tracking-[0.22em] transition ${
                mode === 'login' ? 'bg-slate-950 text-white' : 'text-slate-500'
              }`}
            >
              Iniciar sesión
            </button>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleEmailAccess}>
            {mode === 'register' && (
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">Nombre</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tu nombre o nombre del estudio"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">Correo</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo para tu acceso"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {isSubmitting ? 'Procesando...' : mode === 'register' ? 'Crear cuenta' : 'Entrar'}
              </button>
            </div>
          </form>

          <div className="mt-6 rounded-[28px] border border-orange-200 bg-orange-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-700">Primer acceso</p>
            <p className="mt-2 text-sm leading-7 text-orange-800">
              Si aún no tienes cuenta, usa la pestaña de registro. Si ya cuentas con acceso, entra con tu correo y contraseña.
            </p>
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-500">
            El acceso vuelve a iniciar desde esta pantalla para conservar el flujo original del laboratorio.
          </p>
        </div>
      </div>
    </div>
  );
};
