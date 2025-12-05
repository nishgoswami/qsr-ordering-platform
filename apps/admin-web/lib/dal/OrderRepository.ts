/**
 * Order Repository
 * 
 * Data access layer for orders table.
 * Handles all database operations for orders.
 * 
 * @module OrderRepository
 */

import { BaseRepository, QueryOptions, FilterOptions } from './BaseRepository';
import { supabase } from '../supabase';

export interface Order {
  id: string;
  restaurant_id: string;
  customer_id?: string;
  total_amount: number;
  status: OrderStatus;
  delivery_address?: string;
  phone: string;
  customer_name?: string;
  customer_email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export interface OrderWithItems extends Order {
  order_items: Array<{
    id: string;
    menu_item_id: string;
    quantity: number;
    price: number;
    notes?: string;
    menu_items?: {
      id: string;
      name: string;
      description?: string;
      image_url?: string;
    };
  }>;
}

/**
 * Order Repository
 * Specialized data access for orders
 */
export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super('orders');
  }

  /**
   * Find orders with related items and menu details
   */
  async findWithItems(
    filters?: FilterOptions,
    options?: QueryOptions
  ): Promise<OrderWithItems[]> {
    let query = supabase.from(this.tableName).select(`
      *,
      order_items (
        id,
        menu_item_id,
        quantity,
        price,
        notes,
        menu_items (
          id,
          name,
          description,
          image_url
        )
      )
    `);

    // Apply filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 50) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      throw this.handleError(error, 'findWithItems');
    }

    return (data as OrderWithItems[]) || [];
  }

  /**
   * Find single order with items by ID
   */
  async findByIdWithItems(id: string): Promise<OrderWithItems | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        order_items (
          id,
          menu_item_id,
          quantity,
          price,
          notes,
          menu_items (
            id,
            name,
            description,
            image_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw this.handleError(error, 'findByIdWithItems');
    }

    return data as OrderWithItems;
  }

  /**
   * Find orders by restaurant ID
   */
  async findByRestaurant(
    restaurantId: string,
    options?: QueryOptions
  ): Promise<Order[]> {
    return this.findAll({ restaurant_id: restaurantId }, options);
  }

  /**
   * Find orders by status
   */
  async findByStatus(
    restaurantId: string,
    status: OrderStatus | OrderStatus[],
    options?: QueryOptions
  ): Promise<Order[]> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (Array.isArray(status)) {
      query = query.in('status', status);
    } else {
      query = query.eq('status', status);
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw this.handleError(error, 'findByStatus');
    }

    return (data as Order[]) || [];
  }

  /**
   * Find orders by date range
   */
  async findByDateRange(
    restaurantId: string,
    startDate: Date,
    endDate: Date,
    options?: QueryOptions
  ): Promise<Order[]> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Apply ordering
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    const { data, error } = await query;

    if (error) {
      throw this.handleError(error, 'findByDateRange');
    }

    return (data as Order[]) || [];
  }

  /**
   * Get order statistics
   */
  async getStats(
    restaurantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total: number;
    completed: number;
    cancelled: number;
    revenue: number;
    averageOrderValue: number;
  }> {
    let query = supabase
      .from(this.tableName)
      .select('id, status, total_amount')
      .eq('restaurant_id', restaurantId);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw this.handleError(error, 'getStats');
    }

    const orders = data || [];
    const completed = orders.filter((o) => o.status === 'completed');
    const cancelled = orders.filter((o) => o.status === 'cancelled');
    const revenue = completed.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    return {
      total: orders.length,
      completed: completed.length,
      cancelled: cancelled.length,
      revenue,
      averageOrderValue: completed.length > 0 ? revenue / completed.length : 0,
    };
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.update(id, {
      status,
      updated_at: new Date().toISOString(),
    } as Partial<Order>);
  }

  /**
   * Count active orders (not completed/cancelled)
   */
  async countActive(restaurantId: string): Promise<number> {
    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .in('status', [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
      ]);

    if (error) {
      throw this.handleError(error, 'countActive');
    }

    return count || 0;
  }
}

// Export singleton instance
export const orderRepository = new OrderRepository();
