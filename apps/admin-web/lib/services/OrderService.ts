/**
 * Order Service
 * 
 * Handles all order-related business logic including:
 * - Order creation and validation
 * - Status updates and transitions
 * - Order queries and filtering
 * - Notifications and audit logging
 * 
 * Uses OrderRepository (DAL) for all database operations.
 * Business logic is separated from data access.
 * 
 * @module OrderService
 */

import { orderRepository, menuItemRepository, orderItemRepository, auditLogRepository } from '../dal';
import type { Order, OrderStatus, OrderWithItems } from '../dal/OrderRepository';
import type { MenuItem } from '../dal/MenuItemRepository';

// Re-export types from DAL
export type { Order, OrderStatus, OrderWithItems } from '../dal/OrderRepository';

// Service-specific types
export interface CreateOrderInput {
  restaurantId: string;
  customerId?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    notes?: string;
  }>;
  deliveryAddress?: string;
  phone: string;
  customerName?: string;
  customerEmail?: string;
  notes?: string;
}

export interface OrderFilters {
  restaurantId: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Order Service Class
 * Provides centralized business logic for order operations
 */
export class OrderService {
  /**
   * Get orders with filters and pagination
   */
  static async getOrders(filters: OrderFilters): Promise<OrderWithItems[]> {
    const queryFilters: any = {
      restaurant_id: filters.restaurantId,
    };

    if (filters.status) {
      queryFilters.status = filters.status;
    }

    const options = {
      orderBy: { column: 'created_at', ascending: false },
      limit: filters.limit,
      offset: filters.offset,
    };

    // If date range specified, use specialized method
    if (filters.startDate && filters.endDate) {
      return orderRepository.findByDateRange(
        filters.restaurantId,
        filters.startDate,
        filters.endDate,
        options
      ) as Promise<OrderWithItems[]>;
    }

    return orderRepository.findWithItems(queryFilters, options);
  }

