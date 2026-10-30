import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, Mail, ArrowRight, Store, Building2, Shield, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login'
}) => {
  const { login, signup, logout } = useApp();

  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [selectedTargetRole, setSelectedTargetRole] = useState<'DONOR' | 'RECIPIENT_NGO' | 'ADMIN'>('DONOR');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'DONOR' | 'RECIPIENT_NGO' | 'ADMIN'>('DONOR');
  const [orgName, setOrgName] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Validation helpers
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isLoginFormValid = isValidEmail(email) && password.trim().length > 0;
  const isRegisterFormValid =
    isValidEmail(email) &&
    password.trim().length > 0 &&
    name.trim().length > 0 &&
    orgName.trim().length > 0;
  const isSubmitDisabled = loading || (tab === 'login' ? !isLoginFormValid : !isRegisterFormValid);

  const handleRoleCardClick = (targetRole: 'DONOR' | 'RECIPIENT_NGO' | 'ADMIN') => {
    // Only selects the target role and visually highlights it
    // Does NOT auto-fill email or password
    // Does NOT call login API
    // Does NOT create sessions or tokens
    setSelectedTargetRole(targetRole);
    setRole(targetRole);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (tab === 'login') {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        setErrorMsg('Invalid email or password. Please try again.');
        return;
      }

      if (!isValidEmail(trimmedEmail)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }

      setLoading(true);
      try {
        const authenticatedUser = await login(trimmedEmail, trimmedPassword);

        // Verify the user's actual role from the backend response
        const actualRole = authenticatedUser.role;
        const normalizedActualRole = actualRole === 'RECIPIENT' ? 'RECIPIENT_NGO' : actualRole;

        if (normalizedActualRole !== selectedTargetRole) {
          // Block unauthorized portal access and clear session
          logout();

          const roleDisplayNames: Record<string, string> = {
            DONOR: 'Food Donor',
            RECIPIENT_NGO: 'Recipient NGO',
            RECIPIENT: 'Recipient NGO',
            ADMIN: 'Platform Administrator'
          };

          const actualLabel = roleDisplayNames[actualRole] || actualRole;
          const targetLabel = roleDisplayNames[selectedTargetRole] || selectedTargetRole;

          setErrorMsg(
            `Access Denied: Your account role is [${actualLabel}], which does not have permission to access the [${targetLabel}] portal. Please select the [${actualLabel}] role card above or sign in with authorized credentials.`
          );
          setLoading(false);
          return;
        }

        // Grant access and close modal
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Invalid email or password. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!isRegisterFormValid) {
        setErrorMsg('Please fill in all mandatory fields.');
        return;
      }

      setLoading(true);
      try {
        await signup({
          email: email.trim(),
          password,
          name: name.trim(),
          role: selectedTargetRole,
          organizationName: orgName.trim(),
          organizationDetails: {
            type: orgName.trim(),
            contactPerson: name.trim(),
            phone: orgPhone.trim(),
            address: orgAddress.trim()
          }
        });
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 id="auth-modal-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              NourishNet Security & Auth Gateway
            </h2>
            <p className="text-xs text-slate-500">
              JWT Authenticated Session with Role-Based Access Control (RBAC)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Role Selection Cards */}
        <div className="bg-slate-50 p-4 border-b border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Target Portal & Account Role Selection:
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Select your role before authenticating
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Donor Card */}
            <button
              type="button"
              onClick={() => handleRoleCardClick('DONOR')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedTargetRole === 'DONOR'
                  ? 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/30 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Donor</span>
                </div>
                {selectedTargetRole === 'DONOR' && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-emerald-600 text-white">
                    <Check className="w-2.5 h-2.5" />
                    Selected
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5">
                Food Service Donor
              </div>
            </button>

            {/* Recipient NGO Card */}
            <button
              type="button"
              onClick={() => handleRoleCardClick('RECIPIENT_NGO')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedTargetRole === 'RECIPIENT_NGO'
                  ? 'border-sky-600 bg-sky-50/90 ring-2 ring-sky-500/30 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Recipient NGO</span>
                </div>
                {selectedTargetRole === 'RECIPIENT_NGO' && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-sky-600 text-white">
                    <Check className="w-2.5 h-2.5" />
                    Selected
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5">
                Relief NGO & Shelter
              </div>
            </button>

            {/* Admin Card */}
            <button
              type="button"
              onClick={() => handleRoleCardClick('ADMIN')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedTargetRole === 'ADMIN'
                  ? 'border-purple-600 bg-purple-50/90 ring-2 ring-purple-500/30 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admin</span>
                </div>
                {selectedTargetRole === 'ADMIN' && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-purple-600 text-white">
                    <Check className="w-2.5 h-2.5" />
                    Selected
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5">
                Platform Governance
              </div>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="p-6 pb-2">
          <div className="flex bg-slate-100/90 p-1 rounded-xl text-xs font-semibold mb-4 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                tab === 'login' ? 'bg-white text-[#0F172A] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In (Existing Account)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                tab === 'register' ? 'bg-white text-[#0F172A] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register New Organization
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 shadow-2xs">
              <span className="font-bold shrink-0">Error:</span>
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {tab === 'register' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Account Type / Role <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedTargetRole}
                      onChange={(e) => handleRoleCardClick(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="DONOR">Food Donor (Hotel / Restaurant / Grocery)</option>
                      <option value="RECIPIENT_NGO">Recipient NGO (Shelter / Food Bank / Relief)</option>
                      <option value="ADMIN">Platform Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Contact Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chef Marcus Vance"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Organization / Establishment Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Grand Hotel Banquets LLC"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={orgPhone}
                      onChange={(e) => setOrgPhone(e.target.value)}
                      placeholder="(555) 234-8901"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Address / City
                    </label>
                    <input
                      type="text"
                      value={orgAddress}
                      onChange={(e) => setOrgAddress(e.target.value)}
                      placeholder="450 Grand Avenue, Downtown"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="name@organization.org"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/20"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/20"
                autoComplete="current-password"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 ${
                  isSubmitDisabled
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-75'
                    : 'bg-[#059669] hover:bg-[#047857] shadow-sm hover:shadow-md hover:shadow-emerald-900/20 cursor-pointer active:translate-y-0'
                }`}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : tab === 'login' ? (
                  <>
                    <span>Authenticate & Access Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Create Account & Request Verification</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="p-6 pt-3 text-[11px] text-slate-400 text-center">
          Secured with JSON Web Tokens (JWT) · Good Samaritan Act Protected
        </div>
      </div>
    </div>
  );
};
