import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartHandshake,
  Shield,
  Building2,
  Store,
  Lock,
  LogOut,
  UserCheck,
  Github,
  Database,
  Menu,
  X
} from 'lucide-react';
import { GitHubExportModal } from './common/GitHubExportModal';
import { DatabaseStatusModal } from './common/DatabaseStatusModal';

interface HeaderProps {
  onOpenSafetyModal: () => void;
  selectedView: 'DONOR' | 'RECIPIENT' | 'ADMIN';
  setSelectedView: (view: 'DONOR' | 'RECIPIENT' | 'ADMIN') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSafetyModal,
  selectedView,
  setSelectedView
}) => {
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    logout,
    requests,
    listings,
    addToast
  } = useApp();

  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingDonorRequests = currentUser
    ? requests.filter((r) => r.donorId === currentUser.id && r.status === 'PENDING').length
    : 0;

  const acceptedRecipientPickups = currentUser
    ? requests.filter((r) => r.recipientId === currentUser.id && r.status === 'ACCEPTED').length
    : 0;

  const flaggedListingsCount = listings.filter((l) => l.status === 'FLAGGED').length;

  const userRole = currentUser?.role;
  const isDonorUser = userRole === 'DONOR';
  const isRecipientUser = userRole === 'RECIPIENT' || userRole === 'RECIPIENT_NGO';
  const isAdminUser = userRole === 'ADMIN';

  const isPermittedPortal = (view: 'DONOR' | 'RECIPIENT' | 'ADMIN'): boolean => {
    if (!isAuthenticated) return true;
    if (view === 'DONOR') return isDonorUser;
    if (view === 'RECIPIENT') return isRecipientUser;
    if (view === 'ADMIN') return isAdminUser;
    return false;
  };

  const handleSelectView = (view: 'DONOR' | 'RECIPIENT' | 'ADMIN') => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!isPermittedPortal(view)) {
      addToast(
        'Portal Access Restricted',
        'This portal is not available for your account. You are currently signed in with a different account role.',
        'warning'
      );
      return;
    }

    setSelectedView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800/90 text-white shadow-md w-full transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* Zone 1: Wordmark & Tagline */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-[#059669] to-[#0D9488] text-slate-950 flex items-center justify-center shadow-md shadow-emerald-950/40 shrink-0">
              <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white font-sans truncate">
                  NourishNet
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              </div>
              <span className="hidden sm:inline text-[10px] text-emerald-400 font-semibold tracking-wide truncate">
                Sustainable Sourcing, Reimagined
              </span>
            </div>
          </div>

          {/* Zone 2: Desktop Navigation Buttons (≥ 768px) */}
          <nav 
            aria-label="Desktop primary role navigation"
            className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/70 shrink-0 shadow-inner"
          >
            <button
              onClick={() => handleSelectView('DONOR')}
              title={
                isAuthenticated && !isDonorUser
                  ? 'Portal access restricted to Food Donor accounts'
                  : 'Donor Surplus Dispatch Portal'
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedView === 'DONOR'
                  ? 'bg-[#059669] text-white shadow-xs font-extrabold'
                  : isAuthenticated && !isDonorUser
                  ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-750/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>DONOR PORTAL</span>
              {isAuthenticated && !isDonorUser && (
                <Lock className="w-3 h-3 text-slate-400 ml-0.5 opacity-70" />
              )}
              {pendingDonorRequests > 0 && isDonorUser && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-400 text-slate-950 text-[10px] font-black rounded-full tabular-nums shadow-2xs">
                  {pendingDonorRequests}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectView('RECIPIENT')}
              title={
                isAuthenticated && !isRecipientUser
                  ? 'Portal access restricted to Recipient NGO accounts'
                  : 'Recipient NGO Pickup Portal'
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedView === 'RECIPIENT'
                  ? 'bg-[#059669] text-white shadow-xs font-extrabold'
                  : isAuthenticated && !isRecipientUser
                  ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-750/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>RECIPIENT NGO</span>
              {isAuthenticated && !isRecipientUser && (
                <Lock className="w-3 h-3 text-slate-400 ml-0.5 opacity-70" />
              )}
              {acceptedRecipientPickups > 0 && isRecipientUser && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full tabular-nums shadow-2xs">
                  {acceptedRecipientPickups}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectView('ADMIN')}
              title={
                isAuthenticated && !isAdminUser
                  ? 'Portal access restricted to Administrator accounts'
                  : 'Regulatory Audit & Moderation Console'
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedView === 'ADMIN'
                  ? 'bg-[#059669] text-white shadow-xs font-extrabold'
                  : isAuthenticated && !isAdminUser
                  ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-750/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>ADMIN CONSOLE</span>
              {isAuthenticated && !isAdminUser && (
                <Lock className="w-3 h-3 text-slate-400 ml-0.5 opacity-70" />
              )}
              {flaggedListingsCount > 0 && isAdminUser && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-black rounded-full tabular-nums shadow-2xs">
                  {flaggedListingsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: System Status Indicator, Database & User Profile Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Green Pulsing Indicator: SYSTEM STATUS: LIVE (Desktop) */}
            <div
              title="Real-Time Node.js & WebSocket Engine Online"
              className="hidden lg:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg text-emerald-400 shadow-2xs shrink-0"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">SYSTEM STATUS: LIVE</span>
            </div>

            {/* Database Engine Status Button */}
            <button
              onClick={() => setIsDbModalOpen(true)}
              title="View Database Engine & MongoDB Connection Status"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2 sm:px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg border border-slate-700/80 transition-all cursor-pointer shrink-0"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">DATABASE</span>
            </button>

            {/* User Account / Profile Dropdown */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 rounded-xl px-2.5 py-1.5 transition-all cursor-pointer text-left shrink-0 shadow-2xs"
                  aria-label="User profile menu"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium truncate max-w-[130px]">
                      {currentUser.organizationDetails?.type || currentUser.role}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[10px]">▼</span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0F172A] border border-slate-750/90 rounded-2xl shadow-2xl z-50 py-2 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3.5 py-2.5 border-b border-slate-800/80">
                      <p className="font-bold text-white text-xs">{currentUser.name}</p>
                      <p className="text-[10px] text-emerald-400 font-mono mt-0.5 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleSelectView('DONOR');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-800/80 flex items-center gap-2.5 font-semibold text-slate-200 transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>MY PROFILE</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-800/80 flex items-center gap-2.5 font-semibold text-slate-200 transition-colors cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5 text-amber-400" />
                      <span>SWITCH ACCOUNT</span>
                    </button>

                    <div className="border-t border-slate-800/80 my-1" />

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-950/50 text-rose-400 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>LOGOUT</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 sm:px-4 py-1.5 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs hover:shadow-md hover:shadow-emerald-950/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* GitHub Export Button (Desktop / Tablet) */}
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
              title="Push directly to GitHub or Download Code ZIP"
            >
              <Github className="w-3.5 h-3.5 text-slate-200" />
              <span className="hidden md:inline">GitHub</span>
            </button>

            {/* Mobile Hamburger Toggle Button (< 768px) */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-emerald-400" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu Drawer (< 768px) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-4 animate-in slide-in-from-top-3 duration-200">
            {/* Mobile Role Switcher Links */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-1">
                Portals & Access
              </span>
              <button
                onClick={() => handleSelectView('DONOR')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedView === 'DONOR'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isAuthenticated && !isDonorUser
                    ? 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-300" />
                  <span>DONOR PORTAL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isAuthenticated && !isDonorUser && (
                    <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Restricted
                    </span>
                  )}
                  {pendingDonorRequests > 0 && isDonorUser && (
                    <span className="w-5 h-5 bg-emerald-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center tabular-nums">
                      {pendingDonorRequests}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleSelectView('RECIPIENT')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedView === 'RECIPIENT'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isAuthenticated && !isRecipientUser
                    ? 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span>RECIPIENT NGO</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isAuthenticated && !isRecipientUser && (
                    <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Restricted
                    </span>
                  )}
                  {acceptedRecipientPickups > 0 && isRecipientUser && (
                    <span className="w-5 h-5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center tabular-nums">
                      {acceptedRecipientPickups}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleSelectView('ADMIN')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedView === 'ADMIN'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isAuthenticated && !isAdminUser
                    ? 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>ADMIN CONSOLE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isAuthenticated && !isAdminUser && (
                    <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Restricted
                    </span>
                  )}
                  {flaggedListingsCount > 0 && isAdminUser && (
                    <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center tabular-nums">
                      {flaggedListingsCount}
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Mobile Status & Tools */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700/80 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="font-mono text-[10px] font-bold text-emerald-400">LIVE ENGINE</span>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsDbModalOpen(true);
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl text-slate-200 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px]"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>DATABASE</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsGitHubModalOpen(true);
                }}
                className="col-span-2 p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl text-slate-200 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Push to GitHub Repository</span>
              </button>
            </div>

            {/* User Session Info on Mobile */}
            {isAuthenticated && currentUser ? (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <span className="text-white font-bold block truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 text-amber-300 border border-slate-700 rounded-lg hover:bg-slate-750 cursor-pointer"
                  >
                    Switch
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-900/60 rounded-lg hover:bg-rose-900/80 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In / Auth Gateway</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (< 768px / md:hidden) */}
      <nav 
        aria-label="Mobile viewport bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom w-full max-w-full overflow-hidden"
      >
        <button
          onClick={() => handleSelectView('DONOR')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
            selectedView === 'DONOR'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Store className="w-5 h-5" />
            {pendingDonorRequests > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-emerald-400 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center tabular-nums">
                {pendingDonorRequests}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight uppercase">Donor</span>
        </button>

        <button
          onClick={() => handleSelectView('RECIPIENT')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
            selectedView === 'RECIPIENT'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Building2 className="w-5 h-5" />
            {acceptedRecipientPickups > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center tabular-nums">
                {acceptedRecipientPickups}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight uppercase">Recipient NGO</span>
        </button>

        <button
          onClick={() => handleSelectView('ADMIN')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
            selectedView === 'ADMIN'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Shield className="w-5 h-5" />
            {flaggedListingsCount > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center tabular-nums">
                {flaggedListingsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight uppercase">Admin</span>
        </button>
      </nav>

      {/* GitHub Export Modal */}
      <GitHubExportModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Database Status & Config Modal */}
      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </>
  );
};
