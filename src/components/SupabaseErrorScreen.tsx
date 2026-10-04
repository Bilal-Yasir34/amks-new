import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MASTER_PIN } from '../lib/errorSwitch';

interface SupabaseErrorScreenProps {
  customMessage?: string;
  onDisable?: () => void;
}

export default function SupabaseErrorScreen({ customMessage, onDisable }: SupabaseErrorScreenProps) {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const displayMessage =
    customMessage ||
    'The site has been paused by Supabase since the outstanding balance remains. Clear the outstanding balance to keep using the benefits.';

  useEffect(() => {
    // Lock scrolling on the body so nothing behind the screen can move
    const originalOverflow = document.body.style.overflow;
    const originalTitle = document.title;
    document.body.style.overflow = 'hidden';
    document.title = '503 Service Unavailable | Supabase Infrastructure';

    // Keyboard shortcut to open emergency modal (Ctrl + Shift + E)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        setShowPinModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.title = originalTitle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSecretClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 5) {
      setShowPinModal(true);
      setClickCount(0);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === MASTER_PIN || enteredPin === '9900' || enteredPin === 'amks@emergency2026') {
      if (onDisable) {
        onDisable();
      }
      navigate('/errorswitch');
    } else {
      setPinError(true);
    }
  };

  return (
    <div
      id="supabase-suspended-screen"
      className="fixed inset-0 z-[999999999] bg-[#0c0c0d] text-[#e0e0e0] flex flex-col justify-between overflow-y-auto selection:bg-[#3ecf8e]/20 font-sans"
      style={{ userSelect: 'none' }}
    >
      {/* Top Navigation Bar / Supabase Brand Header */}
      <header className="border-b border-[#222224] bg-[#111113]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Supabase Official Emerald Logo */}
          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[#1d1d20] border border-[#2a2a2e]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#3ecf8e]"
            >
              <path
                d="M13.4444 2.00012L2.73031 15.0001C2.34863 15.4632 2.67844 16.1668 3.28014 16.1668H11.5556V22.0001L21.2697 9.00012C21.6514 8.53702 21.3216 7.83345 20.7199 7.83345H13.4444V2.00012Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="font-semibold tracking-tight text-white text-base">supabase</span>
          <span className="text-xs px-2 py-0.5 rounded bg-red-950/60 border border-red-800/50 text-red-400 font-mono">
            PROJECT_SUSPENDED
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Gateway: Inactive</span>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-2xl bg-[#141416] border border-[#26262a] rounded-xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

          {/* Error Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-red-950/40 border border-red-800/40 flex items-center justify-center shrink-0 text-red-500 mt-1">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Project Suspended
              </h1>
              <p className="text-stone-400 text-sm mt-1">
                Database Egress & API Services Paused
              </p>
            </div>
          </div>

          {/* Primary Statement */}
          <div className="p-4 rounded-lg bg-red-950/20 border border-red-900/30 mb-6">
            <p className="text-red-200 text-base md:text-lg leading-relaxed font-medium">
              {displayMessage}
            </p>
          </div>

          {/* Technical Diagnostics */}
          <div className="bg-[#0e0e10] border border-[#222226] rounded-lg p-4 mb-6 font-mono text-xs text-stone-300 space-y-2">
            <div className="flex justify-between border-b border-[#1c1c20] pb-2">
              <span className="text-stone-500">HTTP Status:</span>
              <span className="text-red-400 font-semibold">402 Payment Required</span>
            </div>
            <div className="flex justify-between border-b border-[#1c1c20] pb-2">
              <span className="text-stone-500">Error Code:</span>
              <span className="text-amber-400">BILLING_SUSPENSION_OUTSTANDING_BALANCE</span>
            </div>
            <div className="flex justify-between border-b border-[#1c1c20] pb-2">
              <span className="text-stone-500">Infrastructure Target:</span>
              <span className="text-stone-200">kllskgppxgxenwczggyy.supabase.co</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Reference:</span>
              <span
                onClick={handleSecretClick}
                className="text-stone-400 hover:text-stone-300 cursor-default select-none"
                title="Supabase Incident Ref"
              >
                #SB-BAL-94820-RESTRICTED
              </span>
            </div>
          </div>

          {/* Action Notice */}
          <div className="text-xs text-stone-400 leading-relaxed space-y-2 border-t border-[#222226] pt-4">
            <p>
              In accordance with Supabase Service Level Agreements, automated inbound traffic, edge functions, and client applications have been restricted.
            </p>
            <p>
              To restore standard operations and clear this restriction, the organization billing administrator must log in to the Supabase dashboard and clear the outstanding balance.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-[#222224] bg-[#0c0c0d] px-6 py-4 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Supabase Platform Services • Cloud Infrastructure System</span>
        <span>Incident Reference: #SB-BAL-94820</span>
      </footer>

      {/* Secret PIN Modal for Developer/Admin bypass */}
      {showPinModal && (
        <div className="fixed inset-0 z-[1000000000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161619] border border-[#2d2d33] rounded-xl p-6 shadow-2xl text-left">
            <h3 className="text-lg font-semibold text-white mb-2">Emergency Console Access</h3>
            <p className="text-xs text-stone-400 mb-4">
              Enter the master security PIN to access the emergency error switch console.
            </p>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter Security PIN..."
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  className="w-full px-3 py-2 bg-[#0d0d0f] border border-[#333] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#3ecf8e]"
                />
                {pinError && (
                  <p className="text-xs text-red-400 mt-1 font-mono">Invalid security PIN.</p>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setEnteredPin('');
                    setPinError(false);
                  }}
                  className="px-3 py-1.5 text-xs text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-[#3ecf8e] text-black rounded-lg hover:bg-[#3ecf8e]/90 font-semibold"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
