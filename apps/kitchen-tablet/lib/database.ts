import { supabase } from './supabase';

export interface Order {
  id: string;
  order_number: number;
  status: string;
  order_type: string;
  platform: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string | null;
  special_instructions: string | null;
  created_at: string;
  estimated_time: number;
  total_amount: number;
  items: OrderItem[];
}

export interface OrderItem {
  name: string;
  quantity: number;
  modifiers: string[];
  price: number;
}

export async function getOrders(status?: string): Promise<Order[]> {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}
