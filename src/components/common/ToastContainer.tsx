import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-blue-600 shrink-0" />;
        let borderColor = 'border-blue-200/90';
        let accentBar = 'bg-blue-600';
        let iconBg = 'bg-blue-50';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />;
          borderColor = 'border-emerald-200/90';
          accentBar = 'bg-[#059669]';
          iconBg = 'bg-emerald-50';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
          borderColor = 'border-amber-200/90';
          accentBar = 'bg-amber-500';
          iconBg = 'bg-amber-50';
        } else if (toast.type === 'error') {
          icon = <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
          borderColor = 'border-rose-200/90';
          accentBar = 'bg-rose-600';
          iconBg = 'bg-rose-50';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative flex items-start gap-3 p-4 rounded-2xl border bg-white shadow-xl ${borderColor} transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 overflow-hidden`}
          >
            {/* Left Accent Color Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar}`} />

            <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
              {icon}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-xs font-bold text-[#0F172A] leading-tight">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1.5 -mr-1.5 -mt-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
