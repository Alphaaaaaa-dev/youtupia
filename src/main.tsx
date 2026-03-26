import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import './index.css';

const Root = () => {
  const [ready, setReady] = useState(false);
  return (
    <>
      {!ready && <SplashScreen onDone={() => setReady(true)} />}
      {ready && <App />}
    </>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
