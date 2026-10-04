import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import {
  isErrorSwitchActive,
  getErrorSwitchMessage,
  updateErrorSwitchState,
  DEFAULT_ERROR_MESSAGE,
  MASTER_PIN,
} from '../lib/errorSwitch';
import SupabaseErrorScreen from '../components/SupabaseErrorScreen';
import toast from 'react-hot-toast';
import { ShieldAlert, ShieldCheck, Power, KeyRound, Eye, Lock, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ErrorSwitch() {
  const { settings, refreshSettings } = useSettings();
  const { isAdmin } = useAuth();

  const [pin, setPin] = useState(() => sessionStorage.getItem('amks_error_switch_pin') || '');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState(DEFAULT_ERROR_MESSAGE);
  const [previewMode, setPreviewMode] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Admin credentials login states (in case user wants to sign in as admin directly)
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@amks.pk');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);

  const currentlyActive = isErrorSwitchActive(settings);

  useEffect(() => {
    if (settings) {
      setCustomMessage(getErrorSwitchMessage(settings));
    }
  }, [settings]);

  // Check if saved pin or logged in admin unlocks the console
  useEffect(() => {
    if (pin === MASTER_PIN || pin === '9900' || pin === 'amks@emergency2026' || isAdmin) {
      setIsUnlocked(true);
    }
  }, [pin, isAdmin]);

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === MASTER_PIN || pin === '9900' || pin === 'amks@emergency2026') {
      setIsUnlocked(true);
      sessionStorage.setItem('amks_error_switch_pin', pin);
      toast.success('Console unlocked successfully');
    } else {
      toast.error('Invalid security PIN');
    }
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      if (error) throw error;
      setIsUnlocked(true);
      toast.success('Authenticated as Admin');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setAdminLoggingIn(false);
    }
  };

  const handleToggleSwitch = async (targetState: boolean) => {
    setLoading(true);
    try {
      const effectivePin = pin || MASTER_PIN;
      const res = await updateErrorSwitchState(targetState, effectivePin, customMessage, settings);

      if (res.success) {
        toast.success(
          targetState
            ? 'Emergency Error Screen ENABLED. Site is now paused.'
            : 'Error Screen DISABLED. Site is now live.'
        );
        await refreshSettings();
      } else {
        toast.error(res.error || 'Failed to update switch state.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMessage = async () => {
    setLoading(true);
    try {
      const effectivePin = pin || MASTER_PIN;
      const res = await updateErrorSwitchState(currentlyActive, effectivePin, customMessage, settings);
      if (res.success) {
        toast.success('Error screen message updated');
        await refreshSettings();
      } else {
        toast.error(res.error || 'Failed to update message.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating message');
    } finally {
      setLoading(false);
    }
  };

  const copySqlSnippet = () => {
    const sql = `-- Run this in Supabase SQL Editor:
ALTER TABLE settings ADD COLUMN IF NOT EXISTS error_switch_active boolean NOT NULL DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS error_switch_message text DEFAULT NULL;

CREATE OR REPLACE FUNCTION public.toggle_emergency_error_switch(
  enable_switch boolean,
  secret_pin text,
  custom_message text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF secret_pin NOT IN ('amks9900', '9900', 'amks@emergency2026') THEN
    RAISE EXCEPTION 'Access Denied: Invalid security PIN';
  END IF;

  UPDATE settings
  SET 
    error_switch_active = enable_switch,
    error_switch_message = custom_message,
    social_links = jsonb_set(
      COALESCE(social_links, '{}'::jsonb),
      '{_error_switch_active}',
      to_jsonb(enable_switch)
    ),
    updated_at = now()
  WHERE id = 1;

  RETURN jsonb_build_object('success', true, 'error_switch_active', enable_switch);
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_emergency_error_switch(boolean, text, text) TO anon, authenticated;`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    toast.success('SQL copied to clipboard');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (previewMode) {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-[1000000001] bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 flex items-center gap-3">
          <span className="text-xs text-white font-medium">Previewing Error Screen</span>
          <button
            onClick={() => setPreviewMode(false)}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded shadow transition-colors"
          >
            Exit Preview
          </button>
        </div>
        <SupabaseErrorScreen customMessage={customMessage} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0e12] text-stone-200 flex flex-col font-sans">
      {/* Top Console Bar */}
      <header className="border-b border-stone-800 bg-[#12141a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500">
            <Power className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              Emergency Site Kill-Switch
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                Secret Terminal
              </span>
            </h1>
            <p className="text-xs text-stone-500 font-mono">Route: /errorswitch</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentlyActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-950/80 text-red-400 border border-red-800/60 font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              SITE PAUSED (ERROR ACTIVE)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              STORE IS LIVE
            </span>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Security Unlock Card (if locked) */}
        {!isUnlocked ? (
          <div className="max-w-md mx-auto bg-[#151720] border border-stone-800 rounded-2xl p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-center text-white mb-2">Restricted Access</h2>
            <p className="text-xs text-center text-stone-400 mb-6">
              Enter your master security PIN to access the emergency error switch console.
            </p>

            {!showAdminLogin ? (
              <form onSubmit={handleUnlockWithPin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Security PIN
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      autoFocus
                      placeholder="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0d0e12] border border-stone-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#3ecf8e]"
                    />
                    <KeyRound className="w-4 h-4 text-stone-500 absolute right-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Default PIN: <code className="text-stone-300">amks9900</code></p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#3ecf8e] text-black font-semibold rounded-lg hover:bg-[#3ecf8e]/90 text-sm transition-colors"
                >
                  Unlock Switch Console
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(true)}
                    className="text-xs text-stone-400 hover:text-white underline underline-offset-4"
                  >
                    Or sign in with Admin Account
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAdminSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0d0e12] border border-stone-700 rounded-lg text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0d0e12] border border-stone-700 rounded-lg text-white text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={adminLoggingIn}
                  className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-lg hover:bg-stone-200 text-sm transition-colors"
                >
                  {adminLoggingIn ? 'Signing in...' : 'Sign in as Admin'}
                </button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(false)}
                    className="text-xs text-stone-400 hover:text-white underline underline-offset-4"
                  >
                    Back to PIN unlock
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Unlocked Switch Control Dashboard */
          <div className="space-y-8">
            {/* Status Hero Card */}
            <div
              className={`p-6 md:p-8 rounded-2xl border transition-all ${currentlyActive
                ? 'bg-red-950/20 border-red-800/60 shadow-red-950/40 shadow-lg'
                : 'bg-emerald-950/20 border-emerald-800/50 shadow-emerald-950/20 shadow-lg'
                }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${currentlyActive
                      ? 'bg-red-900/40 text-red-400 border border-red-700/50'
                      : 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50'
                      }`}
                  >
                    {currentlyActive ? (
                      <ShieldAlert className="w-8 h-8 animate-pulse" />
                    ) : (
                      <ShieldCheck className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white tracking-tight">
                        {currentlyActive ? 'Site is PAUSED' : 'Site is LIVE'}
                      </h2>
                    </div>
                    <p className="text-sm text-stone-300 mt-1 max-w-xl">
                      {currentlyActive
                        ? 'The inescapable Supabase suspension screen is currently active. Any visitor visiting www.amks.pk or www.amks.pk/admin will see the billing error and cannot use the site.'
                        : 'The website and admin panel are currently fully active and operational for all visitors.'}
                    </p>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {currentlyActive ? (
                    <button
                      onClick={() => handleToggleSwitch(false)}
                      disabled={loading}
                      className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 text-sm"
                    >
                      <Power className="w-4 h-4" />
                      {loading ? 'Resuming Site...' : 'TURN OFF ERROR (GO LIVE)'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleSwitch(true)}
                      disabled={loading}
                      className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-950/80 transition-transform active:scale-95 flex items-center justify-center gap-2 text-sm"
                    >
                      <Power className="w-4 h-4" />
                      {loading ? 'Enabling Error...' : 'ENABLE ERROR SCREEN (PAUSE SITE)'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Live Verification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#151720] border border-stone-800 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Preview Error Screen</h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Inspect the exact look and feel without pausing the site.
                  </p>
                </div>
                <button
                  onClick={() => setPreviewMode(true)}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>

              <div className="bg-[#151720] border border-stone-800 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Live Store Test</h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Open normal website in a new tab to verify the state.
                  </p>
                </div>
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  Open amks.pk ↗
                </a>
              </div>
            </div>

            {/* Message Customizer */}
            <div className="bg-[#151720] border border-stone-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Error Screen Text
                </h3>
                <button
                  type="button"
                  onClick={() => setCustomMessage(DEFAULT_ERROR_MESSAGE)}
                  className="text-xs text-stone-400 hover:text-white"
                >
                  Reset to Default
                </button>
              </div>

              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="The site has been paused by Supabase..."
                className="w-full px-4 py-3 bg-[#0d0e12] border border-stone-700 rounded-xl text-stone-200 text-sm focus:outline-none focus:border-[#3ecf8e]"
              />

              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500">
                  This text will be prominently displayed on the Supabase error screen.
                </p>
                <button
                  onClick={handleSaveMessage}
                  disabled={loading}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Save Text
                </button>
              </div>
            </div>

            {/* Technical Database Setup Info */}
            <div className="bg-[#151720] border border-stone-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Database Migration Helper</h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Optional: Run this SQL once in your Supabase SQL editor to create the high-performance RPC function.
                  </p>
                </div>
                <button
                  onClick={copySqlSnippet}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied' : 'Copy SQL'}
                </button>
              </div>
              <div className="p-3 bg-[#0d0e12] border border-stone-800 rounded-lg text-xs font-mono text-stone-400 overflow-x-auto">
                <code>ALTER TABLE settings ADD COLUMN IF NOT EXISTS error_switch_active boolean NOT NULL DEFAULT false;</code>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
