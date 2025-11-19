import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Admin helper functions

/**
 * Get organization details
 */
export async function getOrganization(organizationId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update organization settings
 */
export async function updateOrganization(
  organizationId: string,
  updates: any
) {
  const { data, error } = await supabase
    .from('organizations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', organizationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get menu items with categories
 */
export async function getMenuItems(organizationId: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select(
      `
      *,
      category:categories (*),
      modifiers:item_modifiers (*)
    `
    )
    .eq('organization_id', organizationId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Create or update menu item
 */
export async function upsertMenuItem(menuItem: any) {
  const { data, error } = await supabase
    .from('menu_items')
    .upsert(menuItem)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete menu item
 */
export async function deleteMenuItem(menuItemId: string) {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', menuItemId);

  if (error) throw error;
}

/**
 * Get orders with filters
 */
export async function getOrders(
  organizationId: string,
  filters?: {
    status?: string[];
    startDate?: Date;
    endDate?: Date;
    orderType?: string;
  }
) {
  let query = supabase
    .from('orders')
    .select(
      `
      *,
      order_items (*)
    `
    )
    .eq('organization_id', organizationId);

  if (filters?.status?.length) {
    query = query.in('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString());
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString());
  }

  if (filters?.orderType) {
    query = query.eq('order_type', filters.orderType);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Get sales analytics
 */
export async function getSalesAnalytics(
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  const { data, error } = await supabase
    .from('orders')
    .select('total, status, order_type, created_at')
    .eq('organization_id', organizationId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .in('status', ['completed']);

  if (error) throw error;

  // Calculate totals
  const totalRevenue = data.reduce((sum, order) => sum + Number(order.total), 0);
  const totalOrders = data.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    orders: data,
  };
}

/**
 * Get staff members
 */
export async function getStaffMembers(organizationId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', organizationId)
    .in('role', ['admin', 'staff'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Update user permissions
 */
export async function updateUserPermissions(
  userId: string,
  permissions: {
    can_manage_orders?: boolean;
    can_manage_menu?: boolean;
    can_view_reports?: boolean;
  }
) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...permissions, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
