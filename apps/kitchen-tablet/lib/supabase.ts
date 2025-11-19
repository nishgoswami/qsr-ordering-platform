import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create Supabase client with realtime enabled for order updates
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 20, // Higher rate for kitchen app
    },
  },
});

// Helper functions for kitchen operations

/**
 * Subscribe to real-time order updates
 */
export function subscribeToOrders(
  organizationId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel('orders-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `organization_id=eq.${organizationId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Get active orders for kitchen display
 */
export async function getActiveOrders(organizationId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        *,
        menu_item:menu_items (
          name,
          printer_station
        )
      )
    `
    )
    .eq('organization_id', organizationId)
    .in('status', ['pending', 'confirmed', 'preparing'])
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  notes?: string
) {
  const updates: any = { status, updated_at: new Date().toISOString() };

  if (status === 'ready') {
    updates.actual_ready_at = new Date().toISOString();
  }

  if (notes) {
    updates.kitchen_notes = notes;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark order as printed
 */
export async function markOrderPrinted(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ kitchen_printed: true })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
