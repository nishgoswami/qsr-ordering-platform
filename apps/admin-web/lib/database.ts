/**
 * Database Helper Functions
 * 
 * Migrated to use DAL repositories and services.
 * All direct Supabase queries replaced with proper architecture.
 */

import { getCurrentUser, getUserRestaurant } from './auth';
import { DashboardService } from './services/DashboardService';
import { MenuService } from './services/MenuService';
import { OrderService } from './services/OrderService';

/**
 * Get dashboard stats for the current restaurant
 */
export async function getDashboardStats() {
  try {
    const { restaurant } = await getUserRestaurant();
    if (!restaurant) throw new Error('No restaurant found');

    return await DashboardService.getStats(restaurant.id);
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

/**
 * Get categories for the current restaurant
 */
export async function getCategories() {
  try {
    const { restaurant } = await getUserRestaurant();
    if (!restaurant) throw new Error('No restaurant found');

    return await MenuService.getCategories(restaurant.id);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Get menu items for the current restaurant
 */
export async function getMenuItems(categoryId?: string) {
  try {
    const { restaurant } = await getUserRestaurant();
    if (!restaurant) throw new Error('No restaurant found');

    return await MenuService.getMenuItems(restaurant.id, categoryId);
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

/**
 * Get orders for the current restaurant
 */
export async function getOrders(filters?: { status?: string; type?: string }) {
  try {
    const { restaurant } = await getUserRestaurant();
    if (!restaurant) throw new Error('No restaurant found');

    // Convert to OrderService filters format
    const serviceFilters = {
      restaurantId: restaurant.id,
      status: filters?.status !== 'all' ? filters?.status as any : undefined,
    };

    return await OrderService.getOrders(serviceFilters);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Create a new category
 */
export async function createCategory(name: string, description?: string) {
  try {
    const { restaurant } = await getUserRestaurant();
    if (!restaurant) throw new Error('No restaurant found');

    return await MenuService.createCategory(restaurant.id, name, description);
  } catch (error: any) {
    console.error('Error creating category:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new menu item
 */
export async function createMenuItem(item: {
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
}) {
  try {
    const { restaurant } = await getUserRestaurant();
    if (!restaurant) throw new Error('No restaurant found');

    return await MenuService.createMenuItem(restaurant.id, item);
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update menu item
 */
export async function updateMenuItem(id: string, updates: any) {
  try {
    return await MenuService.updateMenuItem(id, updates);
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete menu item
 */
export async function deleteMenuItem(id: string) {
  try {
    return await MenuService.deleteMenuItem(id);
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { user } = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const updatedOrder = await OrderService.updateOrderStatus(
      orderId,
      status as any,
      user.id
    );

    return { success: true, data: updatedOrder };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
}
