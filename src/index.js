import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter  } from 'react-router-dom';
import './index.css';
import App from './App';
import { ContextProvider } from './contexts/ContextProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter basename="/Upgraded-Planti"> 
    <ContextProvider>
      <App />
    </ContextProvider>
  </BrowserRouter>
);