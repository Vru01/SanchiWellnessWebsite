import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

// Global toast state
let toastListeners = [];
let toastId = 0;

export const toast = {
  success: (msg) => emit({ type: 'success', msg }),
  error: (msg) => emit({ type: 'error', msg }),
  info: (msg) => emit({ type: 'info', msg }),
};

function emit(t) {
  const id = ++toastId;
  toastListeners.forEach(fn => fn({ ...t, id }));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (t) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3000);
    };
    toastListeners.push(handler);
    return () => { toastListeners = toastListeners.filter(fn => fn !== handler); };
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(x => x.id !== id));

  const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
  const styles = {
    success: 'bg-white border-green-200 text-green-700',
    error: 'bg-white border-red-200 text-red-600',
    info: 'bg-white border-cyan-200 text-cyan-700',
  };
  const iconStyles = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-cyan-500',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl shadow-black/10 min-w-[260px] max-w-sm pointer-events-auto animate-in slide-in-from-right-5 fade-in duration-300 ${styles[t.type]}`}>
            <Icon className={`h-5 w-5 shrink-0 ${iconStyles[t.type]}`} />
            <span className="text-sm font-medium text-gray-800 flex-grow">{t.msg}</span>
            <button onClick={() => remove(t.id)} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
