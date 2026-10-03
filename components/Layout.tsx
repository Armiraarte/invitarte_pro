
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onReset: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onReset }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">InvitaPro</h1>
          </div>
          <button 
            onClick={onReset}
            className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Nueva Invitación
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2024 InvitaPro - Generador de Invitaciones Inteligentes.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-indigo-600">Términos</a>
            <a href="#" className="hover:text-indigo-600">Privacidad</a>
            <a href="#" className="hover:text-indigo-600">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
