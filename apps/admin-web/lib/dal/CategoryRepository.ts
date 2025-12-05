/**
 * Category Repository
 * 
 * Data access layer for categories table.
 * Handles menu category operations.
 */

import { BaseRepository, QueryOptions } from './BaseRepository';

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super('categories');
  }

  /**
   * Find all categories for a restaurant
   */
  async findByRestaurant(
    restaurantId: string,
    options?: QueryOptions
  ): Promise<Category[]> {
    return this.findAll(
      { restaurant_id: restaurantId },
      options || {
        orderBy: { column: 'display_order', ascending: true },
      }
    );
  }

  /**
   * Find active categories only
   */
  async findActiveByRestaurant(restaurantId: string): Promise<Category[]> {
    return this.findAll(
      {
        restaurant_id: restaurantId,
        is_active: true,
      },
      {
        orderBy: { column: 'display_order', ascending: true },
      }
    );
  }

  /**
   * Reorder categories
   */
  async reorder(categoryIds: string[], newOrders: number[]): Promise<void> {
    if (categoryIds.length !== newOrders.length) {
      throw new Error('Category IDs and orders length mismatch');
    }

    // Update each category's display order
    for (let i = 0; i < categoryIds.length; i++) {
      await this.update(categoryIds[i], {
        display_order: newOrders[i],
        updated_at: new Date().toISOString(),
      } as Partial<Category>);
    }
  }

  /**
   * Toggle category active status
   */
  async toggleActive(id: string): Promise<Category> {
    const category = await this.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    return this.update(id, {
      is_active: !category.is_active,
      updated_at: new Date().toISOString(),
    } as Partial<Category>);
  }
}

export const categoryRepository = new CategoryRepository();
