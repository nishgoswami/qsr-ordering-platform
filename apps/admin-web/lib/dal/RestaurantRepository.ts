/**
 * Restaurant Repository
 * 
 * Data access layer for restaurants table.
 */

import { BaseRepository } from './BaseRepository';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class RestaurantRepository extends BaseRepository<Restaurant> {
  constructor() {
    super('restaurants');
  }

  /**
   * Find restaurant by slug
   */
  async findBySlug(slug: string): Promise<Restaurant | null> {
    return this.findOne({ slug });
  }

  /**
   * Find active restaurants
   */
  async findActive() {
    return this.findAll({ is_active: true });
  }
}

export const restaurantRepository = new RestaurantRepository();
