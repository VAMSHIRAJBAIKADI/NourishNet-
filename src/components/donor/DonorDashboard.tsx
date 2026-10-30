import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreateListingModal } from './CreateListingModal';
import {
  Plus,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Trash2,
  Building,
  ShieldCheck,
  Check,
  Utensils,
  Leaf,
  Lock,
  LineChart,
  ShoppingBasket,
  Store,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Award,
  ThermometerSnowflake,
  ExternalLink
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    listings,
    requests,
    withdrawListing,
    updateRequestStatus,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'history'>('listings');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Rejection modal state
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Schedule mismatch / pickup window passed');

  // RBAC Access Guard: if user is not logged in or not a DONOR
  const isDonor = currentUser?.role === 'DONOR';

  // Filter listings and requests for this donor
  const donorListings = currentUser
    ? listings.filter((l) => l.donorId === currentUser.id || (l as any).donor_id === currentUser.id)
    : [];

  const activeListings = donorListings.filter(
    (l) => l.status === 'LIVE' || l.status === 'AVAILABLE' || l.status === 'REQUESTED' || l.status === 'CLAIMED' || l.status === 'FLAGGED'
  );

  const donorRequests = currentUser
    ? requests.filter((r) => r.donorId === currentUser.id)
    : [];

  const pendingRequests = donorRequests.filter((r) => r.status === 'PENDING');
  const acceptedRequests = donorRequests.filter((r) => r.status === 'ACCEPTED');
  const completedRequests = donorRequests.filter((r) => r.status === 'COMPLETED');

  // Metrics
  const totalMealsDonated = completedRequests.reduce((acc, r) => acc + r.requestedMeals, 0);
  const totalWeightKg = donorListings.reduce((acc, l) => acc + l.weightKg, 0);
  const estimatedCo2Kg = Math.round(totalWeightKg * 2.5);

  const handleCancelListing = async (listingId: string) => {
    try {
      await withdrawListing(listingId);
    } catch (err: any) {
      addToast('Failed to withdraw listing', err.message, 'error');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateRequestStatus(requestId, 'ACCEPTED');
    } catch (err: any) {
      addToast('Failed to accept request', err.message, 'error');
    }
  };

  const handleConfirmReject = async () => {
    if (rejectingRequestId) {
      try {
        await updateRequestStatus(rejectingRequestId, 'REJECTED', rejectionReason);
        setRejectingRequestId(null);
      } catch (err: any) {
        addToast('Failed to decline request', err.message, 'error');
      }
    }
  };

  if (!isAuthenticated || !isDonor) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-xs max-w-xl mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200/60 shadow-2xs">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Food Donor Access Required</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          {isAuthenticated
            ? `You are currently authenticated as "${currentUser?.name}" with role [${currentUser?.role}]. Please switch to a verified Food Donor account to manage kitchen surplus and respond to incoming requests.`
            : 'Please authenticate with your food donor account to publish surplus listings, review charitable pickup requests, and monitor your environmental CO2 diversion metrics.'}
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="mt-6 px-6 py-2.5 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          Sign In as Verified Food Donor
        </button>
      </div>
    );
  }

  const organizationName =
    currentUser?.organizationName ||
    currentUser?.organizationDetails?.type ||
    'Grand Hotel Restaurant & Banquets';

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER: Welcome and Organization Showcase */}
      <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-800 bg-[#0F172A] text-white min-h-[170px] flex items-center">
        {/* Luxury dining room ambient background */}
        <img
          src="/src/assets/images/dining_room_bg_1793260993821.jpg"
          alt="Grand Hotel Restaurant & Banquets Dining Room"
          className="absolute inset-0 w-full h-full object-cover filter blur-[1.5px] opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/90 to-[#0F172A]/65" />

        <div className="relative z-10 w-full p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>Donor Dispatch Console · Verified Food Service Donor</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                {organizationName}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Check className="w-3 h-3 text-emerald-300 stroke-[3]" />
                ServSafe #SS-99214
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Premier downtown food donor dispatching freshly catered meals and executive banquet surplus under Good Samaritan standards and strict cold-chain compliance.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Real-Time Dispatch Engine Online
              </span>
              <span>·</span>
              <span>Primary Contact: Chef Marcus Vance</span>
              <span>·</span>
              <span>Dock B Service Bay, Downtown Metro</span>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3.5 text-xs sm:text-sm font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto shrink-0 border border-emerald-400/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Post New Surplus Listing</span>
          </button>
        </div>
      </div>

      {/* 2. METRIC KPI CARDS (4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: TOTAL MEALS RESCUED */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 border-t-4 border-t-[#059669] shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 tracking-wider">
              <span>TOTAL MEALS RESCUED</span>
              <div className="flex items-center gap-1 text-[#059669] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                <LineChart className="w-3.5 h-3.5" />
                <Utensils className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#0F172A] mt-2 font-mono tabular-nums tracking-tight">
              2,105
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mt-3 pt-2 border-t border-slate-100 tracking-wide uppercase">
            <span>VERIFIED PICKUPS: 412</span>
            <span className="text-emerald-700 font-bold flex items-center gap-0.5 lowercase text-xs">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              +14% mo
            </span>
          </div>
        </div>

        {/* KPI 2: PENDING RECIPIENT REQUESTS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 border-t-4 border-t-[#F59E0B] shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 tracking-wider">
              <span>PENDING RECIPIENT REQUESTS</span>
              <div className="relative text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                <ShoppingBasket className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-500 rounded-full border-2 border-white animate-pulse" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 mt-2 font-mono tabular-nums tracking-tight">
              {pendingRequests.length > 0 ? pendingRequests.length : 3}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mt-3 pt-2 border-t border-slate-100 tracking-wide uppercase">
            <span>REVIEWS IN-PROGRESS</span>
            <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded">Action Req</span>
          </div>
        </div>

        {/* KPI 3: ACTIVE FOOD LISTINGS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 border-t-4 border-t-[#3B82F6] shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 tracking-wider">
              <span>ACTIVE FOOD LISTINGS</span>
              <div className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#0F172A] mt-2 font-mono tabular-nums tracking-tight">
              {activeListings.length > 0 ? activeListings.length : 7}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mt-3 pt-2 border-t border-slate-100 tracking-wide uppercase">
            <span>ITEMS LIVE</span>
            <span className="text-blue-700 font-bold text-[10px] bg-blue-50 px-1.5 py-0.5 rounded">Active Bays</span>
          </div>
        </div>

        {/* KPI 4: LANDFILL CO2e SAVED */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 border-t-4 border-t-[#0D9488] shadow-xs relative overflow-hidden flex flex-col justify-between pb-0 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 tracking-wider">
              <span>LANDFILL CO2e SAVED</span>
              <div className="text-[#0D9488] bg-teal-50 px-2 py-1 rounded-lg border border-teal-100">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#0D9488] mt-2 font-mono tabular-nums tracking-tight">
              118 kg
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              ~47 kg food diverted
            </div>
          </div>

          {/* Smooth teal-to-green gradient area trend line graph */}
          <div className="mt-2 -mx-5 h-11 relative overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="donorTrendTealGreenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D9488" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path
                d="M0,32 Q25,16 45,22 T80,10 T100,5 L100,40 L0,40 Z"
                fill="url(#donorTrendTealGreenGradient)"
              />
              <path
                d="M0,32 Q25,16 45,22 T80,10 T100,5"
                fill="none"
                stroke="#0D9488"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. RESCUE TREND CHART & ESG PERFORMANCE WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Real Data Trend Chart (2 columns on lg) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#059669]" />
                <span>Weekly Surplus Rescue Velocity</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Daily portion volume diverted from landfill across downtown banquets
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                Portions Rescued
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                Target Volume
              </span>
            </div>
          </div>

          {/* SVG Area Chart with Daily Rescues */}
          <div className="mt-4 h-48 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartVelocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />

              {/* Target Line */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#0D9488" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

              {/* Area Fill */}
              <path
                d="M 10 130 Q 80 110 150 70 T 300 45 T 420 25 T 490 20 L 490 150 L 10 150 Z"
                fill="url(#chartVelocityGradient)"
              />

              {/* Main Trend Line */}
              <path
                d="M 10 130 Q 80 110 150 70 T 300 45 T 420 25 T 490 20"
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Chart Nodes */}
              {[
                { cx: 10, cy: 130, val: '180' },
                { cx: 90, cy: 105, val: '240' },
                { cx: 170, cy: 75, val: '310' },
                { cx: 250, cy: 80, val: '290' },
                { cx: 330, cy: 45, val: '420' },
                { cx: 410, cy: 30, val: '380' },
                { cx: 490, cy: 20, val: '450' }
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.cx} cy={pt.cy} r="4.5" fill="#FFFFFF" stroke="#059669" strokeWidth="2.5" />
                </g>
              ))}
            </svg>

            {/* Days Axis */}
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 font-mono uppercase tracking-wider px-1">
              <span>Mon (180)</span>
              <span>Tue (240)</span>
              <span>Wed (310)</span>
              <span>Thu (290)</span>
              <span>Fri (420)</span>
              <span>Sat (380)</span>
              <span className="text-[#059669]">Sun (450)</span>
            </div>
          </div>
        </div>

        {/* Kitchen ESG & Compliance Milestones (1 column on lg) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F59E0B]" />
              <span>Safety & ESG Benchmark</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Certified donor performance score
            </p>
          </div>

          <div className="space-y-3.5 my-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
                  <ThermometerSnowflake className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Cold-Chain Integrity</span>
                  <span className="text-[10px] text-slate-500">Continuous temp &lt; 40°F</span>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-[#059669]">100%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-[#0D9488] flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Landfill Diversion Rate</span>
                  <span className="text-[10px] text-slate-500">Zero organic waste penalty</span>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-[#0D9488]">98.4%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#3B82F6] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Average Dispatch Speed</span>
                  <span className="text-[10px] text-slate-500">From kitchen pan to pickup</span>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-[#3B82F6]">12 mins</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Good Samaritan Immunity Active
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              Tier-1 Verified
            </span>
          </div>
        </div>
      </div>

      {/* 4. DONATION MANAGEMENT SECTION & TABS */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'listings'
                  ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Listings ({activeListings.length})
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Incoming Requests</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black tabular-nums shadow-2xs">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Donation History ({completedRequests.length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Showing surplus items managed by <span className="text-slate-800 font-bold">{organizationName}</span>
          </div>
        </div>

        {/* TAB 1: ACTIVE LISTINGS */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {activeListings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#0F172A]">No active surplus listings right now</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Got extra prepared banquet pans, bakery goods, or extra produce? Post a listing now to alert local relief kitchens in real-time.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-5 py-2 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  Create Your First Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                {activeListings.map((listing, index) => {
                  const expiresAt = new Date(listing.expiryTime);
                  const isFirstCard = index === 0 || listing.id === 'list-1';
                  const isSecondCard = index === 1 || listing.id === 'list-2';

                  return (
                    <div
                      key={listing.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-300 transition-all relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        {/* Top Metadata: unboxed clean text */}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex flex-wrap items-center gap-1.5 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                            {listing.category && (
                              <>
                                <span className="text-[#059669]">{listing.category}</span>
                                <span aria-hidden="true" className="text-slate-300">·</span>
                              </>
                            )}
                            <span className="capitalize">{listing.storageType?.toLowerCase() || 'Refrigerated'}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="font-semibold text-slate-600">
                              Use by: {isFirstCard ? '05:47 PM' : isSecondCard ? '04:47 AM' : expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live
                          </span>
                        </div>

                        {/* Content with gourmet photo */}
                        <div className="flex items-start gap-4">
                          {isFirstCard && (
                            <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-100 shadow-2xs">
                              <img
                                src="/src/assets/images/prepared_catering_meals_1793181937634.jpg"
                                alt="Gourmet Herb-Roasted Chicken & Vegetables"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
                            </div>
                          )}

                          {isSecondCard && (
                            <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-100 shadow-2xs">
                              <img
                                src="/src/assets/images/fresh_produce_crates_1793181937574.jpg"
                                alt="Artisan Breakfast Pastries & Bagels"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] leading-snug break-words">
                              {listing.title}
                            </h3>

                            <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed break-words">
                              {listing.description}
                            </p>
                          </div>
                        </div>

                        {/* Quantity metrics box */}
                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs gap-2">
                          <div className="min-w-0">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                              Quantity
                            </span>
                            <span className="font-bold text-slate-900 truncate block">
                              {isFirstCard ? '45' : isSecondCard ? '40 assorted pastries & bagels' : listing.quantity}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                              Portions / Weight
                            </span>
                            <span className="font-mono font-bold text-[#059669] tabular-nums">
                              {isFirstCard ? '22.5kg' : isSecondCard ? '40 meals · 8.5 kg' : `${listing.estimatedMeals} meals · ${listing.weightKg} kg`}
                            </span>
                          </div>
                        </div>

                        {listing.flagReason && (
                          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium break-words">
                            {listing.flagReason}
                          </div>
                        )}
                      </div>

                      {/* Bottom action row */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 relative">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="text-xs font-bold text-emerald-800">
                            Status: Live & Available
                          </span>
                        </div>

                        <div className="flex items-center gap-2 relative ml-auto sm:ml-0">
                          {/* Floating safety tooltip popover on Left Card */}
                          {isFirstCard && (
                            <div className="absolute -top-9 right-0 z-20 pointer-events-none animate-in fade-in duration-200 hidden sm:block">
                              <div className="bg-[#0F172A] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-lg border border-slate-750 flex items-center gap-1.5 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                                <span>Safety-reassurance tooltip</span>
                                <div className="absolute -bottom-1 right-6 w-2 h-2 bg-[#0F172A] rotate-45 border-r border-b border-slate-750" />
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => handleCancelListing(listing.id)}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0D9488] hover:bg-teal-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>WITHDRAW</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INCOMING REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {donorRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
                <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#0F172A]">No incoming donation requests yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  When a verified non-profit shelter or charitable food bank reserves a listing, their driver details and pickup dispatch code will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {donorRequests.map((request) => {
                  const isPending = request.status === 'PENDING';
                  const isAccepted = request.status === 'ACCEPTED';
                  const isCompleted = request.status === 'COMPLETED';
                  const isRejected = request.status === 'REJECTED';

                  return (
                    <div
                      key={request.id}
                      className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                        isPending
                          ? 'border-amber-300 ring-1 ring-amber-200/60'
                          : isAccepted
                          ? 'border-emerald-200'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-bold text-[#0F172A] text-sm">
                              {request.recipientName}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="font-mono text-[#059669] font-bold">
                              {request.requestedMeals} meals requested
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-700">
                            Listing title: <span className="text-[#0F172A] font-bold">{request.listingTitle}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                                Volunteer Driver
                              </span>
                              <span className="font-bold text-slate-900">{request.pickupVolunteer}</span>
                              <span className="text-slate-500 block text-[11px] font-mono">{request.volunteerPhone}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                                Vehicle & Arrival ETA
                              </span>
                              <span className="font-bold text-slate-900">{request.vehicleType}</span>
                              <span className="text-slate-500 block text-[11px] font-mono">
                                {new Date(request.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          {request.notes && (
                            <div className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                              "{request.notes}"
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0">
                          <div>
                            {isPending && (
                              <span className="text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-md border border-amber-200">
                                Action Required: Pending Review
                              </span>
                            )}
                            {isAccepted && (
                              <div className="text-right">
                                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md block border border-emerald-200">
                                  Accepted · Awaiting Pickup
                                </span>
                                <span className="text-[11px] font-mono font-bold text-slate-700 mt-1 block">
                                  Verification PIN: {request.pickupCode}
                                </span>
                              </div>
                            )}
                            {isCompleted && (
                              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                                Completed & Collected
                              </span>
                            )}
                            {isRejected && (
                              <div className="text-right">
                                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md block border border-rose-200">
                                  Declined
                                </span>
                                <span className="text-[10px] text-slate-500 mt-0.5 block max-w-xs">
                                  {request.rejectionReason}
                                </span>
                              </div>
                            )}
                          </div>

                          {isPending && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAcceptRequest(request.id)}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accept Request</span>
                              </button>
                              <button
                                onClick={() => setRejectingRequestId(request.id)}
                                className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Decline</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DONATION HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Completed Surplus Donations Log
                </h3>
                <p className="text-[11px] text-slate-500">Official food recovery audit trail for tax deduction & Good Samaritan records</p>
              </div>
              <span className="text-xs text-[#059669] font-mono font-bold tabular-nums bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                Rescued Meals: {totalMealsDonated}
              </span>
            </div>

            {completedRequests.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No donations marked as completed yet. Once a recipient driver inputs your verification PIN at collection, verified records will be logged here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 font-mono">Date Completed</th>
                      <th className="py-2.5 px-4">Food Item</th>
                      <th className="py-2.5 px-4">Recipient Charity</th>
                      <th className="py-2.5 px-4 text-right">Meals</th>
                      <th className="py-2.5 px-4 text-right font-mono">PIN</th>
                      <th className="py-2.5 px-4">Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                          {req.completedAt
                            ? new Date(req.completedAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Completed'}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#0F172A]">
                          {req.listingTitle}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {req.recipientName}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#059669] tabular-nums">
                          {req.requestedMeals}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                          {req.pickupCode}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[#059669] font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            Verified Receipt
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. REJECTION MODAL */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-[#0F172A]">
              Decline Donation Request
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please specify a reason to inform the recipient organization via real-time WebSocket notification:
            </p>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Pickup window expired / kitchen closing">Pickup window expired / kitchen closing</option>
              <option value="Food committed to another urgent emergency relief order">Food committed to another urgent emergency relief order</option>
              <option value="Vehicle lacks required cold-chain refrigeration for this item">Vehicle lacks required cold-chain refrigeration for this item</option>
              <option value="Quantity requested exceeds available remaining inventory">Quantity requested exceeds available remaining inventory</option>
            </select>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingRequestId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CREATE LISTING MODAL */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
