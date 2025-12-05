/**
 * Dashboard Service
 * 
 * Business logic for dashboard statistics and metrics.
 * Uses repositories for data access.
 */

import { orderRepository, menuItemRepository } from '../dal';

export class DashboardService {
  /**
   * Get dashboard statistics for a restaurant
   */
  static async getStats(restaurantId: string) {
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch today's orders
      const todaysOrders = await orderRepository.findByDateRange(
        restaurantId,
        today,
        tomorrow
      );

      // Fetch active orders (not completed/cancelled)
      const activeOrderCount = await orderRepository.countActive(restaurantId);

      // Fetch active menu items count
      const menuItems = await menuItemRepository.findActive(restaurantId);
      const menuItemsCount = menuItems.length;

      // Calculate stats
      const todaysOrderCount = todaysOrders.length;
      const todaysRevenue = todaysOrders.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );

      return {
        todaysOrders: todaysOrderCount,
        revenue: todaysRevenue,
        activeOrders: activeOrderCount,
        menuItems: menuItemsCount,
      };
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      return {
        todaysOrders: 0,
        revenue: 0,
        activeOrders: 0,
        menuItems: 0,
      };
    }
  }
}
