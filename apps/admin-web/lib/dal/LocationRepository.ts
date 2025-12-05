/**
 * Location Repository
 * 
 * Data access layer for locations table.
 * Handles restaurant location operations.
 */

import { BaseRepository, QueryOptions } from './BaseRepository';

export interface Location {
  id: string;
  restaurant_id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  is_active: boolean;
  business_hours: Record<string, { open: string; close: string; closed: boolean }>;
  created_at: string;
  updated_at: string;
}

export class LocationRepository extends BaseRepository<Location> {
  constructor() {
    super('locations');
  }

  /**
   * Find all locations for a restaurant
   */
  async findByRestaurant(
    restaurantId: string,
    options?: QueryOptions
  ): Promise<Location[]> {
    return this.findAll(
      { restaurant_id: restaurantId },
      options || {
        orderBy: { column: 'created_at', ascending: true },
      }
    );
  }

  /**
   * Find active locations only
   */
  async findActiveByRestaurant(restaurantId: string): Promise<Location[]> {
    return this.findAll(
      {
        restaurant_id: restaurantId,
        is_active: true,
      },
      {
        orderBy: { column: 'created_at', ascending: true },
      }
    );
  }

  /**
   * Find location by slug
   */
  async findBySlug(slug: string): Promise<Location | null> {
    return this.findOne({ slug });
  }

  /**
   * Soft delete location (set is_active to false)
   */
  async softDelete(id: string): Promise<Location> {
    return this.update(id, {
      is_active: false,
      updated_at: new Date().toISOString(),
    } as Partial<Location>);
  }

  /**
   * Toggle location active status
   */
  async toggleActive(id: string): Promise<Location> {
    const location = await this.findById(id);
    if (!location) {
      throw new Error('Location not found');
    }

    return this.update(id, {
      is_active: !location.is_active,
      updated_at: new Date().toISOString(),
    } as Partial<Location>);
  }
}

export const locationRepository = new LocationRepository();
