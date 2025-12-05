/**
 * Order Item Repository
 * 
 * Data access layer for order_items table.
 * Handles line items for orders.
 */

import { BaseRepository } from './BaseRepository';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  notes?: string;
  created_at: string;
}

export class OrderItemRepository extends BaseRepository<OrderItem> {
  constructor() {
    super('order_items');
  }

  /**
   * Find all items for an order
   */
  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.findAll({ order_id: orderId });
  }

  /**
   * Create multiple order items at once
   */
  async createForOrder(
    orderId: string,
    items: Array<{
      menuItemId: string;
      quantity: number;
      price: number;
      notes?: string;
    }>
  ): Promise<OrderItem[]> {
    const orderItems = items.map(item => ({
      order_id: orderId,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes,
    }));

    return this.createMany(orderItems as Partial<OrderItem>[]);
  }

  /**
   * Delete all items for an order (used in rollback scenarios)
   */
  async deleteByOrderId(orderId: string): Promise<void> {
    return this.deleteMany({ order_id: orderId });
  }
}

export const orderItemRepository = new OrderItemRepository();
