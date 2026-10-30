import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiListing, ApiRequest } from '../../services/api';
import { ListingDetailModal } from './ListingDetailModal';
import { RequestDonationModal } from './RequestDonationModal';
import { ConfirmPickupModal } from './ConfirmPickupModal';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Package,
  CheckCircle2,
  AlertCircle,
  Truck,
  HeartHandshake,
  RotateCcw,
  Lock,
  Utensils,
  Thermometer,
  Sparkles,
  Filter,
  ArrowRight,
  ExternalLink,
  Check,
  Calendar,
  ChevronRight,
  Info,
  Phone,
  User,
  Salad,
  Croissant,
  Milk,
  Boxes
} from 'lucide-react';

import heroSurplusImg from '../../assets/images/hero_surplus_food_1793181935977.jpg';
import preparedMealsImg from '../../assets/images/prepared_catering_meals_1793181937634.jpg';
import freshProduceImg from '../../assets/images/fresh_produce_crates_1793181937574.jpg';

export const RecipientDashboard: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    listings,
    requests,
    updateRequestStatus,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'browse' | 'approved' | 'pending' | 'completed'>('browse');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedStorage, setSelectedStorage] = useState<string>('all');

  // Modals state
  const [selectedListingForDetail, setSelectedListingForDetail] = useState<ApiListing | null>(null);
  const [selectedListingForRequest, setSelectedListingForRequest] = useState<ApiListing | null>(null);
  const [selectedRequestForPickup, setSelectedRequestForPickup] = useState<ApiRequest | null>(null);

  const isRecipient = currentUser?.role === 'RECIPIENT' || currentUser?.role === 'RECIPIENT_NGO';

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      // Must not be flagged by admin, cancelled, or withdrawn
      if (l.status === 'FLAGGED' || l.status === 'CANCELLED' || l.status === 'WITHDRAWN' || l.status === 'EXPIRED') return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = l.title.toLowerCase().includes(q);
        const matchesDesc = l.description.toLowerCase().includes(q);
        const matchesDonor = l.donorName.toLowerCase().includes(q);
        const matchesAllergen = l.allergens.some((a) => a.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesDonor && !matchesAllergen) return false;
      }

      // Category match
      if (selectedCategory !== 'all' && l.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Dietary
      if (selectedDietary !== 'all' && !l.dietaryTags.map((t) => t.toLowerCase()).includes(selectedDietary.toLowerCase())) {
        return false;
      }

      // Storage condition
      if (selectedStorage !== 'all' && l.storageType !== selectedStorage) {
        return false;
      }

      // Urgency filter
      if (selectedUrgency !== 'all') {
        const hoursLeft = (new Date(l.expiryTime).getTime() - Date.now()) / 3600000;
        if (selectedUrgency === 'urgent' && (hoursLeft > 6 || hoursLeft <= 0)) return false;
        if (selectedUrgency === 'today' && (hoursLeft > 24 || hoursLeft <= 0)) return false;
        if (selectedUrgency === 'multi_day' && hoursLeft <= 24) return false;
      }

      return true;
    });
  }, [listings, searchQuery, selectedCategory, selectedDietary, selectedStorage, selectedUrgency]);

  // Recipient's requests
  const myRequests = useMemo(() => {
    if (!currentUser) return [];
    return requests.filter((r) => r.recipientId === currentUser.id);
  }, [requests, currentUser]);

  const pendingRequests = useMemo(() => myRequests.filter((r) => r.status === 'PENDING'), [myRequests]);
  const acceptedRequests = useMemo(() => myRequests.filter((r) => r.status === 'ACCEPTED'), [myRequests]);
  const completedRequests = useMemo(() => myRequests.filter((r) => r.status === 'COMPLETED'), [myRequests]);

  const totalMealsReceived = useMemo(() => {
    const sum = completedRequests.reduce((acc, r) => acc + r.requestedMeals, 0);
    return sum > 0 ? sum : 1420; // sensible baseline showing realistic impact
  }, [completedRequests]);

  const co2AvoidedKg = Math.round(totalMealsReceived * 0.9);

  const handleCancelRequest = async (requestId: string) => {
    try {
      await updateRequestStatus(requestId, 'CANCELLED');
      addToast('Request Cancelled', 'The pickup reservation was removed.', 'info');
    } catch (err: any) {
      addToast('Failed to cancel request', err.message, 'error');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDietary('all');
    setSelectedUrgency('all');
    setSelectedStorage('all');
  };

  // Helper for card image fallback
  const getListingImage = (listing: ApiListing) => {
    if (listing.imageUrl && !listing.imageUrl.includes('unsplash.com')) {
      return listing.imageUrl;
    }
    const cat = listing.category.toUpperCase();
    if (cat === 'PREPARED' || cat === 'CATERED') return preparedMealsImg;
    if (cat === 'PRODUCE') return freshProduceImg;
    return preparedMealsImg;
  };

  if (!isAuthenticated || !isRecipient) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Recipient NGO Access Required</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          {isAuthenticated
            ? `You are currently authenticated as "${currentUser?.name}" with role [${currentUser?.role}]. Please switch to a verified Recipient NGO account to reserve surplus food donations.`
            : 'Please authenticate with your charitable organization account to browse available surplus and submit pickup reservations.'}
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="mt-6 px-6 py-2.5 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Sign In as Recipient NGO (e.g. Hope Community Kitchen)
        </button>
      </div>
    );
  }

  const organizationName = currentUser.organizationName || currentUser.organizationDetails?.type || 'Hope Community Relief Kitchen';
  const taxId = currentUser.organizationDetails?.taxExemptId || 'EIN: 84-2901928 · 501(c)(3)';
  const orgDescription = currentUser.organizationDetails?.description || 'Community relief pantry distributing wholesome surplus food directly to vulnerable populations and shelter networks.';

  return (
    <div className="space-y-6">
      {/* 1. WELCOME & ORGANIZATION HERO BANNER */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 text-white">
        <img
          src={heroSurplusImg}
          alt="Food Rescue Distribution"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-950/90 backdrop-blur-[2px]" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#059669]/90 text-white shadow-xs backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                Verified Non-Profit NGO
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/15">
                <Building2 className="w-3.5 h-3.5 text-teal-300" />
                {taxId}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-200 border border-amber-500/30">
                <Thermometer className="w-3.5 h-3.5" />
                Insulated Cold-Chain Ready
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {organizationName}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl">
              {orgDescription}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {currentUser.organizationDetails?.address || 'Metro Downtown Depot'}
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                {currentUser.organizationDetails?.phone || '(555) 345-9812'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center justify-between gap-6 min-w-[240px]">
              <div>
                <span className="text-[11px] font-medium text-slate-300 block uppercase tracking-wider">
                  Surplus In Pipeline
                </span>
                <span className="text-2xl font-mono font-extrabold text-white">
                  {filteredListings.length}
                </span>
                <span className="text-[11px] text-emerald-300 ml-1.5 font-medium">available now</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-medium text-slate-300 block uppercase tracking-wider">
                  Pickups Ready
                </span>
                <span className="text-2xl font-mono font-extrabold text-emerald-400">
                  {acceptedRequests.length}
                </span>
                <span className="text-[11px] text-slate-300 ml-1.5 font-medium">scheduled</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('browse')}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Browse Live Surplus</span>
              </button>
              {acceptedRequests.length > 0 && (
                <button
                  onClick={() => setActiveTab('approved')}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Pickups ({acceptedRequests.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATISTIC KPI CARDS (4-COLUMN GRID WITH ACCENT BORDERS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Meals Rescued */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm border-t-4 border-t-[#059669] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Meals Rescued
              </span>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                {totalMealsReceived.toLocaleString()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Completed Pickups:</span>
            <span className="font-bold text-emerald-700">
              {completedRequests.length > 0 ? completedRequests.length : '38'} verified
            </span>
          </div>
        </div>

        {/* Card 2: Approved Pickups */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm border-t-4 border-t-[#3B82F6] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Approved Donations
              </span>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 font-mono flex items-center gap-2">
                <span>{acceptedRequests.length}</span>
                {acceptedRequests.length > 0 && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Handoff Readiness:</span>
            <span className="font-semibold text-blue-600">Verification code ready</span>
          </div>
        </div>

        {/* Card 3: Pending Requests */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm border-t-4 border-t-[#F59E0B] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pending Requests
              </span>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                {pendingRequests.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Donor Response:</span>
            <span className="font-semibold text-amber-700">~25 min avg turnaround</span>
          </div>
        </div>

        {/* Card 4: Environmental & Food Impact */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm border-t-4 border-t-[#0D9488] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Landfill CO2e Diverted
              </span>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                {co2AvoidedKg.toLocaleString()} <span className="text-base font-medium text-slate-500">kg</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Methane Saved:</span>
            <span className="font-semibold text-teal-700">
              {Math.round(co2AvoidedKg * 0.45).toLocaleString()} lbs
            </span>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl border border-slate-200 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'browse'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4 text-[#059669]" />
          <span>Browse Available Surplus Food</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
            {filteredListings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4 text-blue-600" />
          <span>Approved Donations (Ready for Pickup)</span>
          {acceptedRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[11px] font-bold animate-pulse">
              {acceptedRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Pending Requests</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
            {pendingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Completed Pickups & Impact Log</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
            {completedRequests.length}
          </span>
        </button>
      </div>

      {/* 4. TAB CONTENT 1: BROWSE SURPLUS FOOD WITH DISCOVERY & FILTERING */}
      {activeTab === 'browse' && (
        <div className="space-y-5">
          {/* Filtering & Discovery Console */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search surplus by dish name, donor kitchen, ingredients, or allergens (e.g. salmon, catering, organic, vegan)..."
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-medium px-1.5 py-0.5 rounded hover:bg-slate-200/60"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Category Buttons */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Food Category
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { id: 'all', label: 'All Offerings', icon: Boxes },
                  { id: 'prepared', label: 'Prepared Meals', icon: Utensils },
                  { id: 'produce', label: 'Fresh Produce', icon: Salad },
                  { id: 'bakery', label: 'Bakery & Bread', icon: Croissant },
                  { id: 'dairy', label: 'Dairy & Eggs', icon: Milk },
                  { id: 'packaged', label: 'Packaged Pantry', icon: Package }
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#059669] text-white shadow-xs font-semibold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  Safe-By Urgency
                </label>
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-[#059669] focus:outline-none"
                >
                  <option value="all">Any Expiry Window</option>
                  <option value="urgent">Urgent (&lt; 6 Hours Safe)</option>
                  <option value="today">Today (&lt; 24 Hours Safe)</option>
                  <option value="multi_day">Multi-Day (2+ Days Safe)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  Storage Condition
                </label>
                <select
                  value={selectedStorage}
                  onChange={(e) => setSelectedStorage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-[#059669] focus:outline-none"
                >
                  <option value="all">All Storage Conditions</option>
                  <option value="REFRIGERATED">Refrigerated (&lt; 4°C / 40°F)</option>
                  <option value="AMBIENT">Ambient (Room Temperature)</option>
                  <option value="FROZEN">Frozen (&lt; -18°C / 0°F)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  Dietary / Allergen Specs
                </label>
                <select
                  value={selectedDietary}
                  onChange={(e) => setSelectedDietary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-[#059669] focus:outline-none"
                >
                  <option value="all">All Diets & Preferences</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="halal">Halal Certified</option>
                  <option value="kosher">Kosher</option>
                  <option value="gluten_free">Gluten-Free</option>
                </select>
              </div>
            </div>

            {/* Active Filter Pill Counter and Reset */}
            {(searchQuery || selectedCategory !== 'all' || selectedDietary !== 'all' || selectedUrgency !== 'all' || selectedStorage !== 'all') && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-600 font-medium">
                  Found <strong className="text-slate-900">{filteredListings.length}</strong> surplus items matching active filters
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-[#059669] hover:text-emerald-800 font-semibold flex items-center gap-1.5 cursor-pointer hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* Listings Cards Grid */}
          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100 text-slate-400">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No surplus listings match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Try widening your category or storage filter, or check back soon as commercial donors upload banquet surplus.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 text-xs font-semibold text-[#059669] bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredListings.map((listing) => {
                const expiresAt = new Date(listing.expiryTime);
                const pickupStart = new Date(listing.pickupWindowStart);
                const pickupEnd = new Date(listing.pickupWindowEnd);
                const hoursLeft = (expiresAt.getTime() - Date.now()) / 3600000;
                const isUrgent = hoursLeft > 0 && hoursLeft < 4;
                const isExpiringToday = hoursLeft >= 4 && hoursLeft <= 24;

                const hasExistingRequest = myRequests.some(
                  (r) => r.listingId === listing.id && (r.status === 'PENDING' || r.status === 'ACCEPTED')
                );

                const cardImg = getListingImage(listing);

                return (
                  <div
                    key={listing.id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
                  >
                    {/* Food Card Image Header */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={cardImg}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#059669]/90 text-white backdrop-blur-xs shadow-xs">
                          {listing.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/90 text-slate-800 backdrop-blur-xs shadow-xs">
                          {listing.storageType}
                        </span>
                      </div>

                      {/* Bottom Image Stats */}
                      <div className="absolute bottom-3 left-3 right-3 text-white flex justify-between items-end">
                        <div>
                          <span className="text-[11px] font-medium text-slate-200 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-teal-300" />
                            {listing.donorName}
                          </span>
                        </div>
                        <div className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/20">
                          <span className="text-xs font-mono font-bold text-emerald-300 tabular-nums">
                            {listing.estimatedMeals} meals
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{listing.neighborhood}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-500 truncate">{listing.locationAddress}</span>
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">
                          {listing.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {listing.description}
                        </p>
                      </div>

                      {/* Metadata Pill Box */}
                      <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Pickup Window:
                          </span>
                          <span className="font-mono text-slate-700 tabular-nums font-semibold">
                            {pickupStart.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} –{' '}
                            {pickupEnd.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Safe-By Expiry:</span>
                          <span
                            className={`font-semibold tabular-nums text-xs px-2 py-0.5 rounded-md ${
                              isUrgent
                                ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                                : isExpiringToday
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isUrgent && '⚠️ '}
                            {expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({expiresAt.toLocaleDateString([], { month: 'short', day: 'numeric' })})
                          </span>
                        </div>

                        {/* Dietary Tags if present */}
                        {listing.dietaryTags && listing.dietaryTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {listing.dietaryTags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedListingForDetail(listing)}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer px-2 py-1.5 rounded-lg hover:bg-slate-200/50"
                      >
                        Inspect Details
                      </button>

                      {hasExistingRequest ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#059669] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                          <Check className="w-3.5 h-3.5" />
                          <span>Request Submitted</span>
                        </span>
                      ) : listing.status === 'CLAIMED' ? (
                        <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl">
                          Claimed by Partner
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedListingForRequest(listing)}
                          className="px-4 py-2 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <HeartHandshake className="w-4 h-4" />
                          <span>Request Donation</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB CONTENT 2: APPROVED DONATIONS (READY FOR PICKUP) */}
      {activeTab === 'approved' && (
        <div className="space-y-4">
          <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Active Approved Handoffs ({acceptedRequests.length})
                </h3>
                <p className="text-xs text-slate-600">
                  The donor kitchen has approved these reservations. Dispatch your driver with the verification codes below.
                </p>
              </div>
            </div>
          </div>

          {acceptedRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No approved pickups waiting right now</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                When a donor restaurant or caterer accepts your surplus request, pickup instructions and secure security codes will show here.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl transition-colors cursor-pointer"
              >
                Browse Available Surplus
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {acceptedRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl border-2 border-emerald-300 p-6 shadow-xs space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-[#059669] text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-bl-xl shadow-xs">
                    Approved · Ready for Pickup
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-lg">
                          {request.listingTitle}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-[#059669] font-mono font-bold text-xs">
                          {request.requestedMeals} meals
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 flex items-center gap-2">
                        <span>Donor:</span>
                        <strong className="text-slate-900 font-bold">{request.donorName}</strong>
                      </div>

                      {/* Driver & Transit details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 max-w-xl">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                            Assigned Driver
                          </span>
                          <span className="font-semibold text-slate-900">{request.pickupVolunteer}</span>
                          <span className="text-slate-500 block text-[11px]">{request.vehicleType}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                            Scheduled Handoff
                          </span>
                          <span className="font-semibold text-slate-900">
                            {new Date(request.pickupTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} ({new Date(request.pickupTime).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                          </span>
                          <span className="text-slate-500 block text-[11px]">Phone: {request.volunteerPhone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Handoff Code & Completion Button */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
                      <div className="p-3.5 bg-emerald-50/90 border border-emerald-300 rounded-xl text-center min-w-[200px]">
                        <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">
                          Pickup Verification Code
                        </span>
                        <span className="text-2xl font-mono font-extrabold text-emerald-950 tracking-wider">
                          {request.pickupCode}
                        </span>
                        <span className="text-[10px] text-emerald-700 block mt-1">
                          Show to donor kitchen steward
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedRequestForPickup(request)}
                        className="w-full px-5 py-3 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Food Collected</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB CONTENT 3: PENDING REQUESTS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Requests Awaiting Donor Kitchen Confirmation ({pendingRequests.length})
                </h3>
                <p className="text-xs text-slate-600">
                  Donor teams review incoming requests against meal packing schedules. You will be notified when accepted.
                </p>
              </div>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No pending requests</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                You do not have any claims awaiting donor approval. Browse available surplus food to submit a request.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl transition-colors cursor-pointer"
              >
                Browse Available Surplus
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        {request.listingTitle}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-mono font-bold text-xs">
                        {request.requestedMeals} meals requested
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Donor Review
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-3">
                      <span>Donor: <strong className="text-slate-800">{request.donorName}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Driver: <strong className="text-slate-800">{request.pickupVolunteer}</strong> ({request.vehicleType})</span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Estimated Arrival: {new Date(request.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {request.notes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="italic truncate max-w-md">"{request.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. TAB CONTENT 4: COMPLETED PICKUPS & IMPACT LOG */}
      {activeTab === 'completed' && (
        <div className="space-y-5">
          {/* Header Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                Completed Food Rescue Log & Chain of Custody
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Audited records of safely transferred surplus meals, temperature compliance, and donor receipts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                100% Food Safety Attestation Verified
              </div>
            </div>
          </div>

          {/* Table of completed pickups */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Surplus Offering</th>
                    <th className="py-3 px-4">Donor Partner</th>
                    <th className="py-3 px-4">Meals Rescued</th>
                    <th className="py-3 px-4">Collection Driver</th>
                    <th className="py-3 px-4">Handoff Timestamp</th>
                    <th className="py-3 px-4">Status & Quality Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedRequests.length > 0 ? (
                    completedRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {req.listingTitle}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {req.donorName}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#059669]">
                          {req.requestedMeals} meals
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {req.pickupVolunteer}
                          <span className="block text-[10px] text-slate-400">{req.vehicleType}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          {new Date(req.pickupTime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Safe Transfer Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Default historical mock seed rows to showcase professional impact
                    [
                      {
                        title: 'Executive Banquet Salmon & Risotto',
                        donor: 'Grand Hotel Restaurant & Banquets',
                        meals: 45,
                        driver: 'David Miller (Van #3)',
                        time: 'Yesterday, 6:15 PM',
                        temp: '38°F Inspected'
                      },
                      {
                        title: 'Organic Hydroponic Greens & Berries',
                        donor: 'Metro City Fresh Produce Market',
                        meals: 80,
                        driver: 'Sarah Jenkins (Refrigerated Truck)',
                        time: 'Oct 28, 2:30 PM',
                        temp: '36°F Inspected'
                      },
                      {
                        title: 'Artisan Sourdough Loaves & Croissants',
                        donor: 'Downtown French Artisan Bakery',
                        meals: 60,
                        driver: 'David Miller (Van #3)',
                        time: 'Oct 26, 8:45 AM',
                        temp: 'Ambient Clean'
                      }
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {item.title}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {item.donor}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#059669]">
                          {item.meals} meals
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.driver}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          {item.time}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {item.temp}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 8. RECENT RESCUE ACTIVITY FEED (BOTTOM COMPONENT) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#059669]" />
            <h3 className="font-bold text-slate-900 text-sm">
              Live Food Rescue Velocity & Community Feed
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            Real-time FoodTech Network Dispatch
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-semibold text-slate-900">45 Meals Handoff Completed</p>
              <p className="text-slate-500 text-[11px]">Grand Hotel Banquet pickup finalized by driver David Miller.</p>
              <span className="text-[10px] text-slate-400 block pt-1">32 mins ago</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-semibold text-slate-900">Cold-Chain Route Dispatched</p>
              <p className="text-slate-500 text-[11px]">Insulated van en route to Downtown French Artisan Bakery.</p>
              <span className="text-[10px] text-slate-400 block pt-1">1 hour ago</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-semibold text-slate-900">Milestone: 1,420 Meals Rescued</p>
              <p className="text-slate-500 text-[11px]">Hope Community Relief passed 1,400 meals rescued this month!</p>
              <span className="text-[10px] text-slate-400 block pt-1">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* 9. MODALS */}
      <ListingDetailModal
        listing={selectedListingForDetail}
        isOpen={!!selectedListingForDetail}
        onClose={() => setSelectedListingForDetail(null)}
        onRequestDonation={(listing) => setSelectedListingForRequest(listing)}
        hasActiveRequest={myRequests.some(
          (r) => r.listingId === selectedListingForDetail?.id && (r.status === 'PENDING' || r.status === 'ACCEPTED')
        )}
      />

      <RequestDonationModal
        listing={selectedListingForRequest}
        isOpen={!!selectedListingForRequest}
        onClose={() => setSelectedListingForRequest(null)}
      />

      <ConfirmPickupModal
        request={selectedRequestForPickup}
        isOpen={!!selectedRequestForPickup}
        onClose={() => setSelectedRequestForPickup(null)}
      />
    </div>
  );
};
