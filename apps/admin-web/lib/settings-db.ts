/**
 * Restaurant Settings Database Functions
 * 
 * Migrated to use DAL repositories and services.
 */

import { supabase } from './supabase';
import { RestaurantService } from './services/RestaurantService';
import { staffRepository } from './dal';

export interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  website?: string;
  tagline?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export interface LocationData {
  id: string;
  restaurant_id: string;
  name: string;
  slug?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  is_active: boolean;
  business_hours: any;
  created_at?: string;
  updated_at?: string;
}

/**
 * Load restaurant settings from database
 */
export async function loadRestaurantSettings(userId: string) {
  try {
    // Get user's restaurant via repository
    const staff = await staffRepository.findOne({ user_id: userId });

    if (!staff) {
      throw new Error('Restaurant not found for user');
    }

    const restaurantId = staff.restaurant_id;

    // Load restaurant and locations using service
    return await RestaurantService.loadSettings(restaurantId);
  } catch (error) {
    console.error('Error loading settings:', error);
    throw error;
  }
}

/**
 * Save restaurant settings
 */
export async function saveSettings(
  restaurantId: string,
  data: {
    businessInfo: Partial<RestaurantData>;
    locations: LocationData[];
  }
) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Transform LocationData to Location type by adding missing properties
    const locationsWithDefaults = data.locations.map(loc => ({
      ...loc,
      slug: loc.slug || loc.name.toLowerCase().replace(/\s+/g, '-'),
      created_at: loc.created_at || new Date().toISOString(),
      updated_at: loc.updated_at || new Date().toISOString(),
    }));

    // Use service to save settings
    return await RestaurantService.saveSettings(restaurantId, user.id, {
      businessInfo: data.businessInfo as any,
      locations: locationsWithDefaults as any,
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

/**
 * Delete location with confirmation
 */
export async function deleteLocation(locationId: string, restaurantId: string) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Use service to delete location
    return await RestaurantService.deleteLocation(locationId, restaurantId, user.id);
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
}
