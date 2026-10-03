import { UserAccount, UserSession } from '../types';

const USERS_STORAGE_KEY = 'laboratorio_invitaciones_users_v1';
const SESSION_STORAGE_KEY = 'laboratorio_invitaciones_session_v1';

const AVATAR_COLORS = ['#C76A3D', '#D9466E', '#2B6CB0', '#0F766E', '#7C3AED', '#9A3412'];

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getAvatarColor = (seed: string) => {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const readUsers = (): UserAccount[] => {
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeUsers = (users: UserAccount[]) => {
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const mapSession = (account: UserAccount): UserSession => ({
  id: account.id,
  name: account.name,
  email: account.email,
  provider: account.provider,
  avatarColor: account.avatarColor,
  avatarUrl: account.avatarUrl,
});

const saveSession = (session: UserSession) => {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const createGuestSession = () => {
  const session: UserSession = {
    id: 'guest-workspace',
    name: 'Acceso local',
    email: 'local@laboratorio.local',
    provider: 'guest',
    avatarColor: getAvatarColor('guest-workspace'),
  };

  saveSession(session);
  return session;
};

export const getCurrentSession = (): UserSession | null => {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    return parsed as UserSession;
  } catch {
    return null;
  }
};

export const registerWithEmail = ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const normalizedEmail = normalizeEmail(email);
  const trimmedName = name.trim();
  const trimmedPassword = password.trim();

  if (!trimmedName || !normalizedEmail || !trimmedPassword) {
    throw new Error('Completa nombre, correo y contraseña.');
  }

  const users = readUsers();
  const existingUser = users.find((user) => normalizeEmail(user.email) === normalizedEmail);
  const timestamp = new Date().toISOString();

  if (existingUser?.provider === 'google') {
    const migratedAccount: UserAccount = {
      ...existingUser,
      name: trimmedName,
      password: trimmedPassword,
      provider: 'email',
      avatarColor: existingUser.avatarColor || getAvatarColor(normalizedEmail),
      updatedAt: timestamp,
    };

    writeUsers(users.map((user) => (user.id === existingUser.id ? migratedAccount : user)));

    const session = mapSession(migratedAccount);
    saveSession(session);
    return session;
  }

  if (existingUser) {
    throw new Error('Ese correo ya está registrado.');
  }

  const account: UserAccount = {
    id: Math.random().toString(36).slice(2, 11),
    name: trimmedName,
    email: normalizedEmail,
    password: trimmedPassword,
    provider: 'email',
    avatarColor: getAvatarColor(normalizedEmail),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  writeUsers([...users, account]);

  const session = mapSession(account);
  saveSession(session);
  return session;
};

export const loginWithEmail = ({ email, password }: { email: string; password: string }) => {
  const normalizedEmail = normalizeEmail(email);
  const users = readUsers();
  const user = users.find((account) => normalizeEmail(account.email) === normalizedEmail);

  if (!user) {
    throw new Error('No existe una cuenta con ese correo.');
  }

  if (user.provider !== 'email') {
    throw new Error('Este correo aún no tiene contraseña. Regístralo de nuevo para activarlo.');
  }

  if (user.password !== password.trim()) {
    throw new Error('La contraseña no coincide.');
  }

  const session = mapSession(user);
  saveSession(session);
  return session;
};

export const signInWithGoogle = ({
  name,
  email,
}: {
  name?: string;
  email?: string;
}) => {
  const fallbackId = Math.random().toString(36).slice(2, 7);
  const normalizedEmail = normalizeEmail(email || `usuario.${fallbackId}@google.demo`);
  const users = readUsers();
  const existingUser = users.find((account) => normalizeEmail(account.email) === normalizedEmail);

  if (existingUser) {
    const nextUser: UserAccount = {
      ...existingUser,
      name: name?.trim() || existingUser.name,
      provider: 'google',
      avatarColor: existingUser.avatarColor || getAvatarColor(normalizedEmail),
      updatedAt: new Date().toISOString(),
    };

    writeUsers(users.map((account) => (account.id === existingUser.id ? nextUser : account)));

    const session = mapSession(nextUser);
    saveSession(session);
    return session;
  }

  const trimmedName = name?.trim() || 'Usuario Google';
  const timestamp = new Date().toISOString();
  const account: UserAccount = {
    id: Math.random().toString(36).slice(2, 11),
    name: trimmedName,
    email: normalizedEmail,
    password: '',
    provider: 'google',
    avatarColor: getAvatarColor(normalizedEmail),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  writeUsers([...users, account]);

  const session = mapSession(account);
  saveSession(session);
  return session;
};

export const updateCurrentUserProfile = ({
  name,
  avatarUrl,
}: {
  name?: string;
  avatarUrl?: string;
}) => {
  const currentSession = getCurrentSession();
  if (!currentSession) {
    throw new Error('No hay una sesión activa.');
  }

  if (currentSession.provider === 'guest') {
    const nextSession: UserSession = {
      ...currentSession,
      name: name?.trim() || currentSession.name,
      avatarUrl: avatarUrl ?? currentSession.avatarUrl,
    };

    saveSession(nextSession);
    return nextSession;
  }

  const users = readUsers();
  const nextUsers = users.map((account) => {
    if (account.id !== currentSession.id) return account;

    return {
      ...account,
      name: name?.trim() || account.name,
      avatarUrl: avatarUrl ?? account.avatarUrl,
      updatedAt: new Date().toISOString(),
    };
  });

  writeUsers(nextUsers);

  const updatedAccount = nextUsers.find((account) => account.id === currentSession.id);
  if (!updatedAccount) {
    throw new Error('No se pudo actualizar el perfil.');
  }

  const nextSession = mapSession(updatedAccount);
  saveSession(nextSession);
  return nextSession;
};

export const signOut = () => {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};
