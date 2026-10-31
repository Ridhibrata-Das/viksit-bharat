'use client';

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt({ locale = 'en' }: { locale?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    // 2. Offline / Online Status Monitoring
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Check if already in standalone / installed mode
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
      }

      // 3. Capture beforeinstallprompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowPrompt(true);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setShowPrompt(false);
        setDeferredPrompt(null);
        console.log('[PWA] Application installed to device');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      console.log('[PWA] User accepted installation prompt');
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const isBn = locale === 'bn';

  return (
    <>
      {/* Offline Alert Strip */}
      {isOffline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white py-2 px-4 text-center text-xs sm:text-sm font-medium shadow-md flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 animate-pulse shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-2.829-6.364m0 0a9 9 0 012.829-6.364m0 0L3 3" />
          </svg>
          <span>
            {isBn
              ? 'আপনি অফলাইনে আছেন। ক্যাশ করা ডেটা ও প্রতিবেদন প্রদর্শিত হচ্ছে।'
              : 'You are currently offline. Displaying cached econometric data.'}
          </span>
        </aside>
      )}

      {/* Mobile Install Promotion Banner */}
      {showPrompt && !isInstalled && (
        <div
          role="dialog"
          aria-label={isBn ? 'অ্যাপ ইনস্টল করুন' : 'Install Viksit Bengal App'}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-inner">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {isBn ? 'বিকাশশীল বাংলা অ্যাপ' : 'Viksit Bengal App'}
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
              {isBn
                ? 'হোম স্ক্রিনে ইনস্টল করে অফলাইনে ড্যাশবোর্ড ও রিপোর্ট ব্যবহার করুন।'
                : 'Install to your mobile home screen for offline access and fast telemetry.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-primary hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-primary min-h-[36px]"
            >
              {isBn ? 'ইনস্টল' : 'Install'}
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              aria-label={isBn ? 'বাতিল করুন' : 'Dismiss install prompt'}
              className="px-2 py-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs rounded-lg transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
