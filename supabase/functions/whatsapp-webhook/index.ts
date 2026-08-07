// Supabase Edge Function: whatsapp-webhook
// Listens for Meta WhatsApp Webhook events (Button quick reply responses)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const url = new URL(req.url);

  // 1. GET Request: Meta Webhook Verification
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const expectedVerifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'amks_secret_verify_token_2026';

    if (mode === 'subscribe' && token === expectedVerifyToken) {
      console.log('[WhatsApp Webhook] Webhook verified successfully!');
      return new Response(challenge, { status: 200 });
    } else {
      console.error('[WhatsApp Webhook] Verification failed. Token mismatch.');
      return new Response('Forbidden', { status: 403 });
    }
  }

  // 2. POST Request: Incoming WhatsApp Events (Button clicks)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('[WhatsApp Webhook] Received webhook event:', JSON.stringify(body));

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message) {
        const fromNumber = message.from; // Customer phone number
        let payload = '';

        // Check if message is a Quick Reply button response
        if (message.type === 'button') {
          payload = message.button?.payload || '';
        } else if (message.type === 'interactive') {
          payload = message.interactive?.button_reply?.id || message.interactive?.button_reply?.title || '';
        }

        console.log(`[WhatsApp Webhook] Button response payload: "${payload}" from ${fromNumber}`);

        if (payload.startsWith('CONFIRM_') || payload.startsWith('CANCEL_')) {
          const isConfirm = payload.startsWith('CONFIRM_');
          const orderId = payload.replace(isConfirm ? 'CONFIRM_' : 'CANCEL_', '').trim();

          // Initialize Supabase Admin client
          const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
          const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

          if (supabaseUrl && supabaseServiceKey) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            // Fetch order details
            const { data: order } = await supabase
              .from('orders')
              .select('id, order_number, customer_name, status')
              .eq('id', orderId)
              .maybeSingle();

            if (order) {
              const newStatus = isConfirm ? 'confirmed' : 'cancelled';

              // Update order status in Supabase database
              const { error: updateError } = await supabase
                .from('orders')
                .update({
                  status: newStatus,
                  verification_notes: `Auto-${isConfirm ? 'confirmed' : 'cancelled'} via WhatsApp Quick Reply by customer on ${new Date().toLocaleString()}`
                })
                .eq('id', orderId);

              if (updateError) {
                console.error('[WhatsApp Webhook] Error updating order status:', updateError);
              } else {
                console.log(`[WhatsApp Webhook] Order #${order.order_number} successfully updated to "${newStatus}".`);

                // Send a quick follow-up acknowledgment message back to customer on WhatsApp
                const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
                const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');

                if (phoneNumberId && accessToken) {
                  const ackMessage = isConfirm
                    ? `✅ Thank you ${order.customer_name || ''}! Your order #${order.order_number} has been confirmed. We will prepare your items for shipment shortly.`
                    : `❌ Your order #${order.order_number} has been cancelled as requested. Thank you for informing us.`;

                  await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      messaging_product: 'whatsapp',
                      recipient_type: 'individual',
                      to: fromNumber,
                      type: 'text',
                      text: { body: ackMessage },
                    }),
                  });
                }
              }
            } else {
              console.warn(`[WhatsApp Webhook] Order ID "${orderId}" not found in database.`);
            }
          }
        }
      }

      // Always return 200 OK to Meta so it stops retrying the webhook
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      console.error('[WhatsApp Webhook] Internal server error:', err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
});
