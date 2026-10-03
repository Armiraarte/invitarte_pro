import React, { useEffect, useState } from 'react';
import { UserSession } from './types';
import { createGuestSession, signOut } from './services/localAuth';

const { Suspense, lazy } = React;

const AdminPanel = lazy(() => import('./AdminPanel'));
const LandingPage = lazy(() => import('./components/LandingPage').then((module) => ({ default: module.LandingPage })));
const AuthPanel = lazy(() => import('./components/AuthPanel').then((module) => ({ default: module.AuthPanel })));

const PageLoader: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <div className="w-full max-w-xl rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
      <div className="h-4 w-32 rounded-full bg-slate-200" />
      <div className="mt-4 h-12 w-2/3 rounded-2xl bg-slate-100" />
      <div className="mt-6 h-44 rounded-[28px] bg-slate-100" />
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [view, setView] = useState<'landing' | 'auth' | 'workspace'>('landing');
  const [workspaceEntryTab, setWorkspaceEntryTab] = useState<'dashboard' | 'create'>('dashboard');

  useEffect(() => {
    signOut();
    setCurrentUser(null);
    setView('landing');
  }, []);

  if (view === 'workspace' && currentUser) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminPanel
          currentUser={currentUser}
          initialTab={workspaceEntryTab}
          onUpdateSession={setCurrentUser}
          onLogout={() => {
            setCurrentUser(null);
            setWorkspaceEntryTab('dashboard');
            setView('landing');
          }}
        />
      </Suspense>
    );
  }

  if (view === 'auth') {
    return (
      <Suspense fallback={<PageLoader />}>
        <AuthPanel
          onBack={() => setView('landing')}
          onSuccess={(session) => {
            setCurrentUser(session);
            setWorkspaceEntryTab('dashboard');
            setView('workspace');
          }}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <LandingPage
        onOpenAuth={() => setView('auth')}
        onStartDesign={() => {
          const guestSession = createGuestSession();
          setCurrentUser(guestSession);
          setWorkspaceEntryTab('create');
          setView('workspace');
        }}
      />
    </Suspense>
  );
};

export default App;
