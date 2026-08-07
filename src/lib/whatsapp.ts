/**
 * WhatsApp Meta Cloud API Helper Utility for Automatic Order Confirmations
 */

export interface WhatsAppOrderPayload {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
}

/**
 * Formats phone number to international E.164 format without '+' or spaces.
 * E.g., '03001234567' -> '923001234567'
 */
export function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');

  // Handle Pakistani local number starting with 03xx
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('92') && cleaned.length === 12) {
    // Already in correct format
  } else if (cleaned.length === 10 && !cleaned.startsWith('92')) {
    cleaned = '92' + cleaned;
  }

  return cleaned;
}

/**
 * Sends automated WhatsApp order confirmation template message with Confirm/Cancel quick reply buttons.
 */
export async function sendWhatsAppOrderConfirmation(payload: WhatsAppOrderPayload): Promise<{ success: boolean; data?: any; error?: string }> {
  const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
  const templateName = import.meta.env.VITE_WHATSAPP_TEMPLATE_NAME || 'order_confirmation';

  if (!phoneNumberId || !accessToken) {
    console.warn('[WhatsApp API] Missing VITE_WHATSAPP_PHONE_NUMBER_ID or VITE_WHATSAPP_ACCESS_TOKEN in environment variables.');
    return { success: false, error: 'WhatsApp credentials not configured.' };
  }

  const recipientPhone = formatPhoneForWhatsApp(payload.customerPhone);
  const formattedTotal = Math.round(payload.totalAmount).toLocaleString();

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: payload.customerName || 'Customer' },
                { type: 'text', text: payload.orderNumber },
                { type: 'text', text: `${formattedTotal}` },
              ],
            },
            {
              type: 'button',
              sub_type: 'quick_reply',
              index: '0',
              parameters: [
                { type: 'payload', payload: `CONFIRM_${payload.orderId}` },
              ],
            },
            {
              type: 'button',
              sub_type: 'quick_reply',
              index: '1',
              parameters: [
                { type: 'payload', payload: `CANCEL_${payload.orderId}` },
              ],
            },
          ],
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp API] Error response from Meta Graph API:', result);
      return { success: false, error: result.error?.message || 'Meta API request failed' };
    }

    console.log('[WhatsApp API] Successfully sent order confirmation message:', result);
    return { success: true, data: result };
  } catch (err: any) {
    console.error('[WhatsApp API] Failed to send WhatsApp message:', err);
    return { success: false, error: err.message || 'Network error' };
  }
}
