/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { SafetyBanner } from './components/SafetyBanner';
import { DonorDashboard } from './components/donor/DonorDashboard';
import { RecipientDashboard } from './components/recipient/RecipientDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ToastContainer } from './components/common/ToastContainer';
import { SafetyGuidelinesModal } from './components/common/SafetyGuidelinesModal';
import { AuthModal } from './components/auth/AuthModal';
import { HeartHandshake, ShieldCheck } from 'lucide-react';

const MainView: React.FC = () => {
  const { currentUser, isAuthModalOpen, setIsAuthModalOpen } = useApp();
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'DONOR' | 'RECIPIENT' | 'ADMIN'>('DONOR');

  // Sync selected view with logged-in user role
  useEffect(() => {
    if (currentUser?.role) {
      if (currentUser.role === 'RECIPIENT_NGO' || currentUser.role === 'RECIPIENT') {
        setSelectedView('RECIPIENT');
      } else if (currentUser.role === 'ADMIN') {
        setSelectedView('ADMIN');
      } else {
        setSelectedView('DONOR');
      }
    }
  }, [currentUser?.role]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F1F5F9] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16 md:pb-0 relative">
      {/* Platform Safety Disclaimer Banner */}
      <SafetyBanner onOpenGuidelines={() => setIsSafetyModalOpen(true)} />

      {/* Main Top Navigation with Role Switcher & Real-Time Auth Gateway */}
      <Header
        onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
      />

      {/* Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-8 overflow-hidden">
        {selectedView === 'DONOR' && <DonorDashboard />}
        {selectedView === 'RECIPIENT' && <RecipientDashboard />}
        {selectedView === 'ADMIN' && <AdminDashboard />}
      </main>

      {/* FoodTech Platform Footer */}
      <footer className="bg-white border-t border-slate-200/90 mt-14 py-8 text-xs text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <HeartHandshake className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight">NourishNet</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  FoodTech Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Connecting surplus food donors with certified non-profit distribution networks.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px]">
            <button
              onClick={() => setIsSafetyModalOpen(true)}
              className="text-slate-600 hover:text-emerald-700 hover:underline flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Good Samaritan Act Compliance & Safety</span>
            </button>
            <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
            <span className="text-slate-500 font-medium">Node.js Express · Socket.io · JWT RBAC</span>
            <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
            <span className="text-slate-400 font-mono text-[10px]">ISO 22000 & HACCP Compliant Protocol</span>
          </div>
        </div>
      </footer>

      {/* Modals and Toasts */}
      <SafetyGuidelinesModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainView />
    </AppProvider>
  );
}
