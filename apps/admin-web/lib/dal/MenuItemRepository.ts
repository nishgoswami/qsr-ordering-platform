/**
 * Menu Item Repository
 * 
 * Data access layer for menu_items table.
 * Handles all database operations for menu items.
 */

import { BaseRepository, QueryOptions, FilterOptions } from './BaseRepository';
import { supabase } from '../supabase';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  is_available: boolean;
  prep_time_minutes?: number;
  calories?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface MenuItemWithCategory extends MenuItem {
  category?: {
    id: string;
    name: string;
    display_order: number;
  };
}

export class MenuItemRepository extends BaseRepository<MenuItem> {
  constructor() {
    super('menu_items');
  }

  /**
   * Find menu items with category details
   */
  async findWithCategory(
    filters?: FilterOptions,
    options?: QueryOptions
  ): Promise<MenuItemWithCategory[]> {
    let query = supabase.from(this.tableName).select(`
      *,
      category:categories (
        id,
        name,
        display_order
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

    const { data, error } = await query;

    if (error) {
      throw this.handleError(error, 'findWithCategory');
    }

    return (data as MenuItemWithCategory[]) || [];
  }

  /**
   * Find active menu items for a restaurant
   */
  async findActive(
    restaurantId: string,
    options?: QueryOptions
  ): Promise<MenuItem[]> {
    return this.findAll(
      {
        restaurant_id: restaurantId,
        is_active: true,
        is_available: true,
      },
      options
    );
  }

  /**
   * Find menu items by category
   */
  async findByCategory(
    categoryId: string,
    options?: QueryOptions
  ): Promise<MenuItem[]> {
    return this.findAll({ category_id: categoryId }, options);
  }

  /**
   * Search menu items by name or description
   */
  async search(
    restaurantId: string,
    searchTerm: string,
    options?: QueryOptions
  ): Promise<MenuItem[]> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('restaurant_id', restaurantId)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw this.handleError(error, 'search');
    }

    return (data as MenuItem[]) || [];
  }

  /**
   * Toggle menu item availability
   */
  async toggleAvailability(id: string): Promise<MenuItem> {
    const item = await this.findById(id);
    if (!item) {
      throw new Error('Menu item not found');
    }

    return this.update(id, {
      is_available: !item.is_available,
      updated_at: new Date().toISOString(),
    } as Partial<MenuItem>);
  }

  /**
   * Update price
   */
  async updatePrice(id: string, newPrice: number): Promise<MenuItem> {
    return this.update(id, {
      price: newPrice,
      updated_at: new Date().toISOString(),
    } as Partial<MenuItem>);
  }
}

export const menuItemRepository = new MenuItemRepository();
