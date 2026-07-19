import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Settings } from '../types';

interface SettingsContextValue {
  settings: Settings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettingsState: (newSettings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  loading: true,
  refreshSettings: async () => {},
  updateSettingsState: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        setSettings(data as Settings);
        if (data.favicon) {
          let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.favicon;
        }
      }
    } catch (err) {
      console.error('Error fetching store settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettingsState = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime changes on the settings table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        (payload) => {
          if (payload.new) {
            setSettings(payload.new as Settings);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateSettingsState }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
