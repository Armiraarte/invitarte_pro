import React, { useState } from 'react';
import { UserSession } from '../types';

interface SettingsPanelProps {
  currentUser: UserSession;
  onUpdateProfile: (payload: { name: string; avatarUrl?: string }) => void;
  onLogout: () => void;
}

const readFileAsDataUrl = (file: File) => (
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  })
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  currentUser,
  onUpdateProfile,
  onLogout,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [message, setMessage] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarUrl(dataUrl);
      setMessage('Foto cargada. Guarda cambios para verla en el sidebar.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cargar la foto.');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-[32px] bg-slate-950 p-8 text-white shadow-[0_30px_100px_rgba(15,23,42,0.18)]">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-300">Perfil</p>
        <div className="mt-6 flex items-center gap-4">
          <div
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/10 text-2xl font-black uppercase"
            style={{ backgroundColor: currentUser.avatarColor }}
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                width={80}
                height={80}
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              currentUser.name.slice(0, 2)
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black">{currentUser.name}</h2>
            <p className="mt-1 text-sm text-slate-300">{currentUser.email}</p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-orange-300">
              Acceso {currentUser.provider === 'guest' ? 'Local' : 'Cuenta'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">Nombre visible</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-orange-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">Foto de perfil</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600"
            />
          </label>

          {avatarUrl && (
            <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Vista previa</p>
              <div className="flex h-24 w-24 overflow-hidden rounded-full border border-slate-200">
                <img
                  src={avatarUrl}
                  alt="Vista previa de avatar"
                  width={96}
                  height={96}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
              {message}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                onUpdateProfile({ name, avatarUrl });
                setMessage('Perfil actualizado en esta plataforma.');
              }}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-slate-800"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.22em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
