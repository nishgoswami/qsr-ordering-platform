// ============================================================================
// LOCATION DATA - Synced with admin settings
// ============================================================================

export interface LocationHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxRate: number;
  phone: string;
  email: string;
  isActive: boolean;
  hours: LocationHours;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Demo data - Replace with Supabase queries in production
const locationsData: Location[] = [
  {
    id: '1',
    name: 'Main Location',
    address: '123 Main Street',
    city: 'City',
    state: 'CA',
    zip: '12345',
    country: 'United States',
    taxRate: 8.5,
    phone: '(555) 123-4567',
    email: 'main@restaurant.com',
    isActive: true,
    hours: {
      monday: { open: '11:00', close: '22:00', closed: false },
      tuesday: { open: '11:00', close: '22:00', closed: false },
      wednesday: { open: '11:00', close: '22:00', closed: false },
      thursday: { open: '11:00', close: '22:00', closed: false },
      friday: { open: '11:00', close: '22:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false },
    },
    coordinates: {
      lat: 37.7749,
      lng: -122.4194,
    },
  },
];

// Helper functions
export function getActiveLocations(): Location[] {
  return locationsData.filter(loc => loc.isActive);
}

export function getLocationById(id: string): Location | undefined {
  return locationsData.find(loc => loc.id === id);
}

export function getDefaultLocation(): Location {
  const activeLocations = getActiveLocations();
  return activeLocations[0] || locationsData[0];
}

export function formatLocationAddress(location: Location): string {
  return `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
}

export function formatHours(day: keyof LocationHours, location: Location): string {
  const dayHours = location.hours[day];
  if (dayHours.closed) return 'Closed';
  
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  return `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;
}

export function isLocationOpenNow(location: Location): boolean {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof LocationHours;
  const dayHours = location.hours[currentDay];
  
  if (dayHours.closed) return false;
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = dayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  return currentTime >= openTime && currentTime <= closeTime;
}

export function getTodayHours(location: Location): string {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof LocationHours;
  return formatHours(today, location);
}
