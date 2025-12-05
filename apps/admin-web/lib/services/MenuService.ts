/**
 * Menu Service
 * 
 * Business logic for menu management.
 * Handles categories and menu items.
 */

import { menuItemRepository, categoryRepository } from '../dal';
import type { MenuItem } from '../dal/MenuItemRepository';
import type { Category } from '../dal/CategoryRepository';

export class MenuService {
  /**
   * Get all categories for a restaurant
   */
  static async getCategories(restaurantId: string): Promise<Category[]> {
    try {
      return await categoryRepository.findActiveByRestaurant(restaurantId);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Get menu items with optional category filter
   */
  static async getMenuItems(
    restaurantId: string,
    categoryId?: string
  ): Promise<MenuItem[]> {
    try {
      if (categoryId && categoryId !== 'all') {
        return await menuItemRepository.findByCategory(categoryId);
      }
      return await menuItemRepository.findActive(restaurantId);
    } catch (error: any) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  }

  /**
   * Create a new category
   */
  static async createCategory(
    restaurantId: string,
    name: string,
    description?: string
  ) {
    try {
      // Get current max display order
      const categories = await categoryRepository.findByRestaurant(restaurantId);
      const maxOrder = Math.max(...categories.map(c => c.display_order), 0);

      const data = await categoryRepository.create({
        restaurant_id: restaurantId,
        name,
        description,
        display_order: maxOrder + 1,
        is_active: true,
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating category:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new menu item
   */
  static async createMenuItem(
    restaurantId: string,
    item: {
      name: string;
      description?: string;
      price: number;
      category_id: string;
      image_url?: string;
    }
  ) {
    try {
      const data = await menuItemRepository.create({
        restaurant_id: restaurantId,
        ...item,
        is_active: true,
        is_available: true,
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update menu item
   */
  static async updateMenuItem(id: string, updates: Partial<MenuItem>) {
    try {
      const data = await menuItemRepository.update(id, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete menu item
   */
  static async deleteMenuItem(id: string) {
    try {
      await menuItemRepository.delete(id);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      return { success: false, error: error.message };
    }
  }
}
