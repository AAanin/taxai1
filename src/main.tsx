import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Buffer } from 'buffer'
import App from './App.tsx'
import AdminApp from './AdminApp.tsx'
import ChatPage from './pages/ChatPage.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import './index.css'
import initializeApiKeys from './initApiKeys.ts'
import medicalAIService from './services/medicalAIService.ts'

// Make Buffer available globally for Redis client
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

// Initialize API keys when the app starts
initializeApiKeys();

// Global functions for setting API keys via browser console
(window as any).setGeminiKey = (apiKey: string) => {
  medicalAIService.setApiKeys(apiKey, undefined, undefined);
  console.log('Gemini API key set successfully!');
};

(window as any).setOpenAIKey = (apiKey: string) => {
  medicalAIService.setApiKeys(undefined, apiKey, undefined);
  console.log('OpenAI API key set successfully!');
};

(window as any).setDeepSeekKey = (apiKey: string) => {
  medicalAIService.setApiKeys(undefined, undefined, apiKey);
  console.log('DeepSeek API key set successfully!');
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)