  /**
   * Get single order by ID
   */
  static async getOrderById(orderId: string): Promise<OrderWithItems> {
    const order = await orderRepository.findByIdWithItems(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  /**
   * Create new order with validation
   */
  static async createOrder(input: CreateOrderInput, userId: string): Promise<Order> {
    // 1. Validate menu items exist and are active
    const menuItems = await this.validateMenuItems(input.items.map(i => i.menuItemId));

    // 2. Calculate total amount
    const totalAmount = this.calculateTotal(input.items, menuItems);

    // 3. Create order via repository
    const order = await orderRepository.create({
      restaurant_id: input.restaurantId,
      customer_id: input.customerId || userId,
      total_amount: totalAmount,
      status: 'pending',
      delivery_address: input.deliveryAddress,
      phone: input.phone,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      notes: input.notes,
    });

    // 4. Create order items using repository
    const orderItems = input.items.map(item => {
      const menuItem = menuItems.find((m: MenuItem) => m.id === item.menuItemId);
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem!.price,
        notes: item.notes,
      };
    });

    try {
      await orderItemRepository.createForOrder(order.id, orderItems);
    } catch (error) {
      // Rollback: Delete the order if items creation fails
      await orderRepository.delete(order.id);
      throw new Error(`Failed to create order items: ${error}`);
    }

    // 5. Log audit trail
    await this.createAuditLog({
      action: 'order_created',
      userId,
      resourceId: order.id,
      details: {
        restaurantId: input.restaurantId,
        totalAmount,
        itemCount: input.items.length,
      },
    });

    // 6. Send notifications (async, don't wait)
    this.sendOrderNotifications(order).catch(err => {
      console.error('Failed to send order notifications:', err);
    });

    return order as Order;
  }

  /**
   * Update order status with validation
   */
  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    userId: string
  ): Promise<Order> {
    // 1. Get current order
    const currentOrder = await this.getOrderById(orderId);

    // 2. Validate status transition
    if (!this.isValidStatusTransition(currentOrder.status, newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentOrder.status} to ${newStatus}`
      );
    }

    // 3. Update status via repository
    const updatedOrder = await orderRepository.updateStatus(orderId, newStatus);

    // 4. Audit log
    await this.createAuditLog({
      action: 'order_status_updated',
      userId,
      resourceId: orderId,
      details: {
        oldStatus: currentOrder.status,
        newStatus,
      },
    });

    // 5. Send status update notification
    this.sendStatusUpdateNotification(updatedOrder).catch(err => {
      console.error('Failed to send status notification:', err);
    });

    return updatedOrder;
  }

  /**
   * Cancel order
   */
  static async cancelOrder(orderId: string, reason: string, userId: string): Promise<Order> {
    const currentOrder = await this.getOrderById(orderId);

    // Can only cancel pending, confirmed, or preparing orders
    if (!['pending', 'confirmed', 'preparing'].includes(currentOrder.status)) {
      throw new Error(`Cannot cancel order in ${currentOrder.status} status`);
    }

    const updatedOrder = await orderRepository.update(orderId, {
      status: 'cancelled',
      notes: currentOrder.notes 
        ? `${currentOrder.notes}\n\nCancellation reason: ${reason}`
        : `Cancellation reason: ${reason}`,
      updated_at: new Date().toISOString(),
    });

    await this.createAuditLog({
      action: 'order_cancelled',
      userId,
      resourceId: orderId,
      details: { reason },
    });

    return updatedOrder;
  }

  /**
   * Get order statistics for dashboard
   */
  static async getOrderStats(restaurantId: string, period: 'today' | 'week' | 'month' = 'today') {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
    }

    // Use repository to get stats
    const stats = await orderRepository.getStats(restaurantId, startDate, endDate);

    // Get detailed status breakdown
    const orders = await orderRepository.findByDateRange(restaurantId, startDate, endDate);

    return {
      totalOrders: stats.total,
      totalRevenue: stats.revenue,
      averageOrderValue: stats.averageOrderValue,
      ordersByStatus: {
        pending: orders.filter((o: Order) => o.status === 'pending').length,
        confirmed: orders.filter((o: Order) => o.status === 'confirmed').length,
        preparing: orders.filter((o: Order) => o.status === 'preparing').length,
        ready: orders.filter((o: Order) => o.status === 'ready').length,
        out_for_delivery: orders.filter((o: Order) => o.status === 'out_for_delivery').length,
        completed: orders.filter((o: Order) => o.status === 'completed').length,
        cancelled: orders.filter((o: Order) => o.status === 'cancelled').length,
      },
    };
  }

  // ========== Private Helper Methods ==========

  /**
   * Validate menu items exist and are active
   */
  private static async validateMenuItems(menuItemIds: string[]): Promise<MenuItem[]> {
    // Fetch all requested menu items
    const menuItems: MenuItem[] = [];
    for (const id of menuItemIds) {
      const item = await menuItemRepository.findById(id);
      if (!item) {
        throw new Error(`Menu item ${id} not found`);
      }
      menuItems.push(item);
    }

    if (menuItems.length !== menuItemIds.length) {
      throw new Error('Some menu items not found');
    }

    const inactiveItems = menuItems.filter((item: MenuItem) => !item.is_active);
    if (inactiveItems.length > 0) {
      throw new Error(`Menu items not available: ${inactiveItems.map((i: MenuItem) => i.name).join(', ')}`);
    }

    return menuItems;
  }

  /**
   * Calculate total order amount
   */
  private static calculateTotal(
    items: Array<{ menuItemId: string; quantity: number }>,
    menuItems: Array<{ id: string; price: number }>
  ): number {
    return items.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      return sum + (menuItem.price * item.quantity);
    }, 0);
  }

  /**
   * Validate order status transitions
   */
  private static isValidStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['out_for_delivery', 'completed'],
      out_for_delivery: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    return validTransitions[current]?.includes(next) || false;
  }

  /**
   * Create audit log entry
   */
  private static async createAuditLog(log: {
    action: string;
    userId: string;
    resourceId: string;
    details?: any;
  }) {
    try {
      await auditLogRepository.log({
        action: log.action,
        userId: log.userId,
        resourceType: 'order',
        resourceId: log.resourceId,
        details: log.details,
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit log failure shouldn't block operations
    }
  }

  /**
   * Send order confirmation notifications
   */
  private static async sendOrderNotifications(order: Order) {
    // TODO: Implement email/SMS notifications
    // For now, just log
    console.log('Order notification:', {
      orderId: order.id,
      phone: order.phone,
      email: order.customer_email,
    });
  }

  /**
   * Send status update notification
   */
  private static async sendStatusUpdateNotification(order: Order) {
    // TODO: Implement email/SMS notifications
    console.log('Status update notification:', {
      orderId: order.id,
      status: order.status,
    });
  }
}
