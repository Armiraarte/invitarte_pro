import './styles/global.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { LazyMotion, domAnimation } from 'motion/react';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* Carga solo las funciones de animacion que usa la landing; el editor trae las suyas (drag) al abrirse. */}
    <LazyMotion features={domAnimation}>
      <App />
    </LazyMotion>
  </React.StrictMode>
);
