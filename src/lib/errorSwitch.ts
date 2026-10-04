import { supabase } from './supabase';
import type { Settings } from '../types';

export const DEFAULT_ERROR_MESSAGE =
  'The site has been paused by Supabase since the outstanding balance remains. Clear the outstanding balance to keep using the benefits.';

export const MASTER_PIN = 'amks9900';

/**
 * Checks whether the emergency error screen switch is currently active.
 * Checks both the dedicated column and the fallback JSONB storage in social_links.
 */
export function isErrorSwitchActive(settings: Settings | null): boolean {
  if (!settings) return false;
  if (settings.error_switch_active === true) return true;
  const socialLinks = settings.social_links as Record<string, any> | undefined;
  if (socialLinks && (socialLinks._error_switch_active === true || socialLinks._error_switch_active === 'true')) {
    return true;
  }
  return false;
}

/**
 * Returns the configured error message or the default Supabase pause message.
 */
export function getErrorSwitchMessage(settings: Settings | null): string {
  if (!settings) return DEFAULT_ERROR_MESSAGE;
  if (settings.error_switch_message && settings.error_switch_message.trim()) {
    return settings.error_switch_message.trim();
  }
  const socialLinks = settings.social_links as Record<string, any> | undefined;
  if (socialLinks?._error_switch_message && typeof socialLinks._error_switch_message === 'string' && socialLinks._error_switch_message.trim()) {
    return socialLinks._error_switch_message.trim();
  }
  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Updates the emergency switch state in Supabase.
 * Attempts RPC first, then falls back to direct settings update.
 */
export async function updateErrorSwitchState(
  enableSwitch: boolean,
  pin: string,
  customMessage?: string,
  currentSettings?: Settings | null
): Promise<{ success: boolean; error?: string; methodUsed?: string }> {
  const messageToSave = customMessage?.trim() || DEFAULT_ERROR_MESSAGE;

  // 1. Try calling the PostgreSQL RPC function
  try {
    const { error: rpcError } = await supabase.rpc('toggle_emergency_error_switch', {
      enable_switch: enableSwitch,
      secret_pin: pin,
      custom_message: messageToSave,
    });

    if (!rpcError) {
      return { success: true, methodUsed: 'rpc' };
    }
  } catch (e) {
    // Continue to fallback
  }

  // 2. Validate PIN locally if using direct update
  if (pin !== MASTER_PIN && pin !== '9900' && pin !== 'amks@emergency2026') {
    return { success: false, error: 'Invalid security PIN.' };
  }

  // 3. Fallback: Direct settings update (authenticated admin or if permitted)
  try {
    const socialLinks = (currentSettings?.social_links as Record<string, any>) || {};
    const updatedSocialLinks = {
      ...socialLinks,
      _error_switch_active: enableSwitch,
      _error_switch_message: messageToSave,
    };

    // Try updating both columns and social_links
    const updatePayload: Record<string, any> = {
      social_links: updatedSocialLinks,
      updated_at: new Date().toISOString(),
    };

    // Also attempt setting the explicit column if it exists in the schema
    const { error: directError } = await supabase
      .from('settings')
      .update({
        ...updatePayload,
        error_switch_active: enableSwitch,
        error_switch_message: messageToSave,
      })
      .eq('id', 1);

    if (!directError) {
      return { success: true, methodUsed: 'direct' };
    }

    // If that fails due to missing column, try updating just social_links
    const { error: fallbackError } = await supabase
      .from('settings')
      .update(updatePayload)
      .eq('id', 1);

    if (!fallbackError) {
      return { success: true, methodUsed: 'direct_json' };
    }

    return {
      success: false,
      error: fallbackError.message || directError.message || 'Permission denied. Please log in as admin or run the SQL migration.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to update error switch state.',
    };
  }
}
