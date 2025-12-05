import { supabase } from './supabase';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  tagline: string;
  description: string;
  website: string;
  logo_url: string | null;
}

export interface Location {
  id: string;
  restaurant_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  email: string;
  is_active: boolean;
  tax_rate: number;
  latitude: number | null;
  longitude: number | null;
  business_hours: any; // JSON field with operating hours (note: it's business_hours not hours)
}

export interface Settings {
  id: string;
  restaurant_id: string;
  about_title: string;
  about_paragraph_1: string;
  about_paragraph_2: string | null;
  footer_text: string;
  hero_title: string;
  hero_subtitle: string;
  ordering_url: string;
  show_reviews?: boolean;
  show_ratings?: boolean;
  // Section visibility controls
  showPopularItems?: boolean;
  showOffers?: boolean;
  showReviews?: boolean;
  showWhyChooseUs?: boolean;
  showStats?: boolean;
  updated_at?: string;
}

// Get restaurant by slug or first active restaurant
export async function getRestaurant(slug?: string): Promise<Restaurant | null> {
  try {
    let query = supabase
      .from('restaurants')
      .select('*')
      .eq('approval_status', 'approved');

    if (slug) {
      query = query.eq('slug', slug);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching restaurant:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
}

// Get all active locations for a restaurant
export async function getLocations(restaurantId: string): Promise<Location[]> {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching locations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

// Get restaurant settings (returns default values if not found)
export async function getRestaurantSettings(restaurantId: string): Promise<Settings | null> {
  try {
    // Return default settings since the table doesn't exist yet
    return {
      id: restaurantId,
      restaurant_id: restaurantId,
      about_title: 'About Our Restaurant',
      about_paragraph_1: 'Welcome to our restaurant! We serve delicious food made with fresh, quality ingredients.',
      about_paragraph_2: 'Visit us today and experience great food and excellent service.',
      footer_text: `© ${new Date().getFullYear()} Restaurant. All rights reserved.`,
      hero_title: 'Welcome to Our Restaurant',
      hero_subtitle: 'Delicious food delivered to your door',
      ordering_url: '#order',
      show_reviews: true,
      show_ratings: true,
      // All marketing sections visible by default
      showPopularItems: true,
      showOffers: true,
      showReviews: true,
      showWhyChooseUs: true,
      showStats: true,
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

// Helper functions for location data
export function formatLocationAddress(location: Location): string {
  return `${location.address}, ${location.city}, ${location.state} ${location.zip_code}`;
}

export function formatHours(day: string, location: Location): string {
  try {
    const hours = location.business_hours; // Changed from location.hours
    if (!hours || typeof hours !== 'object') return 'Closed';
    
    const dayHours = hours[day];
    if (!dayHours || dayHours.closed) return 'Closed';
    
    const formatTime = (time: string) => {
      if (!time || typeof time !== 'string') return '12:00 AM';
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes || '00'} ${ampm}`;
    };
    
    return `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;
  } catch (error) {
    console.error('Error formatting hours:', error);
    return 'Closed';
  }
}

export function isLocationOpenNow(location: Location): boolean {
  try {
    const hours = location.business_hours; // Changed from location.hours
    if (!hours || typeof hours !== 'object') return false;
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayHours = hours[currentDay]; // Using hours variable instead of location.hours
    
    if (!dayHours || dayHours.closed) return false;
    if (!dayHours.open || !dayHours.close) return false;
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  } catch (error) {
    console.error('Error checking if location is open:', error);
    return false;
  }
}

export function getTodayHours(location: Location): string {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return formatHours(today, location);
}
