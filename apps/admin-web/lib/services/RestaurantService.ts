/**
 * Restaurant Service
 * 
 * Business logic for restaurant and location management.
 */

import { restaurantRepository, locationRepository, auditLogRepository } from '../dal';
import type { Restaurant } from '../dal/RestaurantRepository';
import type { Location } from '../dal/LocationRepository';

export class RestaurantService {
  /**
   * Load restaurant settings with locations
   */
  static async loadSettings(restaurantId: string) {
    try {
      const restaurant = await restaurantRepository.findById(restaurantId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const locations = await locationRepository.findByRestaurant(restaurantId);

      return {
        restaurant,
        locations,
        restaurantId,
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      throw error;
    }
  }

  /**
   * Save restaurant settings
   */
  static async saveSettings(
    restaurantId: string,
    userId: string,
    data: {
      businessInfo: Partial<Restaurant>;
      locations: Location[];
    }
  ) {
    try {
      // Create audit log entry
      await auditLogRepository.log({
        action: 'settings_update',
        userId,
        resourceType: 'restaurant',
        resourceId: restaurantId,
        details: {
          changed_fields: Object.keys(data.businessInfo),
          timestamp: new Date().toISOString(),
        },
      });

      // Update restaurant info
      if (Object.keys(data.businessInfo).length > 0) {
        await restaurantRepository.update(restaurantId, {
          ...data.businessInfo,
          updated_at: new Date().toISOString(),
        });
      }

      // Update locations
      for (const location of data.locations) {
        if (location.id.startsWith('new-')) {
          // Insert new location
          await locationRepository.create({
            restaurant_id: restaurantId,
            name: location.name,
            slug: location.slug,
            address: location.address,
            city: location.city,
            state: location.state,
            zip_code: location.zip_code,
            phone: location.phone,
            email: location.email,
            is_active: location.is_active,
            business_hours: location.business_hours,
          });
        } else {
          // Update existing location
          await locationRepository.update(location.id, {
            name: location.name,
            address: location.address,
            city: location.city,
            state: location.state,
            zip_code: location.zip_code,
            phone: location.phone,
            email: location.email,
            is_active: location.is_active,
            business_hours: location.business_hours,
            updated_at: new Date().toISOString(),
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Delete location (soft delete)
   */
  static async deleteLocation(
    locationId: string,
    restaurantId: string,
    userId: string
  ) {
    try {
      // Create audit log before deletion
      await auditLogRepository.log({
        action: 'location_delete',
        userId,
        resourceType: 'location',
        resourceId: locationId,
        details: {
          restaurant_id: restaurantId,
          timestamp: new Date().toISOString(),
        },
      });

      // Soft delete
      await locationRepository.softDelete(locationId);

      return { success: true };
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }
}
